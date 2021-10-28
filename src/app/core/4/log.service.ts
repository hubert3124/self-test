import firebase from 'firebase/app';
import firestore = firebase.firestore;
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import { instanceId } from '../1/common';
import { AddressService } from '../1/address.service';
import { UtilService } from '../1/util.service';
import {
  Log,
  LogLevel
} from '../2/schema-message';
import { LogOrderDoc } from '../2/schema';
import { UserService } from '../3/user.service';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  constructor(
    private db: AngularFirestore,
    private addressService: AddressService,
    private utilService: UtilService,
    private userService: UserService,
  ) {
    console.log(`log instance ID = ${instanceId}`);
  }

  /**
   * @param email: 아직 userService에서 정보를 못 찾아오는 단계에세 사용한다.
   */
  private send(level: LogLevel, message: string, email?: string) {
    const collectionPath = 'log';

    // message Id는 firestore가 제공하는 Id를 이용한다.
    const docRef = this.db.firestore.collection(collectionPath).doc();
    const docId = docRef.id;

    const doc: Log = {
      _id: docId,
      _timeCreate: firestore.FieldValue.serverTimestamp() as firestore.Timestamp,
      from: {
        class: 'omc',
        instanceNo: instanceId,
        account: email ? email : this.userService.user?.email ?? '',
      },
      level,
      message
    };

    return this.db.doc<Log>(docRef).set(doc);
  }

  public debug(message: string, email?: string) {
    this.send('debug', message, email);
  }
  public info(message: string, email?: string) {
    this.send('info', message, email);
  }
  public warn(message: string, email?: string) {
    this.send('warn', message, email);
  }
  public error(message: string, email?: string) {
    this.send('error', message, email);
  }

  /**
   * Slack #warning 채널에 알림을 보내게 된다.
   */
  public withToastrWarn(message: string, title?: string, timeout?: number) {
    this.utilService.toastrWarning(message, title, timeout);
    return this.send('warn', `${title ? title + ': ' : ''} ${message}`);
  }

  /**
   * Slack #toe 채널에 알림을 보내게 된다.
   */
  public withToastrError(message: string, title?: string, timeout?: number) {
    this.utilService.toastrError(message, title, timeout);
    return this.send('error', `${title ? title + ': ' : ''} ${message}`);
  }

  public withToastrCatch(error: Error | string, reason?: string) {
    this.utilService.toastrCatch(error, reason);
    const msg = `${reason ? reason + ': ' : ''}${error}`;
    return this.send('error', msg);
  }

  /**
   * @param email: 아직 userService에서 정보를 못 찾아오는 단계에세 사용한다.
   */
  public async logOrder(order: { _id: string; site: string; room: string; }, message: string, level?: LogLevel, createdBy?: 'manual') {
    const collectionPath = 'logOrder';
    // message Id는 firestore가 제공하는 Id를 이용한다.
    const docRef = this.db.firestore.collection(collectionPath).doc();
    const docId = docRef.id;

    if (order._id === undefined) {
      this.withToastrError(`logOrder의 다음 message에 대한 orderId가 없다. message=\n${message}`);
    }

    const organization = this.userService.organization;
    const doc: LogOrderDoc = {
      _id: docId,
      _timeCreate: firestore.FieldValue.serverTimestamp() as firestore.Timestamp,

      organization,
      site: order.site ?? 'ERROR',
      room: order.room ?? 'ERROR',
      orderId: order._id ?? 'ERROR',

      instanceType: 'omc',
      instanceNo: instanceId,
      account: this.userService?.user.email ?? '',

      publicIP: this.addressService.publicAddress ?? '',

      level: level ?? 'info',
      message
    };

    if (createdBy) {
      doc.createdBy = createdBy;
    }

    try {
      return await this.db.doc<LogOrderDoc>(docRef).set(doc);
    } catch (error) {
      this.withToastrCatch(error);
    }
  }

  /**
   * logRoom은 logOrder와 같은 컬렉션을 사용한다.
   */
  public logRoom(roomKey: string, message: string, level?: LogLevel) {
    const matches = roomKey.match(/^([a-zA-Z]+-.+)-\d{2}$/);
    if (matches) {
      const site = matches[1];
      return this.logOrder({ _id: 'room', site, room: roomKey }, message, level);
    } else {
      return this.send('error', `${roomKey}에 대한 site를 유도할 수 없어서 logRoom 실패`);
    }
  }

  public async logRoomMemo(roomKey: string, message: string, level?: LogLevel) {
    const matches = roomKey.match(/^([a-zA-Z]+-.+)-\d{2}$/);
    if (matches) {
      const site = matches[1];
      return this.logOrder({ _id: 'room', site, room: roomKey }, message, level, 'manual');
    } else {
      return this.send('error', `${roomKey}에 대한 site를 유도할 수 없어서 logRoom 실패`);
    }
  }

  public logRoomWithToastWarn(roomKey: string, message: string, title?: string, timeout?: number) {
    this.utilService.toastrWarning(message, title, timeout);
    return this.logRoom(roomKey, `${title ? title + ': ' : ''} ${message}`, 'warn');
  }

  public logRoomWithToastrError(roomKey: string, message: string, title?: string, timeout?: number) {
    this.utilService.toastrError(message, title, timeout);
    return this.logRoom(roomKey, `${title ? title + ': ' : ''} ${message}`, 'error');
  }

  public logRoomWithToastrCatch(roomKey: string, error: Error | string, reason?: string) {
    this.utilService.toastrCatch(error, reason);
    const msg = `${reason ? reason + ': ' : ''}${error}`;
    return this.logRoom(roomKey, msg, 'error');
  }
}
