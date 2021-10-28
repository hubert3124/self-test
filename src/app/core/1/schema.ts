/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/naming-convention */
import firebase from 'firebase/app';
import firestore = firebase.firestore;
import {
  CombinenetCallbackBody,
  CombinenetOrderAddRequestBody,
  CombinenetOrderAddResponseBody,
  CombinenetOrderStatusResponseBody,
} from '../0/schema-combinenet-api';
import { CoupangeatsAppOrder } from '../0/schema-coupangeats-api';
import { FoodflyCeoListOrder } from '../0/schema-foodfly-api';
import { VroongPosDelivery } from '../0/schema-vroong-api';
import { YogiyoAppOrderListItem } from '../0/schema-yogiyo-api';
import { BaeminUserReview } from '../0/schema-baemin-api';

export type DeliveryVendor =
  | 'vroong'
  | 'run2u'
  | 'spidor'
  | 'barogo'
  | 'logiall'
  | 'ghokirun'
  | 'manna'
  | 'baera'
  | 'coupang'
  | 'yogiyo'
  | 'zendeli';

export type UnifiedOrderChannel = 'app' | 'tel' | 'face';
// 타입 정의에 이용하기 위한 목적
export interface UnifiedOrderVendorKeys {
  baemin: null;
  foodfly: null;
  ddingdong: null;
  coupangeats: null;
  yogiyo: null;
  shuttle: null;
  ghostkitchen: null;
  other: null;
}
export type UnifiedOrderVendor = keyof UnifiedOrderVendorKeys;
export type UnifiedOrderDeliveryType =
  | 'DELIVERY'
  | 'TAKEOUT'
  | 'FOODFLY'
  | 'BAERA'
  | 'DDINGDONG'
  | 'UBER'
  | 'COUPANG'
  | 'SHUTTLE'
  | 'HERE'
  | 'YOGIYO';

// unifiedOrderStatusMappings도 함께 변경한다.
export const enum UnifiedOrderContextStatusCode {
  UNKNOWN = 0,
  NEW = 10,
  /** EXCLUSIVE */
  CEOACCEPTED = 15,
  /** 배차대기 (정렬 순서를 위해 17을 할당) */
  WAITASSIGN = 17,
  ACCEPTED = 20,
  COOKED = 40,
  PICKEDUP = 60,
  COMPLETED = 70,
  CANCELED = 80,
  DELETED = 90,
  /** 현장 결제 이전의 상태 */
  STAGING = 95,
  /** 현장 결제 이전의 상태 */
  BACK = 96,
}

export const enum UnifiedOrderStatusCode {
  UNKNOWN = 0,
  NEW = 10,
  ACCEPTED = 20,
  COOKED = 40,
  PICKEDUP = 60,
  COMPLETED = 70,
  CANCELED = 80,
  DELETED = 90,
  /** 현장 결제 이전의 상태 */
  STAGING = 95,
  /** 현장 결제 이전의 상태 */
  BACK = 96,
}

export const enum UnifiedDeliveryStatusCode {
  SUBMITTED = 10,
  ASSIGNED = 20,
  PICKED_UP = 30,
  DELIVERED = 40,
  CANCELED = 50,
}

/** 미정 | 고스트라이더 | 타사 | 업소자체배송 | 예약(진짜 배송은 나중에) */
export type DeliveryCherrypickStatus =
  | '??'
  | 'ghostrider'
  | '3rd'
  | 'self'
  | 'preorder';

export type UnifiedOrderMerge = UnifiedOrderDoc & {
  // UI 용
  _ui?: {
    relatedVroongDeliveries?: VroongPosDeliveryDoc[];

    relatedCombinenetDeliveries?: CombinenetDeliveryDoc[];

    isPickupAdjusted?: boolean;
    /** 라이더가 픽업했다고 한 경우 (픽업 확인을 한 것은 아니다.) */
    isRiderPickedUp?: boolean;
    relatedFoodflyCeoListOrder?: FoodflyCeoListOrderDoc;
    relatedCoupangeatsAppOrder?: CoupangeatsAppOrderDoc;

    // 배차까지 포함한 상태 정보
    unitedStatusCode?: UnifiedOrderContextStatusCode;
    /** 할당된 color를 지정한다. */
    colorNo?: string;
    /** 경제색을 지정한다. */
    borderColorNo?: string;
    /** adminMemo 작성자, adminMemo에서 분리 */
    adminName?: string;
    /** adminMemo에서 앞의 작성자를 제거 */
    adminMemoContent?: string;

    orderHistory?: {
      countOrders?: number;
      countCanceledOrders?: number;
      totalAmount?: number;
    };
  };
};

export interface UnifiedOrderFood {
  foodName: string;
  foodOpts: UnifiedOrderFoodOpt[];
  /** foodQty까지 포함한 금액 */
  foodOrdPrice: number;
  foodQty: number;
  mergedName: string;

