/* eslint-disable no-bitwise */
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

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

  public async sendData(dataString: string) {
    try {
      // 1. open
      await this.socketOpen('192.168.200.187', 1234);

      // 2. write
      await this.socketWrite(dataString);

      // 3. close(send FIN)
      await this.socketClose();
    } catch (error) {
      console.error(error);
    }
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
      const data = new Uint8Array(dataString.length * 2);
      for (let i = 0; i < data.length; i++) {
        const charCode = dataString.charCodeAt(i);
        if (charCode > 255) {
          // Uint8Array의 가용 범위를 벗어나는 경우 담을 수 없다.
          // 초기값(0)으로 두고 건너뛴다.
          continue;
        }
      }

      this.socket.write(data,
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
