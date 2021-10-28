/* eslint-disable max-len */
// tslint:disable: max-line-length
// tslint:disable: no-null-keyword

export interface CoupangeatsFoodItem {
  dishId: number; // 311150,
  orderItemId: number; // 1788593,
  quantity: number; // 1,
  name: string; // "국물 떡볶이",
  reviewRating: number; // 0,
  unitSalePrice: number; // 4500.0,
  subTotalPrice: number; // 5200.0,
  itemTotalPrice: number; // 4500.0,
  reviewTags: null | ['양이 적음', '너무 짬', '너무 싱거움', '포장 부실', '식었음', '메뉴가 잘못나옴'];
  itemOptions: {
    optionName: string; // "매운맛 2단" | "깐계란 1개 추가"",
    optionItemId: number; // 326939 | 326975,
    optionQuantity: number; // 1,
    optionPrice: number; // 0.0 | 700.0
    totalQuantity: number; // 1 | 1,
    totalPrice: number; // 0.0 | 700.0
  }[];
}

export interface CoupangeatsAppOrder {
  memberSrl: number; // 106136433,
  customerName: string; // "신동호",
  orderId: number; // 125575277299367936,
  abbrOrderId: string; // "2XRF00",
  orderedAt: {
    elapsedSeconds: number; // 4, dateTime 이후 경과 시간(초) 매번 변한다.
    dateTime: number; // 1570878526185,
    time: string; // "오후 08:08"
  };
  store: null | {
    id: number; // 102628,
    name: string; // "마마수 리얼수제분식",
    zipNo: string; // "06154",
    telNo: string; // "025116699",
    reviewRating: number; // 4.5,
    openStatus: null;
    nextOpenAt: null;
    longitude: number; // 127.0532145737,
    latitude: number; // 37.5123480599,
    imagePaths: string[]; // ["https://t3a.coupangcdn.com/thumbnails/remote/1024x1024/image/eats/store/102628/afb3e61a-f8bf-4531-888f-b1c9356c75e3.jpg", "https://t3c.coupangcdn.com/thumbnails/remote/1024x1024/image/eats/store/102628/1e8f165f-6e9b-496c-9a09-0cb8d22575d2.jpg", "https://t1a.coupangcdn.com/thumbnails/remote/1024x1024/image/eats/store/102628/0c05b83e-3c66-4a13-9cf2-164ee34252d0.jpg"],
    description: string; // "전공정 100%리얼수제로 MSG,냉동반제품을 절대쓰지않습니다.퀄리티를 최우선 하겠습니다",
    bizNo: string; // "534-87-01032",
    addressDetail: string; // "경산빌딩 지하1층 고스트키친 1호실",
    address: string; // "서울 강남구 삼성동 119-9"
  };
  storeName: null;
  storeId: number; // 102628,
  totalAmount: number; // 9800,
  salePrice: number; // 9800,
  canceledPrice: number; // 0,
  initialSalePrice: number; // 9800,
  discountPrice: number; // 2000,

  // 2020-07-17 추가
  deliveryFee: number; // 2000
  discountedDeliveryFee: number; // 2000,
  discountedDistanceFee: number; // 0,
  discountedSmallOrderFee: number; // 0,
  distanceFee: 0;

