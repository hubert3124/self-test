import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';

import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('Iframe') public iframeRef: ElementRef<HTMLIFrameElement>;
  public url: SafeResourceUrl;

  private messageChannel: MessageChannel;
  private messagePort1: MessagePort;

  constructor(
    private platform: Platform,
    private sanitizer: DomSanitizer,
  ) {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(environment.posUrl);
    this.initializeApp();
  }

  async initializeApp() {
    await SplashScreen.show({ autoHide: false });
    await this.platform.ready();
    SplashScreen.hide();
  }

  ngOnInit() {
    // 1. 채널을 생성한다.
    this.messageChannel = new MessageChannel();

    // 채널의 1번 포트를 ionicPort로 할당한다.
    this.messagePort1 = this.messageChannel.port1;

    this.messagePort1.onmessage = (e: MessageEvent) => {
      this.onMessageReceive(e);
    };

    setTimeout(() => {
      this.setChannel();
    }, 3000);
  }

  /** 생성한 port2를 iframe으로 전달한다. */
  private setChannel() {
    console.log('%c[toe-pos] set channel', 'background: #222; color: #bada55');
    this.iframeRef.nativeElement.contentWindow.postMessage('init', '*', [this.messageChannel.port2]);
  }

  /** 수신 메시지를 처리한다. */
  private onMessageReceive(e: MessageEvent) {
    console.log('receive message:', e.data);
    const data: { action: string } = e.data;
    if (data) {
    //   if (data.action === 'splashScreenHide') {
    //     SplashScreen.hide().then(() => console.log('< SplashScreen.hide'));
    //   }
      if (data.action === 'toeAppCeoReady') {
        this.postMessage({
          action: 'playSound'
        });
      }
    }
  }

  private postMessage(message: any) {
    this.messagePort1.postMessage(message);
    console.log('post message:', message);
  }

  /** MessageEvent 연결을 해제한다. */
  // private closePort() {
  //   this.ionicPort.close();
  // }
}
