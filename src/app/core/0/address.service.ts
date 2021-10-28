import { Injectable } from '@angular/core';

/**
 * 로컬 IP 주소와 공인 IP 주소를 구한다.
 */
@Injectable({
  providedIn: 'root'
})
export class AddressService {
  public publicAddress: string;

  constructor() { }

  // WebRTC를 이용해서 local IP 주소를 얻는다. 사파리는 지원하지 않는다.
  // refer: https://stackoverflow.com/questions/20194722/can-you-get-a-users-local-lan-ip-address-via-javascript
  public findLocalAddress(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      (window as any).RTCPeerConnection = (window as any).RTCPeerConnection
        || (window as any).mozRTCPeerConnection
        || (window as any).webkitRTCPeerConnection;

      if ((window as any).RTCPeerConnection === undefined) {
        return reject('WebRTC not supported by browser');
      }

      const pc = new RTCPeerConnection();
      const ips = [];

      pc.createDataChannel('');
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .catch(err => reject(err));
      pc.onicecandidate = event => {
        if (!event || !event.candidate) {
          // All ICE candidates have been sent.
          if (ips.length === 0) {
            return reject('WebRTC disabled or restricted by browser');
          }

          return resolve(ips);
        }

        const parts = event.candidate.candidate.split(' ');
        // let [base, componentId, protocol, priority, ip, port, , type, ...attr] = parts;
        const ip = parts[4];
        // let component = ['rtp', 'rtpc'];

        if (!ips.some(e => e === ip)) {
          ips.push(ip);
        }
      };
    });
  }

  /**
   * 공인 IP 주소를 구한다.
   * refer: https://stackoverflow.com/questions/391979/how-to-get-clients-ip-address-using-javascript
   */
  public async findPublicAddress() {
    if (this.publicAddress) {
      return this.publicAddress;
    }

    const requestInit: RequestInit = {
      cache: 'no-store',
      headers: {
      }
    };

    try {
      const response = await fetch('https://api.ipify.org?format=json', requestInit);
      if (response.ok) {
        const body = await response.json();
        this.publicAddress = body.ip;
      } else {
        return 'unknown';
      }
    } catch (err) {
      console.error('[findPublicAddress]', err);
      return 'error';
    }

    return this.publicAddress;
  }
}
