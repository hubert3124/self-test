import { inspect } from 'util';
import admin from 'firebase-admin';
import { WrapError } from '../0/error';
import { logger } from '../1/logger';
import { sleep, diffTimestamp, timeMargin } from '../2/util';

interface Doc {
  [key: string]: any;
}

/**
 * timestamp 필드로 되어 있는 값은 받으면 _seconds와 _nanoseconds 필드로 변환된다.
 * 이 값을 이용해서 다시 firestore.Timestamp()로 복구한다.
 * 조사 필드는 _time으로 시작하는 4개다.
 *
 * @param {*} doc
 * @returns
 */
function recoverTimestamp(doc: Doc) {
  ['Create', 'Update', 'Set', 'Merge'].map(command => `time${command}`).forEach(key => {
    const value = doc[key];
    if (value) {
      if (value instanceof Object && value._seconds !== undefined && value._nanoseconds !== undefined) {
        doc[key] = new admin.firestore.Timestamp(value._seconds, value._nanoseconds);
      }
    }
  });

  return doc;
}

/**
 * 여러 곳의 firebase 프로젝트를 동시에 지원하기 위해
 * 클래스로 만들다.
 *
 * @export
 * @class FirebaseManager
 */
export class FirebaseManager {
  private static _instances: {
    [firebaseProject: string]: FirebaseManager;
  } = {};

  /**
   *
   *
   * @static
   * @param {string} firebaseProject ex. toe-dev | toe-prod | ghost-order
   * @returns
   * @memberof FirebaseManager
   */
  static getInstance(firebaseProject: string) {
    if (FirebaseManager._instances[firebaseProject] == undefined) {
      FirebaseManager._instances[firebaseProject] = new FirebaseManager(firebaseProject);
    }

    return FirebaseManager._instances[firebaseProject];
  }

  static async runFirestoreAPI<T>(caller: string, api: () => Promise<T>) {
    const maxTry = 3;
    let countTry = 0;

    while (countTry < maxTry) {
      try {
        // 없으면 만들고 있으면 덮어쓴다.
        countTry++;
        logger.info(`[${caller}] diffTime = ${diffTimestamp(caller)}`);

        // DEADLINE_EXCEEDED 방지를 위해
        // await timeMargin(caller, 500);
        return await api();
        // await docRef.set(doc, { merge: bMerge });
        // 성공한 경우에는 루프를 빠져나간다.
      } catch (err) {
        // 마지막 try에서의 throw 처리는 아래에서 수행한다.
        if (countTry < maxTry && err.code === 4 /* DEADLINE_EXCCEDED */) {
          logger.error(
            `[${caller}] countTry = ${countTry}, error = ${JSON.stringify(
              err,
              undefined,
              2,
            )}`,
          );
          await sleep(3000);
          continue;
        }

        logger.error(
          `[${caller}] countTry = ${countTry}, error = ${JSON.stringify(
            err,
            undefined,
            2,
          )}`,
        );
        throw new WrapError(err);
      }
    }

    // typescript에서 return undefined로 인지하지 못 하도록
    logger.error(`[${caller}] Unexpected Reach`);
    throw new Error('Unexpected reach');
  }

  private app: admin.app.App;
  firebaseProject: string;

  // 최대 500개로 되어 있지만
  // serverTimestamp() 는 1이 더 추가된다고 한다.
  // 그래서 안전하게 150으로 한다.
  // refer: https://github.com/firebase/firebase-admin-node/issues/456
  readonly MaxBatchNum = 150;

  private batch?: FirebaseFirestore.WriteBatch;
  batchCount = 0;

