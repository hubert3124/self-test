/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/naming-convention */
import firebase from 'firebase/app';
import firestore = firebase.firestore;
import { Injectable } from '@angular/core';
import { AngularFirestore, CollectionReference, QueryFn } from '@angular/fire/firestore';

import { WHERE } from '../0/common';
import { sleep, diffTimestamp } from '../2/util';
import { LogService } from '../4/log.service';

export type CollectionPath =
  'site' |
  'room' |
  'unifiedOrder' |
  'unifiedDelivery' |
  'unifiedDeliveryShop' |
  'unifiedMenu' |
  'combinenetDelivery' |
  'barogoDelivery' |
  'logiallDelivery' |
  'mannaDelivery' |
  'zendeliDelivery' |
  'vroongPosDelivery' |
  'baeminAppListOrder' |
  'baeminAppDetailOrder' |
  'yogiyoAppListOrder' |
  'coupangeatsAppOrder' |
  'baeminCeoOperatingAdCampaign' |
  'baeminCeoDeliveryRegion' |
  'baeminUserDetailShop' |
  'baeminUserReview' |
  'baeminAccount' |
  'coupangeatsAccount' |
  'yogiyoAccount' |
  'run2uAccount' |
  'spidorAccount' |
  'barogoAccount' |
  'logiallAccount' |
  'mannaAccount' |
  'zendeliAccount' |
  'notice' |
  'deliveryArea' |
  'replySms' |
  'contact' |
  'processStatus' |
  'ghokirunRider' |
  'ghokirunRiderStatus' |
  'logOrder'
  ;

/**
 * Node의 FirebaseManager를 가져왔다.
 */
@Injectable({
  providedIn: 'root'
})
export class FirebaseManagerService {
  // 최대 500개로 되어 있지만
  // serverTimestamp() 는 1이 더 추가된다고 한다.
  // 그래서 안전하게 150으로 한다.
  // refer: https://github.com/firebase/firebase-admin-node/issues/456
  readonly MaxBatchNum = 150;
  private batch?: firestore.WriteBatch;
  private batchCount = 0;

  constructor(
    private db: AngularFirestore,
    private logService: LogService
  ) {
  }

  getFirestoreRandomId(collectionPath: CollectionPath) {
    const docRef = this.db.firestore.collection(collectionPath).doc();
    const id = docRef.id;

    return id;
  }

  async runFirestoreAPI<T>(caller: string, api: () => Promise<T>) {
    const maxTry = 3;
    let countTry = 0;

    while (countTry < maxTry) {
      try {
        // 없으면 만들고 있으면 덮어쓴다.
        countTry++;
        this.logService[countTry < 2 ? 'info' : 'error'](`[${caller}] countTry = ${countTry}, diffTime = ${diffTimestamp(caller)}`);

        // DEADLINE_EXCEEDED 방지를 위해
        // await timeMargin(caller, 500);
        return api();
        // await docRef.set(doc, { merge: bMerge });
        // 성공한 경우에는 루프를 빠져나간다.
      } catch (error) {
        // 마지막 try에서의 throw 처리는 아래에서 수행한다.
        // 2: "details": "Stream removed"
        // 4: DEADLINE_EXCCEDED
        // 10: "details": "Too much contention on these documents. Please try again."
        // 13: "details": ""
        // 13: "details": "An internal error occurred."
        // 14: "details": "The service is temporarily unavailable. Please retry with exponential backoff."
        // 14: "details": "Transport closed"
        // 14: "details": "GOAWAY received"
        if (countTry < maxTry && [2, 4, 10, 13, 14].includes(error.code)) {
          this.logService.error(`[${caller}] error at countTry = ${countTry}, error = ${JSON.stringify(error, undefined, 2)}`);
          await sleep(2000);
          continue;
        }

        this.logService.error(`[${caller}] Give Up. Should the page be reloaded???. countTry = ${countTry}, error = ${JSON.stringify(error, undefined, 2)}`);
        throw error;
      }
    }

    // typescript에서 return undefined로 인지하지 못 하도록
    throw new Error('Unexpected reach');
  }

