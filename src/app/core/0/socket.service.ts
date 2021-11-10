import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { encode } from 'iconv-lite';

// eslint-disable-next-line @typescript-eslint/naming-convention
const Socket = (window as any).Socket;

interface SocketError {
  /** 'The operation couldn’t be completed. Connection refused' */
  message: string;
  /**
   * '0': Timeout - 네트워크 상태 또는 호스트가 올바른지 확인해야하는 경우
   * '61': Connection refused - 서버의 포트가 닫혀있는 경우
   */
  code: string;
  /** 'bc0cc7ce-da6f-0060-9bf8-87c130229be1' */
  socketKey: string;
}

interface Socket {
  _state: number;
  onData: (data: Uint8Array) => void;
  onError: (errorMsg: string) => void;
  onClose: (hasError: boolean) => void;
  open: (host: string, port: number, onSuccess?: () => void, onError?: (error: SocketError) => void) => void;
  write: (data: Uint8Array, onSuccess?: () => void, onError?: (error: SocketError) => void) => void;
  /** 즉시 close */
  close: (onSuccess?: () => void, onError?: (error: SocketError) => void) => void;
  /** 정상 close(서버로 FIN을 보냅니다) */
  shutdownWrite: (onSuccess?: () => void, onError?: (error: SocketError) => void) => void;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private serviceName = 'SocketService';
  private socket: Socket;

  constructor(
    private platform: Platform
  ) {
    this.platform.ready().then(() => {
      this.initSocket();
    });
  }

  public async sendData(dataString: string, host: string, port: number = 9100) {
    // 1. open
    await this.socketOpen(host, port);

    // 2. write
    await this.socketWrite(dataString);

    // 3. close(send FIN)
    await this.socketClose();
  }

  private async socketOpen(host: string, port: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.socket.open(
        host,
        port,
        () => resolve(true),
        (error) => reject(`socketOpen - error: ${error.message}\ncode: ${error.code}`)
      );
    });
  }

  private async socketWrite(dataString: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const euckr = encode(dataString, 'euc-kr');
      this.socket.write(
        euckr,
        () => resolve(true),
        (error) => reject(`socketWrite - error: ${error.message}\ncode: ${error.code}`)
      );
    });
  }

  private async socketClose(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.socket.shutdownWrite(
        () => resolve(true),
        (error) => reject(`socketClose - error: ${error.message}\ncode: ${error.code}`)
      );
    });
  }

  private initSocket() {
    this.socket = new Socket();
    this.socket.onData = this.onData;
    this.socket.onError = this.onError;
    this.socket.onClose = this.onClose;
  }

  private onData = (data: Uint8Array) => {
    console.log(`[${this.serviceName}] Data received: ${data.toString()}`);
  };

  private onError = (errorMsg: string) => {
    console.error(`[${this.serviceName}] Error: ${errorMsg}`);
  };

  private onClose = (hasError: boolean) => {
    if (hasError) {
      console.log(`[${this.serviceName}] Close success`);
    } else {
      console.error(`[${this.serviceName}] Closed as a result of error`);
    }
  };
}
