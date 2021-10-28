
export const enum CombinenetStateCode {
  SUBMITTED = '1',
  ASSIGNED = '2',
  PICKED_UP = '3',
  DELIVERED = '5',
  CANCELED = '44',
  /** toPickupTime을 전달하기 위한 특별한 상태 코드 */
  PICKUP_ADJUSTED = '50'
}

/** request, response 공통 헤더 */
export interface CombinenetCommonHeader {
  /** "20190520141511001" */
  request_id: string;
  /** "0000" */
  result_code: string;
  /** "정상적으로 조회되었습니다." */
  result_message: string;
}

/** 1. 가맹점목록 조회 요청 */
export interface CombinenetShopFindRequest {
  header: CombinenetCommonHeader;
  body: CombinenetShopFindRequestBody;
}
export interface CombinenetShopFindRequestBody {
  keyword: string;
}
/** 1. 가맹점목록 조회 응답 */
export interface CombinenetShopFindResponse {
  header: CombinenetCommonHeader;
  body: CombinenetShopFindResponseBody;
}
/** 1. 가맹점목록 조회 응답 body */
export interface CombinenetShopFindResponseBody {
  ShopList: {
    /** "서울특별시 송파구 석촌호수로 210 (석촌동, 석촌호수효성해링턴타워)" */
    storeAddress: string;
    /** "2381901116" */
    storeBusiNo: string;
    /** "8160" */
    storeCode: string;
    /** "01085048374" */
    storeMobile: string;
    /** "[석촌⭐️]_고스트(1호)(coin)" */
    storeName: string;
    /** "070-4257-8889" */
    storeTel: string;
  }[];
}

/** 2. 가맹점 코드 매핑 요청 */
export interface CombinenetShopLinkRequest {
  header: CombinenetCommonHeader;
  body: CombinenetShopLinkRequestBody;
}
export interface CombinenetShopLinkRequestBody {
  /** 가맹점 코드 */
  storeCode: string;
  /** POS 가맹점 코드 ex. gk300101 */
  posStoreCode: string;
  /** '1': 등록, '2': 삭제 */
  posLinkFlag: '1' | '2';

  /** New Spidor Api에 필요해서 살짝 끼워넣어본다. */
  pno?: string;
}
/** 2. 가맹점 코드 매핑 응답 */
export interface CombinenetShopLinkResponse {
  header: CombinenetCommonHeader;
  body: CombinenetShopLinkResponseBody;
}
/** 2. 가맹점 코드 매핑 응답 body */
export interface CombinenetShopLinkResponseBody {
  /** 가맹점 코드 */
  storeCode: string;
  /** POS 가맹점 코드 ex. gk300101 */
  posStoreCode: string;
}

/** 3. 가맹점 정보 조회 요청 */
export interface CombinenetShopInfoRequest {
  header: CombinenetCommonHeader;
  body: CombinenetShopInfoRequestBody;
}
export interface CombinenetShopInfoRequestBody {
  /** POS 가맹점 코드 ex. gk300101 */
  posStoreCode: string;
}
/** 3. 가맹점 정보 조회 응답 */
export interface CombinenetShopInfoResponse {
  header: CombinenetCommonHeader;
  body: CombinenetShopInfoResponseBody | {};
}
/** 3. 가맹점 정보 조회 응답 body */
export interface CombinenetShopInfoResponseBody {
  /** 가맹점 코드 */
  storeCode: string;
  /** '신한은행' */
  bankName: string;
  /** '56212508821244' */
  bankAccount: string;
  /** '예금주' */
  bankOwner: string;
  /** '1401250' */
  storeCash: string;
}

/** 4. 배달요청전 정보 요청 */
export interface CombinenetOrderInfoRequest {
  header: CombinenetCommonHeader;
  body: CombinenetOrderInfoRequestBody;
}
/** 4. 배달요청전 정보 요청 body */
export interface CombinenetOrderInfoRequestBody {
  /** "gk300101", */
  posStoreCode: string;
  /** 지번 주소 ex. "서울특별시 구로구 신도림동 337" */
  address: string;
  /** 도로명 주소 ex. "서울특별시 구로구 경인로 661" */
  address_road?: string;
  /** "약국", */
  addressDetail: string;
  /** "126.997128", */
  addressGpsLng: string;
  /** "37.561655", */
  addressGpsLat: string;
  /** "0" */
  paymentPrice: string;
}

/** 4. 배달요청전 정보 응답 */
export interface CombinenetOrderInfoResponse {
  header: CombinenetCommonHeader;
  /** 문서의 응답 예에는 data로 잘못 작성되어 있다. */
  body: CombinenetOrderInfoResponseBody;
}
/** 4. 배달요청전 정보 응답 body */
export interface CombinenetOrderInfoResponseBody {
  /** "Y", */
  adminOpen: string;
  /** "30/35/40//45/50/55/60", */
  waitTime: string;
  /** "71200", 문서 예에는 number로 잘못 작성되어 있다. */
  storeCash: string;
  /** "1543", */
  distance: string;
  /** "3000", */
  baseFee: string;
  /** "300", */
  extraFee: string;
  /** "3300" */
  totalFee: string;
}