  // 'PAYMENT_APPROVED' 일 때 state는 null
  status: 'PAYMENT_APPROVED' | 'ACCEPTED' | 'PICKED_UP' | 'COMPLETED' | 'CANCELLED';
  reviewed: boolean; // false,
  reviewRating: number; // 0,
  items: CoupangeatsFoodItem[];
  canceledItems: CoupangeatsFoodItem[];
  currentItems: CoupangeatsFoodItem[];
  remainingCount: number; // 0,
  orderTitle: string; // "신동호",
  note: string; // "" | "[수저포크X] ",
  cancelled: boolean; // false,
  partialCancelled: boolean; // false,
  cancelledReason: null;
  cancelReasons: {
    cancellationReasonId: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    message: '품절' | '주문 폭주' | '기타 사유' | '금일 휴업' | '메뉴 상이' | '주문금액' | '테스트 주문';
  }[];
  storeReview: null;
  destination: {
    location: {
      longitude: number; // 127.033237194,
      latitude: number; // 37.511486624,
      address: string; // "서울특별시 강남구 학동로30길 37-4 302호",
      abbrAddress: string; // "서울특별시 강남구 학동로30길 37-4"
    };
    receiver: {
      mobile: string; // "010-7144-3143",
      name: string; // "신동호"
    };
  };
  courier: null | {
    name: string; // "박정현",
    vehicleType: string; // "MOTORCYCLE",
    vehicle: null;
    avatar: null;
    acceptedDuration: number; // 84441, 추정: 라이더 배정 시각 - now (초). 매번 변한다.
    latitude: null;
    longitude: null;
    courierId: number; // 1011581,
    phone: string; // "01089745777"
  };
  state: null | {
    pickUpRemainingTime: number; // 0,
    deliveryRemainingTime: number; // 0, 픽업 이후에 0이 아닌 다른 숫자로 변경되는 것으로 추정
    preparationRemainingTime: number; // 0,
    statusValue: 'MERCHANT_ACCEPTED' | 'COURIER_ACCEPTED' | 'MERCHANT_READY' | 'COURIER_PICKEDUP' | 'DELIVERED' | 'CANCELLED';
    statusText: 'Assigned'           | 'Courier accepted' | 'Ready'          | 'Picked up'        | 'Delivered' | 'Delivery Cancelled';
    estimatedDeliveryTime: null;
  };
  groupId: null | string; // "2"
  groupName: null | string; // "어제" | "2019-08-14" UI 그룹용
  menuSummary: null | string; // "[메뉴 7개] 23,200원",
  menuDetail: null | string; // "오리지날 왕김밥x1, 국물 떡볶이(기본 매콤달콤 1단, 중국 넓적당면 추가)x1, 오징어몸 튀김x1, 김말이 튀김x2, 특 야채 튀김x1, 진짜 옛날쫄면x1",
  canceledDetail: null;
}

export interface CoupangeatsAppStore {
  id: number; // 102628, storeId
  merchantId: number; // 2649,
  categories: {
    id: number; // 16,
    name: string; // "분식",
    exposeStatus: string; // "EXPOSE",
    parentId: null;
    imagePaths: string[]; // ["https://t3a.coupangcdn.com/thumbnails/remote/500x500/image/eats/category/2/img_bunsik_1.jpg", "https://t4c.coupangcdn.com/thumbnails/remote/500x500/image/eats/category/2/img_bunsik_2.jpg"]
  }[];
  paymentStoreId: string; // "194509023284",
  name: string; // "마마수 리얼수제분식",
  description: string; // "전공정 100%리얼수제로 MSG,냉동반제품을 절대쓰지않습니다.퀄리티를 최우선 하겠습니다",
  telNo: string; // "025116699",
  bizNo: string; // "534-87-01032",
  approvalStatus: string; // "APP_DISPLAY",
  openStatus: 'OPEN' | 'EATS_SERVICE_CLOSED';
  openStatusText: string; // '영업준' | '"오늘 오전 11:00 오픈",
  zipNo: string; // "06154",
  address: string; // "서울 강남구 삼성동 119-9",
  addressDetail: string; // "경산빌딩 지하1층 고스트키친 1호실",
  remainingTime: null;
  latitude: number; // 37.5123480599,
  longitude: number; // 127.0532145737,
  serviceFeeRatio: number; // 0.0,
  nextOpenAt: string; // "오늘 오전 11:00 오픈",
  menus: [];
  imagePaths: string[]; // ["https://t3a.coupangcdn.com/thumbnails/remote/1024x1024/image/eats/store/102628/afb3e61a-f8bf-4531-888f-b1c9356c75e3.jpg", "https://t3c.coupangcdn.com/thumbnails/remote/1024x1024/image/eats/store/102628/1e8f165f-6e9b-496c-9a09-0cb8d22575d2.jpg", "https://t1a.coupangcdn.com/thumbnails/remote/1024x1024/image/eats/store/102628/0c05b83e-3c66-4a13-9cf2-164ee34252d0.jpg"],
  taxBaseType: 'TAXABLE';
  reviewRating: number; // 4.5,
  reviewCount: number; // 115,
  favorite: boolean; // false,
  storeLevelInfoId: null;
  manuallyShutdown: boolean; // false,
  notice: null;
  badges: null;
  estimatedDeliveryTime: null;
  storeNotice: null;
  benefit: null;
  deleted: boolean; // false
}