  constructor(firebaseProject: string) {
    const serviceAccount = require(`../../../config/firebase-account-${firebaseProject}`);

    this.app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
    }, firebaseProject);

    this.firebaseProject = firebaseProject;
  }

  get db() {
    return this.app.firestore();
  }

  /**
   * 지정한 collection에 doc을 추가한다
   * documennt Id는 자동생한다.
   *
   * bMerge의 경우에 doc이 다음과 같다면
   * k1: {
   *  k2: v1
   * }
   * k1을 전체 업데이트 하는 것이 아니라 k1.k2만을 업데이트 하거나 추가한다는 사실을 명심해야 한다.
   * k1.k3와 같은 키가 있다면 유지되는 것이다. path의 개념으로 이해해야 한다.
   *
   * 특정 필드를 삭제하려면 다음과 같은 특별한 값을 지정해야 한다.
   * deletingKey: admin.firestore.FieldValue.delete()
   *
   * refer : https://cloud.google.com/nodejs/docs/reference/firestore/0.20.x/DocumentReference
   *
   * @param {string} collectionPath
   * @param {null | string} id
   * @param {Doc} doc
   * @param {boolean} useIdField doc[id]에서 true이면 지정한 필드만 업데이트한다.
   * @param {boolean} bMerge true이면 지정한 필드만 업데이트한다.
   * @returns document Id
   */
  async setDoc(collectionPath: string, id: string | undefined, doc: Doc, useIdField = false, bMerge = false, addMetadata = true, bBatch = false) {
    const fnName = 'setDoc';

    if (useIdField && (id == undefined || doc[id] == undefined)) {
      throw new TypeError(`'${id}' field does not exist in doc`);
    }

    const db = this.app.firestore();
    const collectionRef = db.collection(collectionPath);
    const docRef =
      id == undefined
        ? collectionRef.doc()
        : useIdField
          ? collectionRef.doc(doc[id])
          : collectionRef.doc(id);

    recoverTimestamp(doc);

    // metadata 추가
    if (addMetadata) {
      doc['_id'] = docRef.id;
      // doc에 timeCreate가 있다면 doc의 timeCreate가 우선 순위를 갖는다.
      doc[`_time${bMerge ? 'Merge' : 'Set'}`] = admin.firestore.FieldValue.serverTimestamp();
    }

    try {
      if (bBatch) {
        this.batch!.set(docRef, doc, { merge: bMerge });
        await this.batchAdded();
      } else {
        await FirebaseManager.runFirestoreAPI(fnName, () => docRef.set(doc, { merge: bMerge }));
      }
    } catch (err) {
      throw new WrapError(err);
    }

    return docRef.id;
  }

  /**
   * 동일 document path에 이미 존재하는 경우에는 에러
   *
   * @param collectionPath
   * @param id
   * @param doc
   * @param useIdField
   */
  async createDoc(collectionPath: string, id: string | undefined, doc: Doc, useIdField = false, addMetadata = true, bBatch = false) {
    const fnName = 'createDoc';

    if (useIdField && (id == undefined || doc[id] == undefined)) {
      throw new TypeError(`'${id}' field does not exist in doc`);
    }

    const db = this.app.firestore();
    const collectionRef = db.collection(collectionPath);
    const docRef =
      id == undefined
        ? collectionRef.doc()
        : useIdField
          ? collectionRef.doc(doc[id])
          : collectionRef.doc(id);

    recoverTimestamp(doc);

    // metadata 추가
    if (addMetadata) {
      doc['_id'] = docRef.id;
      doc['_timeCreate'] = admin.firestore.FieldValue.serverTimestamp();
    }

    try {
      if (bBatch) {
        this.batch!.create(docRef, doc);
        await this.batchAdded();
      } else {
        try {
          await FirebaseManager.runFirestoreAPI(fnName, () => docRef.create(doc));
        } catch (err) {
          let error = err;
          if (error instanceof WrapError) {
            logger.warn(`[${err.constructor.name}] ${err.stack}`);
            error = error.unwrapAll();
          }

          // create에서 에러가 발생했다면 set으로 재시도한다.
          // 의도치 않은 경우이므로 로그에 남기도록 한다.
          // firestore의 에러에 대한 별도의 타입을 찾지 못해서 일단 code, details 값으로 판단한다.
          if (error.code === 6 && error.details.match(/^Document already exists/)) {
            logger.error(`[${fnName}] create fail (already exists) => retry using set`);
            await FirebaseManager.runFirestoreAPI(fnName, () => docRef.set(doc));
          }
        }
      }
    } catch (err) {
      throw new WrapError(err);
    }

    return docRef.id;
  }

  /**
   * 이미 document가 존재해야 한다.
   * document 전체를 변경하는 것이 아니라
   * 겹치지 않는 최상위 필드는 유지한다.
   *
   * @param collectionPath
   * @param id
   * @param doc
   * @param useIdField
   */
  async updateDoc(collectionPath: string, id: string | undefined, doc: Doc, useIdField = false, addMetadata = true, bBatch = false) {
    const fnName = 'updateDoc';

    if (id == undefined) {
      throw new TypeError(`id must exist`);
    }

    const db = this.app.firestore();
    const collectionRef = db.collection(collectionPath);
    const docRef = useIdField
      ? collectionRef.doc(doc[id])
      : collectionRef.doc(id);

    recoverTimestamp(doc);

    // metadata 추가
    if (addMetadata) {
      doc['_id'] = docRef.id;
      doc['_timeUpdate'] = admin.firestore.FieldValue.serverTimestamp();
    }

    try {
      if (bBatch) {
        this.batch!.update(docRef, doc);
        await this.batchAdded();
      } else {
        await FirebaseManager.runFirestoreAPI(fnName, () => docRef.update(doc));
      }
    } catch (err) {
      throw new WrapError(err);
    }

    return docRef.id;
  }

  /**
   * document를 삭제한다.
   * 해당 문서가 존재하지 않은 경우에도 응답은 똑같다.
   *
   * @param docPath
   */
  async deleteDoc(docPath: string, bBatch = false) {
    const fnName = 'deleteDoc';

    const db = this.app.firestore();
    const docRef = db.doc(docPath);

    try {
      if (bBatch) {
        this.batch!.delete(docRef);
        await this.batchAdded();
      } else {
        // WriteResult
        await FirebaseManager.runFirestoreAPI(fnName, () => docRef.delete());
      }
    } catch (err) {
      throw new WrapError(err);
    }
  }

  /**
   * 해당 doc 한 개를 포함하는 docs를 리턴한다.
   * (from: honsikdang-ops)
   * docs 오브젝트로 감싸는 이유는 restore 형식과 호환을 유지하기 위함이다.
   *
   * @param {string} docPath
   * @param {boolean} bWrapWithId { "docId" = doc }의 형태가 되도록 출력한다.
   */
  async getDoc(docPath: string, bWrapWithId = false) {
    const fnName = 'getDoc';

    try {
      const db = this.app.firestore();

      const docRef = db.doc(docPath);
      const documentSnapshot = await FirebaseManager.runFirestoreAPI(fnName, () => docRef.get());

      let result: Doc = {};

      // exists는 document가 존재하고 내용도 있다는 뜻이다.
      if (documentSnapshot.exists) {
        const docId = documentSnapshot.id;
        const doc = documentSnapshot.data();
        if (doc === undefined) {
          throw new Error('No doc');
        } else {
          if (bWrapWithId) {
            result[docId] = doc;
          } else {
            result = doc;
          }

          return result;
        }
      }
    } catch (err) {
      throw new WrapError(err);
    }
  }

  /**
   * 해당 collection의 모든 docs를 리턴한다.
   *
   * @param {*} collectionPath
   */

  /**
   * 특정 컬렉션에 속한 docs를 리턴한다.
   * 지정한 날짜 범위에 속한 docs맡 가져온다. timeField로 시간 필드를 지정한다.
   *
   * @param {string} collectionPath
   * @param {string} timeField
   * @param {string} fromDate  '2018-12-12T00:00:00+0900'
   * @param {string} toDate
   */
  async getDocsWithTimeRange(
    collectionPath: string,
    timeField: string,
    fromDate: string,
    toDate: string,
  ) {
    try {
      const db = this.app.firestore();

      const query = db
        .collection(collectionPath)
        .where(timeField, '>=', fromDate)
        .where(timeField, '<=', toDate);
      const querySnapshot = await query.get();

      const docs: {
        [docId: string]: Doc;
      } = {};

      // console.dir(querySnapshot);
      querySnapshot.forEach(queryDocumentSnapshot => {
        // console.log('----- documentSnapshot');
        // console.dir(queryDocumentSnapshot);
        const docId = queryDocumentSnapshot.id;
        const doc = queryDocumentSnapshot.data();

        // const orderedDoc = reorderDoc(doc);
        docs[docId] = doc;
      });

      return docs;
    } catch (err) {
      throw new WrapError(err);
    }
  }

  batchStart() {
    const db = this.app.firestore();

    this.batch = db.batch();
    this.batchCount = 0;
  }

  /**
   * this.batch에 추가한 후에 반드시 실행한다.
   */
  async batchAdded() {
    const fnName = 'batchAdded';

    if (this.batch === undefined) {
      logger.error(`[${fnName}] No this.batch. Run batchStart() first.`);
      return false;
    }

    this.batchCount++;

    if (this.batchCount >= this.MaxBatchNum) {
      logger.info(`[${fnName}] batchCount == ${this.batchCount} => Run batch.commit()`);
      await this.batch.commit();

      // 비웠으니 다시 시작한다.
      this.batchStart();
    }
  }

  async batchEnd() {
    const fnName = 'batchEnd';

    if (this.batch === undefined) {
      logger.error(`[${fnName}] No this.batch. Run batchStart() first.`);
      return false;
    }

    if (this.batchCount > 0) {
      logger.info(`[${fnName}] batchCount == ${this.batchCount} => Run batch.commit()`);
      this.batchCount = 0;
      await this.batch.commit();
    } else {
      logger.info(`[${fnName}] batchCount == ${this.batchCount} => NOOP`);
    }
  }

  /**
   * docPath에 포함된 collection 목록을 리턴한다.
   *
   * @param {string} docPath
   */
  async listCollections(docPath: string, showFullPath = false) {
    const fnName = 'listCollections';

    try {
      const db = this.app.firestore();

      const collectionReferences =
        docPath === '/'
          ? await FirebaseManager.runFirestoreAPI(fnName, () => db.listCollections())
          : await FirebaseManager.runFirestoreAPI(fnName, () => db.doc(docPath).listCollections());

      return collectionReferences.map(collectionReference => showFullPath ? collectionReference.path : collectionReference.id);
    } catch (err) {
      throw new WrapError(err);
    }
  }