  /**
   * 지정한 collection에 doc을 추가한다
   * documennt Id는 자동생한다.
   *
   * bMerge의 경우에 doc이 다음과 같다면
   * ```
   * k1: {
   *  k2: v1
   * }
   * ```
   * k1을 전체 업데이트 하는 것이 아니라 k1.k2만을 업데이트 하거나 추가한다는 사실을 명심해야 한다.
   * k1.k3와 같은 키가 있다면 유지되는 것이다. path의 개념으로 이해해야 한다.
   *
   * 특정 필드를 삭제하려면 다음과 같은 특별한 값을 지정해야 한다.
   * `deletingKey: admin.firestore.FieldValue.delete()`
   *
   * refer : https://cloud.google.com/nodejs/docs/reference/firestore/0.20.x/DocumentReference
   *
   * - options.idAsField = false: false => id doc의 id로 사용, true => id는 doc의 필드를 가리킨다.
   * - options.bMerge = true: true이면 지정한 필드만 업데이트한다.
   * - options.addMetadata = true: _id, _timeUpdate 필드를 자동으로 생성한다.
   * - options.bBatch = false: batch에 추가한다. batchStart(), batchEnd()와 함께 사용한다.
   */
  async setDoc(collectionPath: CollectionPath, id: string | undefined, doc: firestore.DocumentData, options?: {
    idAsField?: boolean;
    bMerge?: boolean;
    addMetadata?: boolean;
    bBatch?: boolean;
  }) {
    const fnName = 'setDoc';

    const { idAsField = false, bMerge = true, addMetadata = true, bBatch = false } = options ?? {};

    if (idAsField && (id === undefined || doc[id] === undefined)) {
      throw new TypeError(`'${id}' field does not exist in doc`);
    }

    const docRef = id === undefined
      ? this.db.firestore.collection(collectionPath).doc() :
      idAsField
        ? this.db.firestore.doc(`${collectionPath}/${doc[id]}`)
        : this.db.firestore.doc(`${collectionPath}/${id}`);

    this.recoverTimestamp(doc);

    // metadata 추가
    if (addMetadata) {
      // doc에 timeCreate가 있다면 doc의 timeCreate가 우선 순위를 갖는다.
      doc[`_time${bMerge ? 'Merge' : 'Set'}`] = firestore.FieldValue.serverTimestamp();
      doc._id = docRef.id;
    }

    try {
      if (bBatch) {
        this.batch.set(docRef, doc, { merge: bMerge });
        await this.batchAdded();
      } else {
        await this.runFirestoreAPI(fnName, () => docRef.set(doc, { merge: bMerge }));
      }
    } catch (error) {
      this.logService.error(`[${fnName}] 예외 발생, error = ${JSON.stringify(error, undefined, 2)}`);
      throw error;
    }

    return docRef.id;
  }