  /** UI를 위한 상태 저장용 */
  _uiState?: 'new' | 'added' | 'none';
}

export interface UnifiedOrderFoodOpt {
  optGrpName?: string;
  optName: string;
  /** 유닛 가격, foodOrdPrice는 전체 개수에 대한 가격 */
  optPrice: number;
  optQty: number;
}

export type UnifiedOrderDoc = UnifiedOrder & {
  _timeCreate?: firestore.Timestamp;
  _timeMerge?: firestore.Timestamp;
  _timeUpdate?: firestore.Timestamp;
};

export interface UnifiedOrder {
  _id: string;
  organization: string;
  site: string;
  room: string;
  orderChannel: UnifiedOrderChannel;
  orderVendor: UnifiedOrderVendor;
  /** _bizNo */
  instanceNo: string;
  orderNo: string;
  shopName: string;
  shopNo: string;
  orderDate: string;
  orderStatusCode: UnifiedOrderStatusCode;
  /** deliveryTip 제외 */
  orderAmount: number;
  deliveryTip: number;
  /** baeminAppListOrder와 baeminAppDetailOrder에만 존재한다. */
  deliveryMinutes?: number;
  deliveryType: UnifiedOrderDeliveryType;
  paymentMethod: '선불' | '후불현금' | '후불카드' | 'NA';
  /** 01012345617 */
  userTel: string;
  /** userTel의 hash값<sha256(hex)> '825462d8c4c7ad70c3127212b56d3634c9cf570c729c3f9fcac834a7f2389603' */
  hashUserTel?: string;
  orderMsg: string;
  /** '<siteNo>-0001' ~ '<siteNo>-9999' 까지의 간단번호 */
  simpleNo?: string;
  /** 배민의 TAKEOUT 접수번호('115') */
  displayNo?: string | null;
  foods: UnifiedOrderFood[];
  /** 정규화되지 않아서 사용하지 않는다. address_key + address_detail */
  // address_raw: string;
  address_key: string;
  address_detail: string;
  address_sido: string;
  address_sigungu: string;
  address_dong: string;
  address_jibun: string;
  address_dongH: string;
  address_road: string | null;
  address_building_name?: string | null;
  address_location: {
    lat: number;
    lon: number;
  };
  // TODO: 부릉 요청에 필요한 필드를 일단 함께 생성한다.
  // 주소로부터 필요할 때에 유도하는 방법으로 바꾸는 것도 고려하자.
  vroong: {
    dest_sigungu: string;
    dest_legal_eupmyeondong: string;
    dest_admin_eupmyeondong: string;
    dest_ri: string;
    dest_beonji: string;
    dest_road: string | null;
    dest_building_number: string;
  };

  /** 각 벤더별 값을 따른다. */
  cancelCode?: string;
  /** 각 벤더별 값을 따른다. */
  cancelReason?: string;

  time?: {
    /** '2020-05-26T22:24:30+0900 */
    onCEOACCEPTED?: string;
    /** 포스에서 직접 주문을 생성한 경우 바로 접수상태가 된다. */
    onACCEPTED?: string;
    onCOOKED?: string;
    onPICKEDUP?: string;
    /** 주문 상태가 변경된 경우. 없을 수도 있다.  쿠팡이츠는 최초 완료가 감지되었을 때의 시각. */
    onCOMPLETED?: string;
    /** 배달 대행의 상태가 배달 완료로 변경된 경우. */
    onDELIVERED?: string;
    /** 주문 취소된 경우의 시각 */
    onCANCELED?: string;
    /**
     * 접수 버튼을 눌러서 접수를 시도한 시도한 시각
     * onTryACCEPT가 존재하면 신규 알림 대상에서 제외한다.
     */
    onTryACCEPT?: string;
  };

  // 필수 필드들
  // 항상 존재해야 한다.
  /**
   * unifiedOrderStatus를 포함한 최종 상태를 관리한다.
   * unifiedOrderStatus에는 없는 상태를 추가로 보여준다.
   */
  contextStatusCode: UnifiedOrderContextStatusCode;
  /**
   * mango는 망고 이벤트로 유입된 주문
   * test는 직접 입력했지만 manual로 인식되지 않도록 할 때 사용한다.
   */
  createdBy?: 'manual' | 'face' | 'mango' | 'fingerFace' | 'test';
  /** 주문 채널에서 유도되지 않는 값 */
  cookMinutes?: number;
  /** context에서 이사 */
  adminMemo?: string;
  /** 사장님께 전달하는 메모사항 */
  posMemo?: string;
  /**
   * 고스트키친이 부담하는 이벤트 할인
   * 양의 값을 갖는다.
   */
  eventDiscount?: number;