/**
 * Collection에 포함된 document id를 리턴한다.
 * onlyEmpty가 true이면 collection만을 포함한 document를 리턴한다.
 *
 * @export
 * @param {string} collectionPath
 * @param {boolean} [onlyEmpty=false]
 * @returns
 */
async listDocuments(collectionPath: string, showFullPath = false, onlyEmpty = false) {
  const fnName = 'listDocuments';

  try {
    const db = this.app.firestore();

    const documentReferences = await db.collection(collectionPath).listDocuments();

    // exists 값을 얻기 위해서는 DocumentSnapshot이 필요하다.
    // 내용은 필요없으므로 fieldMask를 이용해서 내용을 받아오지는 않는다.
    const documentSnapshots = await db.getAll(...documentReferences, { fieldMask: [] });

    const docIds: string[] = [];

    for (const documentSnapshot of documentSnapshots) {
      const path = showFullPath ? documentSnapshot.ref.path : documentSnapshot.id;
      if (documentSnapshot.exists) {
        if (onlyEmpty === false) {
          docIds.push(path);
        }
        // console.log(`with data: ${documentSnapshot.id}`);
      } else {
        docIds.push(path);
        // console.log(`empty    : ${documentSnapshot.id}`);
      }
    }

    return docIds;
    //
    // Sample 1. 내용이 있는 document 목록을 얻는 코드
    //
    // {
    //   const querySnapshot = await db.collection(collectionPath).get();

    //   console.log(`size = ${querySnapshot.size}`);
    //   console.log(`length = ${querySnapshot.docs.length}`);

    //   querySnapshot.forEach(queryDocumentSnapshot => {
    //     console.log(`path = ${queryDocumentSnapshot.ref.path}`);
    //   });
    // }

    //
    // Sample 2. stream() 함수를 이용해서 내용이 있는 document 목록을 얻는 방법
    //
    // {
    //   return await new Promise<string[]>((resolve) => {
    //     const docPaths: string[] = [];
    //     db.collection(collectionPath).stream().on('data', (queryDocumentSnapshot: QueryDocumentSnapshot) => {
    //       // console.log(queryDocumentSnapshot.ref.path);
    //       docPaths.push(queryDocumentSnapshot.ref.path);
    //     }).on('end', () => {
    //       resolve(docPaths);
    //     });
    //   });
    // }
  } catch (err) {
    throw new WrapError(err);
  }
}