  /**
   * 동일 document path에 이미 존재하는 경우에는 에러
   *
   * @params collectionPath
   * @params id
   * @params doc
   * @params options
   * - idAsField = false: false => id doc의 id로 사용, true => id는 doc의 필드를 가리킨다.
   * - addMetadata = true: _id, _timeCreate 필드를 자동으로 생성한다.
   * - bBatch = false: batch에 추가한다. batchStart(), batchEnd()와 함께 사용한다.
   */
  public async createDoc(collectionPath: CollectionPath, id: string | undefined, doc: firestore.DocumentData, options?: {
    idAsField?: boolean;
    addMetadata?: boolean;
    bBatch?: boolean;
  }) {
    const fnName = 'createDoc';
    const { idAsField = false, addMetadata = true, bBatch = false } = options ?? {};

    if (idAsField && (id === undefined || doc[id] === undefined)) {
      throw new TypeError(`'${id}' field does not exist in doc`);
    }

    const docRef = id === undefined
      ? this.db.firestore.collection(collectionPath).doc() :
      idAsField
        ? this.db.firestore.doc(`${collectionPath}/${doc[id]}`)
        : this.db.firestore.doc(`${collectionPath}/${id}`);

    this.recoverTimestamp(doc);

    // metadata 추가
    if (addMetadata) {
      doc._id = docRef.id;
      doc._timeCreate = firestore.FieldValue.serverTimestamp();
    }

    const getDoc = await docRef.get();

    if (getDoc.exists) {
      this.logService.error(`[${fnName}] ${collectionPath}:${JSON.stringify(doc)}, 이미 존재하는 Doc`);
      // throw new Error('이미 존재하는 doc');
    }

    try {
      // 혹시 이미 존재하는 doc이면 merge 해준다.
      if (bBatch) {
        this.batch.set(docRef, doc, { merge: true });
        await this.batchAdded();
      } else {
        await this.runFirestoreAPI(fnName, () => docRef.set(doc, { merge: true }));
      }
    } catch (error) {
      this.logService.error(`[${fnName}] 예외 발생, error = ${JSON.stringify(error, undefined, 2)}`);
      throw error;
    }

    return docRef.id;
  }

  /**
   * 이미 document가 존재해야 한다.
   * document 전체를 변경하는 것이 아니라
   * 겹치지 않는 최상위 필드는 유지한다.
   *
   * - options.idAsField = false: false => id doc의 id로 사용, true => id는 doc의 필드를 가리킨다.
   * - options.addMetada = true: _id, _timeUpdate 필드를 자동으로 생성한다.
   * - options.bBatch = false: batch에 추가한다. batchStart(), batchEnd()와 함께 사용한다.
   */
  async updateDoc(collectionPath: CollectionPath, id: string, doc: firestore.UpdateData, options?: {
    idAsField?: boolean;
    addMetadata?: boolean;
    bBatch?: boolean;
  }) {
    const fnName = 'updateDoc';

    const { idAsField = false, addMetadata = true, bBatch = false } = options ?? {};

    if (id === undefined) {
      throw new TypeError(`id must exist`);
    }

    const docRef = idAsField
      ? this.db.firestore.doc(`${collectionPath}/${doc[id]}`)
      : this.db.firestore.doc(`${collectionPath}/${id}`);

    this.recoverTimestamp(doc);

    // metadata 추가
    if (addMetadata) {
      doc._id = docRef.id;
      doc._timeUpdate = firestore.FieldValue.serverTimestamp();
    }

    try {
      if (bBatch) {
        this.batch?.update(docRef, doc);
        await this.batchAdded();
      } else {
        await this.runFirestoreAPI(fnName, () => docRef.update(doc));
      }
    } catch (error) {
      this.logService.error(`[${fnName}] 예외 발생, error = ${JSON.stringify(error, undefined, 2)}`);
      throw error;
    }

    return docRef.id;
  }

  /**
   * doc를 읽어서 응답한다.
   * 못 찾으면 Promise<undefined>를 리턴한다.
   *
   * @param docPath ex) 'unifiedOrder/1234'
   */
  async getDoc<T>(docPath: string) {
    const fnName = 'getDoc';

    try {
      const docRef = this.db.doc<T>(docPath);
      const documentSnapshot = await this.runFirestoreAPI(fnName, () => docRef.get().toPromise());

      // exists는 document가 존재하고 내용도 있다는 뜻이다.
      if (documentSnapshot.exists) {
        const doc = documentSnapshot.data();
        // 발생할 확률이 0이지만 혹시나 해서 추가해 본다.
        if (doc === undefined) {
          throw new Error('No doc');
        }

        return doc;
      } else {
        return undefined;
      }
    } catch (error) {
      this.logService.error(`[${fnName}] 예외 발생, error = ${JSON.stringify(error, undefined, 2)}`);
      throw error;
    }
  }