  /** 고스트키친 자체 배달 */
  deliveryCherrypickStatus?: DeliveryCherrypickStatus;
  /** 고스트키친 자체 배달 */
  ghostriderName?: string | null;
  /** 찜을 하면 조리 시간과 최소 픽업 시간의 큰 값으로 설정된다. */
  ghostriderPickupAt?: string | null;

  /** POS에서 배달을 함께 요청핸 경우에는 true */
  withDelivery?: boolean;

  // 최초 안내한 pickupMinutes과 deliveryMinutes을 기록한다.
  /** 20, */
  recommendedRequestedPickupMinutes?: number;
  /** 50, */
  recommendedDeliveryMinutes?: number;
  // POS에서 선택한 값
  /** 20, */
  posRequestedPickupMinutes?: number;
  /** 50, */
  posDeliveryMinutes?: number;
  /** POS에서 취소 확인을 누르면 true */
  posCancelConfirmed?: boolean;

  /** 취소한 주문에 대해서 OMC가 인지하였는지 체크 */
  cancelConfirmed?: boolean;

  /** autoPilot이 꺼져있어서 수행하지 않는 경우는 'skip' */
  autoPilotResult?:
    | 'acceptOnly'
    | 'success'
    | 'error'
    | 'warning'
    | 'skip'
    | 'na';
  autoPilotReason?: string;
  /** callAugmentAddress 결과 기록 */
  augmentAddressStatus?: {
    result: 'success' | 'error' | 'retry';
    reason: string;
  };

  /** 접수 전에 확인해야 할 필드를 기록한다. */
  preCheckOrder?: {
    /** '요청 사항에 예약 관련 문구가 있습니다.' */
    orderMsg?: string;
  };
  /** 배차 전에 확인해야 할 필드를 기록한다. */
  preCheckDelivery?: {
    /**
     * '추가 주문은 배차가 필요 없을 수 있습니다.'
     * '요청 사항에 또 다른 주소가 있는 것 같습니다.'
     */
    orderMsg?: string;
    /** '주소에 위경도 정보가 없습니다' */
    address_location?: string;
    /** '배달거리가 5,000m를 넘었습니다.' */
    address_key?: string;
    /** '배달 가능 행정동이 아닌 것 같습니다.' */
    address_dongH?: string;
    /** '상세 주소에 또 다른 주소가 있는 것 같습니다.' */
    address_detail?: string;
  };
  /** KICC easypay(손가락 주문 결제 서비스)의 결제 취소 결과 */
  paymentCanceled?: boolean;

  /** UnifiedDeliveryDoc에서 일부 발췌한 필드 */
  unifiedDelivery?: {
    deliveryVendor: DeliveryVendor;
    deliveryStatusCode: UnifiedDeliveryStatusCode;
    requestedPickupTime: string;
    riderName?: string;
    riderTel?: string;
    timeSubmitted: string;
    timeAssigned?: string;
    timePickedUp?: string;
    timeDelivered?: string;
    adjustedPickupTimes?: {
      /** 조정된 시각 (YYYY-MM-DDTHH:mm:ss+09:00) */
      adjustedTime: string;
      /** 조정이 일어난 시각 (YYYY-MM-DDTHH:mm:ss+09:00) */
      adjustedAt?: string;
    }[];
  };

  /** 요기요 특화된 정보 */
  yogiyo?: {
    /** 'retry_processing' 여부를 확인하기 위함이다. */
    status: YogiyoAppOrderListItem['status'];
  };
}

export type VroongPosDeliveryDoc = VroongPosDelivery & {
  /** delivery_number */
  _id: string;
  _bizNo: string;
  _organization: string;
  _site: string;
  _room: string;

  // UI용
  _ui?: {
    orderDone?: boolean;
    matchingOrder?: UnifiedOrderMerge;
  };
};

export interface CombinenetDeliveryDoc {
  /** posOrderCode와 동일 */
  _id: string;
  _timeCreate: firestore.Timestamp;
  _timeUpdate?: firestore.Timestamp;
  _timeMerge?: firestore.Timestamp;

  organization: string;
  site: string;
  room: string;
  /** combinenetAccount의 instanceNo */
  instanceNo: string;
  deliveryVendor: DeliveryVendor;

  relatedOrder?: CombinenetDeliveryRelatedOrder;
  orderAddRequest: CombinenetOrderAddRequestBody;
  orderAddResponse?: CombinenetOrderAddResponseBody;
  latestCallback?: CombinenetCallbackBody;
  orderStatus?: CombinenetOrderStatusResponseBody;

  // UI용
  _ui?: {
    orderDone?: boolean;
    matchingOrder?: UnifiedOrderMerge;
  };
}