interface CoupangeatsAppError {
  code: string; // "20004",
  message: string; // "입력하신 아이디/비밀번호가 맞지 않습니다."
}

export interface CoupangeatsAppLoginMerchantResponse {
  data: {
    id: number; // 10992,
    loginId: string; // "clubhead",
    name: string; // "김민수",
    email: string; // "clubhead@naver.com",
    token: null | {
      accessToken: string; // "51sig1lT7YNWXgOmfUOqw8EMs_bFEj5995eFtiXBt3VLVPj3gSl7IJkG-k5XUFXIIVo0PE4_N-s4z4Rsp9rIak_VBjbbKGBaUT-xUAoML1HdEiSE4K4sNJ9bC9xnuLAXT7TRFWxMOA9nNnx4XxUDvzhZnVqKUqMpUFYixgDfoRQtTYalg50QXBIGWAx0Wr_fgZOI-Vy23y3PElvqODTzizFcW-eYCuAaUXuOtDoEc--8ahH3wwaOuL0OSrx0l3VoTVULEUAbisYL1nj7aANmxMo4xNm0oW5aFx9GXQN3_0BwUjMg6diuzL6mkS4srDjjCAkOUhslxXmb6rmtSATcgxCxVa3DV8_xZrMM9STtsvc=",
      refreshToken: null;
      accountId: null;
    };
    merchantId: number; // 2649,
    type: string; // "MERCHANT",
    responsibleStoreId: number; // 102628,
    stores: null;
    logIdentifier: null | string; // "MERCHANT-clubhead"
  };
  error: null | CoupangeatsAppError;
}

/**
 * token 필드의 값이 null이다.
 */
export type CoupangeatsAppTokenAuthResponse = CoupangeatsAppLoginMerchantResponse;

export interface CoupangeatsAppRegisterDeviceResponse {
  data: {
    id: number; // 48174,
    storeId: number; // 102628,
    deviceId: string; // "B8939B91-38C7-4AA2-9D33-1488B9D60619/com.coupang.eats-merchant",
    token: string; // "aba32471330f90983d9e6ea53603fa7452746451f57ff49798cf85bdf8604957",
    locale: string; // "ko-KR",
    osType: string; // "IOS",
    appVersion: string; // "1.0.14",
    phase: string; // "production"
  };
  error: null | CoupangeatsAppError;
}

export interface CoupangeatsAppStoreScoreCardResponse {
  data: {
    evaluationGuideText: string; // "최근 100건 기준",
    scoreItems: {
      title: string; // "고객 별점",
      iconPath: string; // "https://img4c.coupangcdn.com/image/eats/icon/scorecard/home_good.png",
      score: {
        text: string; // "4.4",
        color: string; // "#333333",
        size: number; // 32,
        bold: boolean; // false,
        strikeThrough: boolean; // false
      }[];
    }[];
    missedSales: {
      drawTooltip: boolean; // true,
      contents: {
        text: string; // "이번주 아쉽게 놓친 매출은 27,500원 (2건)",
        color: string; // "#f63772",
        size: number; // 14,
        bold: boolean; // false,
        strikeThrough: boolean; // false
      }[];
    };
  };
  error: null | CoupangeatsAppError;
}

/**
 * 업소 접수 전의 신규 주문에 대한 응답이다.
 *
 * 다음의 필드가 null이다.
 * courier, state, groupId, groupName, menuSummary, menuDetail, canceledDetail
 */
export interface CoupangeatsAppNextOrderResponse {
  data: null | CoupangeatsAppOrder;
  error: null | CoupangeatsAppOrder;
}

/**
 * ACCEPTED 상태인 주문을 응답
 */
export interface CoupangeatsAppStoreOrdersResponse {
  data: {
    content: null | CoupangeatsAppOrder[];
    nextToken: null;
    courierTags: {
      id: 8 | 9 | 10;
      displayName: '늦게 도착' | '불친절' | '불필요한 연락';
    }[];
  };
  error: null | CoupangeatsAppError;
}

/**
 * 완료(COMPLETED)나 취소(CANCELLED) 된 주문은 destination이 null이 된다.
 */
export type CoupangeatsAppStoreOrdersHistoryResponse = CoupangeatsAppStoreOrdersResponse;

export interface CoupangeatsAppGetStoreResponse {
  data: CoupangeatsAppStore;
  error: null | CoupangeatsAppError;
}