  /**
   * 해당 collection의 조건에 맞는 docs 배열을  리턴한다.
   */
  public async getDocsArrayWithWhere<T>(
    collectionPath: CollectionPath,
    wheres: WHERE[],
    options?: {
      // selectField?: string[], // Node AdminSDK만 가능
      sortKey?: string; // ex. '_timeCreate'
      orderBy?: 'asc' | 'desc';
    }) {
    const fnName = 'getDocsArrayWithWhere';

    try {
      const querySnapshot = await this.querySnapshotWithWhere<T>(fnName, collectionPath, wheres, options);

      return querySnapshot.docs.map(queryDocumentSnapshot => queryDocumentSnapshot.data());
    } catch (error) {
      this.logService.error(`[${fnName}] 예외 발생, error = ${JSON.stringify(error, undefined, 2)}`);
      throw error;
    }
  }

  /**
   * 해당 collection의 조건에 맞는 docs를 리턴한다.
   *
   * 응답 형태는 docId를 key로 하는 Object가 된다.
   */
  public async getDocsWithWhere<T>(
    collectionPath: CollectionPath,
    wheres: WHERE[],
    options?: {
      // selectField?: string[], // Node AdminSDK만 가능
      sortKey?: string; // ex. '_timeCreate'
      orderBy?: 'asc' | 'desc';
    }) {
    const fnName = 'getDocsWithWhere';

    try {
      const querySnapshot = await this.querySnapshotWithWhere<T>(fnName, collectionPath, wheres, options);

      return querySnapshot.docs.reduce((docs, queryDocumentSnapshot) => {
        docs[queryDocumentSnapshot.id] = queryDocumentSnapshot.data();
        return docs;
      }, {} as firestore.DocumentData);
    } catch (error) {
      this.logService.error(`[${fnName}] 예외 발생, error = ${JSON.stringify(error, undefined, 2)}`);
      throw error;
    }
  }

  public batchStart() {
    this.batch = this.db.firestore.batch();
    this.batchCount = 0;
  }

  /**
   * this.batch에 추가한 후에 반드시 실행한다.
   */
  public async batchAdded() {
    const fnName = 'batchAdded';

    if (this.batch === undefined) {
      this.logService.error(`[${fnName}] No this.batch. Run batchStart() first.`);
      return false;
    }

    this.batchCount++;

    if (this.batchCount >= this.MaxBatchNum) {
      this.logService.info(`[${fnName}] batchCount == ${this.batchCount} => Run batch.commit()`);
      await this.batch.commit();

      // 비웠으니 다시 시작한다.
      this.batchStart();
    }

    return undefined;
  }

  async batchEnd() {
    const fnName = 'batchEnd';

    if (this.batch === undefined) {
      this.logService.error(`[${fnName}] No this.batch. Run batchStart() first.`);
      return false;
    }

    if (this.batchCount > 0) {
      this.logService.info(`[${fnName}] batchCount == ${this.batchCount} => Run batch.commit()`);
      this.batchCount = 0;
      await this.batch.commit();
    } else {
      this.logService.info(`[${fnName}] batchCount == ${this.batchCount} => NOOP`);
    }

    return undefined;
  }

  /**
   * doc를 삭제한다.
   *
   * @param docPath ex) 'unifiedOrder/1234'
   */
  public deleteDoc(docPath: string) {
    return this.db.doc(docPath).delete();
  }