export type FoodflyCeoListOrderDoc = FoodflyCeoListOrder & {
  _id: string;
  _bizNo: string;
  _organization: string;
  _site: string;
  _room: string;
  _shopName: string;
  _timeCreate?: firestore.Timestamp;
  _timeMerge?: firestore.Timestamp;
};

export type CoupangeatsAppOrderDoc = CoupangeatsAppOrder & {
  _id: string;
  _bizNo: string;
  _organization: string;
  _site: string;
  _room: string;
  _timeCreate?: firestore.Timestamp;
  _timeMerge?: firestore.Timestamp;

  // 상대시각을 절대시각으로 변환한 필드
  absTime?: {
    pickUpRemainingTime?: string;
    deliveryRemainingTime?: string;
    preparationRemainingTime?: string;
    acceptedDuration?: string;
  };
};

export interface CombinenetDeliveryRelatedOrder {
  orderId: string;
  orderChannel: UnifiedOrderChannel;
  orderVendor: UnifiedOrderVendor;
  /** _bizNo */
  instanceNo: string;
  orderNo: string;
  shopName: string;
  shopNo: string;
  orderDate: string;
  /** deliveryTip 제외 */
  orderAmount: number;
  deliveryTip: number;
  /** baeminAppListOrder와 baeminAppDetailOrder에만 존재한다. */
  deliveryMinutes: number;
  deliveryType: UnifiedOrderDeliveryType;
  paymentMethod: '선불' | '후불현금' | '후불카드' | 'NA';
  /** 01012345617 */
  userTel: string;
  orderMsg: string;
}

export interface RoomDoc {
  _id: string;  // gk-samsung-01
  _timeMerge?: firestore.Timestamp;

  organization: string; // ghostkitchen
  organizationName: string; // '고스트키친'
  site: string; // gk-samsung
  siteName: string; // '고스트키친 삼성점'
  siteNo: number; // 1
  room: string; // gk-samsung-01

  deliveryVendors: DeliveryVendor[];
  originDesc: string; // '계란(국내산), 호박고구마(국내산), 김치(중국산), 느타리버섯(국내산), 단호박(국내산), 닭다리살(브라질산), 당근(중국산), 대파(국내산), 돈육 등심(국내산), 돈육 민찌(미국산), 무(국내산), 방울토마토(국내산), 백미(국내산), 팽이버섯(국내산), 양배추(국내산), 양파(중국산), 우삼겹(미국산), 우육 민찌(호주산), 쪽파(국내산), 참나물(국내산), 청피망(국내산), 표고버섯(중국산), 홍피망(국내산), 감자(국내산), 샐러리(국내산), 오복채(국내산), 우육 차돌박이(미국산), 장마(국내산), 홍게대게살(국내산), 새송이(국내산)',
  printReview: boolean; // 리뷰 자동 출력 여부
  /**
   * POS에서 주문접수(ceoaccept)시 자동 출력 방식을 설정한다.
   *
   * cookFirst:     '주방용 먼저 출력' (디폴트)
   * customerFirst: '고객용 먼저 출력'
   * cookOnly:      '주방용만 출력'
   * customerOnly:  '고객용만 출력'
   * noPrint:       '자동 출력하지 않음'
   */
  printOption: 'cookFirst' | 'customerFirst' | 'cookOnly' | 'customerOnly' | 'noPrint';
  autoPilot: boolean;    // siteDoc.autoPilot도 true이어야 autoPilot를 진행한다.

  // conf/organization에서 이사
  name: string; // '고스트키친 삼성점 01호'
  shopName: string; // '마티스그림 송파점'
  section: string; // 'A'
  telNo?: string; // 주문서 출력을 기본값이 아닌 다른 값을 사용할 경우. ex) '01034675530'
  live: boolean;
  selfDelivery: boolean; // 셀프배차 여부 표시
  // 2020-03-27: 호실의 디폴트 프린터의 의미로 변경
  printer: string;
  translation?: boolean; // menuTranslation 수행 여부
  quiet: boolean;       // 신규 알림을 하지 않을 때 사용
  virtual: boolean;     // 테스트 업소와 같이 실제하지 않는 업소
  account: {
    baemin: string[];
    foodfly: string[];
    coupangeats: string[];
    yogiyo: string[];
    vroong: string[];
    spidor?: string[];
    run2u?: string[];
  };
  autoPrint?: {
    coupangeats?: boolean;
  };
  operationHour: {
    openTime: string; // "11:30",
    closeTime: string; // "19:50",
    allDay: boolean;
  };
}

export type BaeminUserReviewDoc = BaeminUserReview & {
  _id: string;
  _timeCreate?: firestore.Timestamp;
  _timeMerge?: firestore.Timestamp;

  _instanceNo: string;
  _organization: string;
  _site: string;
  _room: string;
  _date: string; // "2020-06-28"
  _shopName: string;
  _shopNo: string;

  __comments?: string; // UI
  __menu?: string; // UI
};