/** 5. 배달요청 등록 요청 */
export interface CombinenetOrderAddRequest {
  header: CombinenetCommonHeader;
  body: CombinenetOrderAddRequestBody;
}
/** 5. 배달요청 등록 요청 body */
export interface CombinenetOrderAddRequestBody {
  /** "gk300101", */
  posStoreCode: string;
  /** "baemin-xxxx", */
  posOrderCode: string;
  /** "01012349876" */
  tel: string;
  /** 지번 주소 ex. "서울특별시 구로구 신도림동 337" */
  address: string;
  /** 도로명 주소 ex. "서울특별시 구로구 경인로 661" */
  address_road?: string;
  /** "약국", */
  addressDetail: string;
  /** "126.997128", */
  addressGpsLng: string;
  /** "37.561655", */
  addressGpsLat: string;
  /** 12800 */
  paymentPrice: number;
  /** 0(현금), 1(후불카드), 2(선불) */
  paymentType: 0 | 1 | 2;
  waitTime: number;
  memo: string;
}
/** 5. 배달요청 등록 응답 */
export interface CombinenetOrderAddResponse {
  header: CombinenetCommonHeader;
  /** 문서의 응답 예에는 data로 잘못 작성되어 있다. */
  body: CombinenetOrderAddResponseBody;
}
/** 5. 배달요청 등록 응답 body */
export interface CombinenetOrderAddResponseBody {
  /** "1543", */
  distance: string;
  /** "3000", */
  baseFee: string;
  /** "300", */
  extraFee: string;
  /** "3300" */
  totalFee: string;

  /** New Spidor용 order_id를 끼워넣는다. */
  order_id?: number;
}

/** 7. 배달요청 취소 요청 */
export interface CombinenetOrderCancelRequest {
  header: CombinenetCommonHeader;
  body: CombinenetOrderCancelRequestBody;
}
/** 7. 배달요청 취소 요청 body */
export interface CombinenetOrderCancelRequestBody {
  /** "gk300101", */
  posStoreCode: string;
  /** "baemin-xxxx", */
  posOrderCode: string;
}
/** 7. 배달요청 취소 응답 */
export interface CombinenetOrderCancelResponse {
  header: CombinenetCommonHeader;
  /** 문서의 응답 예에는 data로 잘못 작성되어 있다. */
  body: CombinenetOrderCancelResponseBody;
}
/** 7. 배달요청 취소 응답 body */
export interface CombinenetOrderCancelResponseBody {
  /** "gk300101", */
  posStoreCode: string;
  /** "baemin-xxxx", */
  posOrderCode: string;
}

/** 8. 배달정보 요청 */
export interface CombinenetOrderStatusRequest {
  header: CombinenetCommonHeader;
  body: CombinenetOrderStatusRequestBody;
}
/** 8. 배달정보 요청 body */
export interface CombinenetOrderStatusRequestBody {
  /** "gk300101", */
  posStoreCode: string;
  /** "baemin-xxxx", */
  posOrderCode: string;
}
/** 8. 배달정보 응답 */
export interface CombinenetOrderStatusResponse {
  header: CombinenetCommonHeader;
  body: CombinenetOrderStatusResponseBody;
}
/** 8. 배달정보 응답 body */
export interface CombinenetOrderStatusResponseBody {
  stateCode: CombinenetStateCode;
  /** "1581853149369-baemin-B0LK01C7OQ", */
  posOrderCode: string;
  /** "gk300301", */
  posStoreCode: string;
  /** "2020-02-16 22:02:30", */
  resultTime: string;
  /** "2020-02-16 20:39:09", */
  requestTime: string;
  /** "2020-02-16 20:53:18", */
  caralcTime?: string;
  /** "2020-02-16 20:59:19", */
  pickupTime?: string;
  /** "2020-02-16 21:15:41", */
  completeTime?: string;
  /** "", */
  cancelTime?: string;
  /** "[석촌]지사장", */
  riderName?: string;
  /** "010-7633-6131", */
  riderTel?: string;
  /** "1", */
  realPaymentType?: string;
  /** 17000 */
  realPaymentAmount: number;
  cardInfoList?: {
    /** "71776347", */
    cardAuthNum: string;
    /** "6253-20**-****-****", */
    cardCodeName: string;
    /** "17000", */
    cardCost: string;
    /** "2020-02-16 21:15:40", */
    cardAuthDate: string;
    /** "N" */
    cancelConfirm?: 'N' | 'Y' | 'U';
  }[];
}

/** Callback 요청 : 배차 상태를 지정한 URL을 통해서 알려준다. */
export interface CombinenetCallbackRequest {
  header: {
    /** "20190520141511001" */
    request_id: string;
  };
  body: CombinenetCallbackBody;
}
/** Callback 요청 body */
export interface CombinenetCallbackBody {
  /** "44", */
  stateCode: CombinenetStateCode;
  /** "bdy_0005", */
  posOrderCode: string;
  /** "4718700751", */
  posStoreCode: string;
  /** "2019-05-21 14:14:52", */
  resultTime: string;
  /** "", */
  riderName?: string;
  /** "", */
  riderTel?: string;
  /** "", */
  cardAuthNum?: string;
  /** "", */
  cardCodeName?: string;
  /** "", */
  cardAuthDate?: string;
  /** "", */
  cardCost?: string;
  /** "0", */
  realPaymentType?: '0' | '1' | '2';
  /** 0 */
  realPaymentAmount?: number;
  /** stateCode가 '50'인 경우에 받는다. ex. 2020-06-04 15:55:15 */
  toPickupTime?: string;
}

/** Callback 응답 */
export interface CombinenetCallbackResponse {
  header: {
    /** "20190520141511001", */
    request_id: string;
    /** "0000", */
    result_code: '0000' | '0002' | '0003' | '0005' | '0012' | '9999';
    /** "정상 처리되었습니다." */
    result_message: string;
  };
  body: {
    /** "4718700751", */
    posStoreCode: string;
    /** "bdy_0005" */
    posOrderCode: string;
  };
}
