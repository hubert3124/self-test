import { Component } from '@angular/core';
import { SocketService } from '../core/0/socket.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class HomePage {

  constructor(
    private socketService: SocketService
  ) {}

  public sendData(dataString: string) {
    this.socketService.sendData(dataString);
  }
}
