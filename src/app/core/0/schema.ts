/**
 * toe-app-ceo에서 toe-pos로 보내는 메시지
 */
export interface InAppBrowserMessage {
  printRequest: {
    dataString: string;
    host: string;
  };
}
