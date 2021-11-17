import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { InAppBrowser, InAppBrowserEvent, InAppBrowserObject, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { Subscription } from 'rxjs';

import { environment } from '../environments/environment';

import { SocketService } from './core/0/socket.service';
import { InAppBrowserMessage } from './core/0/schema';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('Iframe') public iframeRef: ElementRef<HTMLIFrameElement>;
  public url: SafeResourceUrl;
  public browser: InAppBrowserObject;

  private messageSubscription: Subscription;

  constructor(
    private platform: Platform,
    private sanitizer: DomSanitizer,
    private socketService: SocketService,
    private inAppBrowser: InAppBrowser
  ) {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(environment.posUrl);
    this.initializeApp();
  }

  async initializeApp() {
    await SplashScreen.show({ autoHide: false });
    await this.platform.ready();
    SplashScreen.hide();
  }

  ngAfterViewInit() {
    this.loadBrowser(environment.posUrl);
  }

  public showBrowser() {
    if (this.browser !== undefined) {
      this.browser.show();
    } else {
      this.loadBrowser(environment.posUrl);
    }
  }

  private loadBrowser(url: string) {
    const inAppBrowserOptions: InAppBrowserOptions = {
      toolbar: 'no',
      location: 'no'
    };
    this.browser = this.inAppBrowser.create(url, '_blank', inAppBrowserOptions);
    this.setEventHandler();
  }

  private setEventHandler() {
    if (this.browser) {
      this.messageSubscription?.unsubscribe();
      this.messageSubscription = this.browser.on('message').subscribe(this.messageHandler);
    } else {
      console.error('inAppBrowserObject가 undefined입니다. eventHandler를 설정하지 못했습니다.');
    }
  }

  /**
   * toe-app-ceo에서 수신한 메시지를 처리한다.
   */
  private messageHandler = async (event: InAppBrowserEvent) => {
    let messageName = '';

    try {
      if (event.data.printRequest) {
        messageName = 'printRequest';
        const { host, dataString } = event.data.printRequest as InAppBrowserMessage['printRequest'];
        await this.socketService.sendData(dataString, host);
        this.messageCallback('success');
      }
    } catch (error) {
      console.error(`${messageName} 처리중 에러 발생`, error);
      const err = JSON.stringify(error);
      this.messageCallback('error', `${messageName} 처리중 에러 발생. Native Error: ${err}`);
    }
  };

  private messageCallback = (result: 'success' | 'error', reason?: string) => {
    // executeScript를 통해 inAppBrowser에 있는 함수를 실행시킬 수 있다.
    // 'inAppBrowserMessageResult()'는 toe-app-ceo에 global로 등록시켜둔 함수다.
    this.browser.executeScript({ code: `
      inAppBrowserMessageResult('${result}', ${reason ? `'${reason}'` : undefined})`
    });
  };
}
