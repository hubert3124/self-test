import { ElementRef, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { debugLog } from '../0/common';
import { CeoMessageChannelData, PosMessageChannelData } from '../1/schema';

@Injectable({
  providedIn: 'root'
})
export class MessageChannelService {
  public messageEventSubject = new Subject<Partial<CeoMessageChannelData>>();

  private messageChannel: MessageChannel;
  private messagePort: MessagePort;
  private projectName = 'toe-pos';

  constructor() {}

  /**
   * iframe과 통신채널을 연결한다.
   *
   * @param iframeRef
   */
  public initMessageChannel(iframeRef: ElementRef<HTMLIFrameElement>) {
    // 채널을 생성한다.
    this.messageChannel = new MessageChannel();

    // 채널의 1번 포트를 toe-pos에 할당한다.
    this.messagePort = this.messageChannel.port1;
    this.messagePort.onmessage = this.onMessageReceive;

    // iframe이 준비되면 채널의 2번 포트를 toe-app-ceo로 보낸다.
    iframeRef.nativeElement.onload = () => {
      try {
        iframeRef.nativeElement.contentWindow.postMessage('init', '*', [this.messageChannel.port2]);
        console.log(`[${this.projectName}] port 전송완료.`);
      } catch (error) {
        console.error(`[${this.projectName}] port를 전송하지 못했습니다.`, error);
      }
    };
  }

  /**
   * iframe으로 메시지를 보낸다.
   */
  public postMessage(data: Partial<PosMessageChannelData>) {
    if (this.messagePort) {
      this.messagePort.postMessage(data);
      debugLog(`[${this.projectName}] Data 전송 완료.`);
    } else {
      debugLog(`[${this.projectName}] 연결된 port가 없습니다.`);
    }
  }

  /** MessageEvent 연결을 해제한다. */
  // public closePort() {
  //   this.messagePort.close();
  // }

  private onMessageReceive = (e: MessageEvent) => {
    const data: Partial<CeoMessageChannelData> = e.data;
    this.messageEventSubject.next(data);

    debugLog(`[${this.projectName}] Message를 수신했습니다.`);
  };
}
