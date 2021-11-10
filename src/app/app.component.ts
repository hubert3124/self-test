import fecha from 'fecha';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { InAppBrowser, InAppBrowserEvent, InAppBrowserObject, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { Subscription } from 'rxjs';

import { environment } from '../environments/environment';

import { SocketService } from './core/0/socket.service';
import { renderFoods, renderReview, renderOrder, renderMessage } from './core/4/print-order';
import { InAppBrowserMessage } from './core/1/schema';
import { EP } from './core/0/escpos';

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
      if (event.data.printStat) {
        messageName = 'printStat';
        const { host, orders, room, ignoreZeroOption } = event.data.printStat as InAppBrowserMessage['printStat'];
        const dataString = renderFoods('customer', orders, room, ignoreZeroOption);
        await this.socketService.sendData(dataString, host);
        this.messageCallback('success');
      }

      if (event.data.printOrder) {
        messageName = 'printOrder';
        const { host, whats, order, room, beep, autoPrint, doublePrint } = event.data.printOrder as InAppBrowserMessage['printOrder'];

        let dataString = '';
        const partialCut = '\n' + EP.FEED_PARTIAL_CUT_N + '\x10'; // EPSON은 행의 시작에서만 cut 이 된다.
        for (const [index, what] of whats.entries()) {
          dataString += renderOrder(what, order, room, autoPrint, doublePrint);
          if (what === 'customer') {
            const originDesc = room.originDesc;
            if (originDesc) {
              const line = originDesc.trim();
              if (line.length > 0) {
                const originPrint = '\n          ---- 원산지  표기 ----\n' + `${line}`;
                dataString += originPrint;
              }
            }
          }
        }

        // TODO: 왜 for문 안에서 처리했는지 물어보기
        // 항상 출력물의 마지막에 시간표시를 한다.
        const printTime = fecha.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
        dataString += `\n\n\n출력일시: ${printTime}`;
        dataString += partialCut;

        // TODO: Epson 버저가 추가되면 명령을 테스트 필요하다.
        const beepSound = EP.INIT + '\x07\x07\x07\x07';
        if (beep) {
          dataString = beepSound + dataString;
        }

        await this.socketService.sendData(dataString, host);
        this.messageCallback('success');
      }

      if (event.data.printReview) {
        messageName = 'printReview';
        const { host, type, review, oldReview } = event.data.printReview as InAppBrowserMessage['printReview'];
        const dataString = renderReview(type, review, oldReview);
        await this.socketService.sendData(dataString, host);
        this.messageCallback('success');
      }

      if (event.data.printMessage) {
        messageName = 'printMessage';
        const { host, textTitle, textRaw, beep, autoPrint, order } = event.data.printMessage as InAppBrowserMessage['printMessage'];
        const dataString = renderMessage(textTitle, textRaw, beep, autoPrint, order);
        await this.socketService.sendData(dataString, host);
        this.messageCallback('success');
      }
    } catch (error) {
      console.error(`${messageName} 처리중 에러 발생`);
      this.messageCallback('error', `${messageName} 처리중 에러 발생. error: ${error.message}`);
    }

    // toe-app-ceo에 print-agent를 넣는 식으로 변경
    // 9100 공용
  };

  private messageCallback = (result: 'success' | 'error', reason?: string) => {
    this.browser.executeScript({ code: `
      inAppBrowserMessageResult('${result}')`
    });
  };
}