  /**
   * 간단한 where 조건과 orderBy 조건으로 조회한 valueChanges Observable을 반환
   *
   * ex
   * - observe('unifiedOrder', [['site', '==', 'gk-kangnam']])
   * - observe('unifiedOrder', [['site', '==', 'gk-kangnam']], { sortKey: 'orderDate', orderBy: 'desc'})
   * - observe('unifiedOrder', [['site', '==', 'gk-kangnam']], { sortKey: 'orderDate', orderBy: 'desc', startValue: '...'})
   * - observe('unifiedOrder', [['site', '==', 'gk-kangnam']], { sortKey: 'orderDate', orderBy: 'desc', startValue: '...', endValue: '...'})
   *
   * @param collectionPath ex) 'unifiedOrder'
   * @param wheres 조건 배열
   * @param options
   * - sortKey: 정렬할 필드명
   * - orderBy: 정렬(오름차, 내림차)
   * - startValue, endValue: 조회 시작~끝 조건
   */
  public observe<T>(collectionPath: CollectionPath, wheres: WHERE[], options?: {
    sortKey: string;
    orderBy: 'asc' | 'desc';
    startValue?: any;
    endValue?: any;
  }) {
    const queryFn: QueryFn = ref => wheres.reduce((q, where: WHERE) =>
      q.where(where[0], where[1] as firestore.WhereFilterOp, where[2]),
      this.defaultQueryFn(ref, options));

    console.log(`FirebaseManagerService ${collectionPath}::observe ${options?.startValue ? 'from ' + options.startValue : ''} ${options?.endValue ? 'to ' + options.endValue : ''}`);

    const collectionRef = this.db.collection<T>(collectionPath, queryFn);
    const observable = collectionRef.valueChanges();

    return observable;
  }

  /**
   * getDocsWithWheres와 getDocsArrayWithWheres의 공통 부분
   */
  private querySnapshotWithWhere<T>(
    fnName: string,
    collectionPath: CollectionPath,
    wheres: WHERE[],
    options?: {
      // selectField?: string[], // Node AdminSDK만 가능
      sortKey?: string; // ex. '_timeCreate'
      orderBy?: 'asc' | 'desc';
    }) {
    // 1. orderBy 적용하고 wheres 조건 적용
    const queryFn: QueryFn = ref => wheres.reduce(
      (query, where: WHERE) => query.where(where[0], where[1] as firestore.WhereFilterOp, where[2]),
      (options?.sortKey && options?.orderBy) ? ref.orderBy(options.sortKey, options.orderBy) : ref
    );

    // 2. 조회하고
    const collectionRef = this.db.collection<T>(collectionPath, queryFn);
    return this.runFirestoreAPI(fnName, () => collectionRef.get().toPromise());
  }

  /**
   * timestamp 필드로 되어 있는 값은 받으면 seconds와 nanoseconds 필드로 변환된다.
   * 이 값을 이용해서 다시 firestore.Timestamp()로 복구한다.
   * 조사 필드는 _time으로 시작하는 4개다.
   */
  private recoverTimestamp(doc: firestore.UpdateData) {
    ['Create', 'Update', 'Set', 'Merge'].map(command => `_time${command}`).forEach(key => {
      const value = doc[key];
      if (value) {
        if (value instanceof Object && value.seconds !== undefined && value.nanoseconds !== undefined) {
          doc[key] = new firestore.Timestamp(value.seconds, value.nanoseconds).toDate();
        }
      }
    });

    return doc;
  }

  private defaultQueryFn(ref: CollectionReference<firestore.DocumentData>, options?: {
    sortKey: string;
    orderBy: 'asc' | 'desc';
    startValue?: any;
    endValue?: any;
  }) {
    const { sortKey, orderBy, startValue, endValue } = options ?? {};

    if (options?.startValue && options?.endValue) {
      // 조회 start~end 조건이 모두 있는 경우
      return ref.orderBy(sortKey, orderBy)
      [orderBy === 'asc' ? 'startAt' : 'endAt'](startValue)
      [orderBy === 'asc' ? 'endAt' : 'startAt'](endValue);
    } else if (options?.startValue) {
      // 조회 시작 조건만 있는 경우
      return ref.orderBy(sortKey, orderBy)[orderBy === 'asc' ? 'startAt' : 'endAt'](startValue);
    } else if (options?.sortKey) {
      // orderBy 조건만 있는 경우
      return ref.orderBy(sortKey, orderBy);
    } else {
      // 정렬 없는 경우
      return ref;
    }
  }
}