monitorCollection(next: (docs: { [key: string]: Doc; }) => void, collectionPath: string, fieldPath ?: string, opStr ?: FirebaseFirestore.WhereFilterOp, value ?: string) {
    const fnName = 'monitorCollection';

    try {
      const db = this.app.firestore();

      const collectionRef = db.collection(collectionPath);
      const query1 = (fieldPath && opStr && value) ? collectionRef.where(fieldPath, opStr, value) : collectionRef;
      query1.onSnapshot(querySnapshot => {
        for (const docChange of querySnapshot.docChanges()) {
          const queryDocumentSnapshot = docChange.doc;
          const doc = queryDocumentSnapshot.data();

          switch (docChange.type) {
            case 'added':
              logger.debug(`[${fnName}] '${queryDocumentSnapshot.id}' added to ${collectionPath}`);
              break;
            case 'modified':
              logger.debug(`[${fnName}] '${queryDocumentSnapshot.id}' modified at ${collectionPath}`);
              break;
            case 'removed':
              logger.debug(`[${fnName}] '${queryDocumentSnapshot.id}' removed from ${collectionPath}`);
              break;
            default:
              logger.error(`[${fnName}] error on onSnapshot()`);
              break;
          }

        }
        const docs = querySnapshot.docs.reduce((acc, queryDocumentSnapshot) => {
          acc[queryDocumentSnapshot.id] = queryDocumentSnapshot.data();
          return acc;
        }, {} as { [key: string]: Doc; });

        next(docs);
      }, error => {
        logger.error(`[${fnName}] error on onSnapshot() : ${inspect(error, false, 5, true)}`);
      });
    } catch (err) {
      throw new WrapError(err);
    }
  }
}
