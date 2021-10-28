//
// 최근 업데이트 : 2020-06-30
//

// tslint:disable: max-line-length
// tslint:disable: no-null-keyword

//////////////////////////////////////////////////////////////////////////////
//
// baemin-app-proxy
//
// RIDER_ASSIGNED, PICKUP_COMPLETED는 BAERA인 경우에만 등장
export type BaeminAppOrderProgress = 'NEW' | 'RECEIPT' | 'RIDER_ASSIGNED' | 'PICKUP_COMPLETED' | 'COMPLETED' | 'CANCEL' ;
export type BaeminAppOrderStatus = 'NEW' | 'RECEIPT' | 'COMPLETED' | 'CANCEL';
export type BaeminAppRiderStatus = 'RIDER_ASSIGNED' | 'COOK_REQUESTED' | 'PICKUP_COMPLETED' | 'DELIVERY_COMPLETED';

export type BaeminCancelReasonCode =
  '01' | // 배달 지역 아님
  '19' | // 메뉴 및 가게정보 다름
  '20' | // 재료소진
  '04' | // 배달지연
  '05' | // 고객정보 부정확
  '06' | // 기타

  '07' | // 고객요청
  '24' | // 가게사정
  '25' | // 배달불가
  '26' ; // 재료소진

export interface BaeminAppFood {
  foodSeq: number; // 3416882,
  foodName: string; // "소고기 김치우동",
  foodContents: string; // "담백한 소고기와 매콤한 김치를 넣은 소고기 김치 우동",
  quantity: string; // "1",
  price: number; // 10500,
  priceGroup: {
    groupSeq: number; // 22447154,
    groupName: string; // "가격",
    isDefault: 'true' | 'false'; // "true",
    foodPrice: {
      priceSeq: number; // 439803652470952,
      shopFoodPriceSeq: number; // 22447155,
      priceName: string; // "치킨 가라아게(110g) 추가 ",
      price: number; // 9800
    }[];
  }[];
}

export interface BaeminAppListOrder {
  address: string; // "서울 강남구 역삼동 720-16 더메트호텔 705호",
  businessType: 'BAEMIN' | 'BAERA'; // 2019-06-04 /v4/orders에 추가된 필드
  channel: 'PC' | 'APP'; // "PC",
  cookRequestedDateTime: string | null; // "2019-07-31 13:14:24"
  deliveryMinutes: number; // 50, / 15 (조리시간)
  deliveryType: 'DELIVERY' | 'TAKEOUT'; // "DELIVERY",
  detailLink: string; // "https://bow.baemin.com/v2/orders/B0CV00DJ88",
  estimatedPickupExecuteTime: string | null; // "2019-07-31 13:29:24"
  estimatedPickupTime: string | null; // "오후 12시50분"
  foods: BaeminAppFood[];
  memo: string; // "리뷰 쓸께요",
  menuSummary: string; // "등심돈까스 카레 외 2개",
  merchantNo: string; // "201707100078",
  notiDateTime: string; // "2019-04-09 18:56:20",
  orderDateTime: string; // "2019-04-09 18:56:20",
  orderNo: string; // "B0CV00DJ88",
  orderReceiptDateTime: string | null; // "2019-04-09 18:56:33",
  orderStatus: BaeminAppOrderStatus; // "RECEIPT",
  orderToken: string; // "eyJ0eXAiOiJKV1QiLCJyZWdEYXRlIjoxNTU0ODA1NDE4NjI5LCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJPcmRlclRva2VuOkIwQ1YwMERKODgiLCJpYXQiOjE1NTQ4MDU0MTgsImV4cCI6MTU1NDgxNjIxOCwiZGF0YSI6eyJ0aW1lU3RhbXAiOiIxNTU0ODA1NDE4NjI5Iiwib3JkZXJObyI6IkIwQ1YwMERKODgifX0.M3Jt_PD6_YOsVKFk60YhCSaqvV1nzDWnY2rqdjLDCxU",
  paymentMethod: '' /*선불*/ | '1'/*후불현금*/ | '2' /*후불카드*/;
  pickupExecuteTime: string | null; // "2019-07-31 13:36:46"
  postpay: boolean; // true (후불), false(선불);
  price: number; // 32600,
  reserved: boolean; // false,
  reservedDateTime: string | null;
  riderStatus: BaeminAppRiderStatus | null;
  serviceType: 'BAEMIN' | 'BAERA'; // '; // "BAEMIN",
  smartOrderInfo: {
    tableNumber: string; // ''
    receiptNumber: string; // ''
  };
  siteCode: 'BAEMIN' | 'BAERA'; // "BAEMIN",
}

export interface BaeminAppDetailDeliveryInfo {
  phoneNo: string; // "05078516892",
  address: string; // "서울 강남구 논현동 277-36 이안오피스텔 1101호", "삼성2동"
  memo: string; // "숟가락 젓가락 주지마세요",
  latitude: number; // 37.50957304,
  longitude: number; // 127.04057254,
  addressJibun: string; // "서울 강남구 논현동 277-36",
  addressRoad: string; // "서울 강남구 봉은사로 307",
  addressDetail: string; // "이안오피스텔 1101호"
}

export interface BaeminAppDetailOrder {
  amountToReceive: number; // 11900
  businessType: null;
  cancelInfo: {
    cancelDate: string; // "2019/04/10 19:07:16.602",
    cancelUtcDate: string; // "20190410T100716Z",
    cancelCode: string; // "01",
    cancelReason: string; // "배달 지역 아님"
  } | null;
  channel: 'PC' | 'APP'; // "PC",
  cookRequestedTime: string | null; // "2019-07-31 13:14:24"
  deliveryInfo: BaeminAppDetailDeliveryInfo;
  deliveryMinutes: string; // "50",
  deliveryTip: number; // 1000 / 4600
  deliveryType: 'DELIVERY';
  estimatedPickupTime: string | null; // "오후 12시30분"
  estimatedPickupExecuteTime: string | null;
  foods: BaeminAppFood[];
  includeAlcohol: boolean; // false,
  maxPickupTime: string; // "0" / "30"
  merchantNo: string; // "201707100078",
  minPickupTime: string; // "0" / "5"
  notiDateTime: string; // "2019-04-09 18:17:48",
  notiSelectedTime: number; // -1,
  orderDate: string; // "2019-04-09",
  orderDateTime: string; // "2019-04-09 18:17:48.0",
  orderInProgressCount: string; // "0",
  orderModifyDateTime: string; // "2019-04-09 18:50:52.0",
  orderNo: string; // "B0CV00B254", "T0G000000UN3"
  orderProgress: BaeminAppOrderProgress; // "COMPLETED",
  orderReceiptDateTime: string; // "2019/04/09 18:19:30.719",
  orderSeq: number; // 632170301259304,
  orderServiceText: null; // 2019-07-31 발견
  orderServiceType: null; // 2019-07-31 발견
  orderStatus: BaeminAppOrderStatus; // "COMPLETED",
  orderTime: string; // "오후 06:17",
  orderUtcTime: string; // "20190409T091748Z",
  payInfo: {
    paymentGroup: '1' /*선불*/ | '2' /*후불*/;
    paymentMethod: string; // 1:선불카드, 2:휴대폰, 5:후불현금, 6:후불카드, 12:페이코, 16:네이버, 17:카카오페이, ... 사장님 사이트와 비교하면 알 수 있다.
    price: number; // 10900,
    salePrice: string; // "10818",
    vat: string; // "1082",
  };
  pickupExecuteTime: string | null; // "2019-07-31 13:36:46"
  rdate: string; // "2019-04-09 18:17:51.0",
  receiptNumber: null;
  reserved: boolean; // false,
  reservedDateTime: string | null;
  riderInfo: {
    businessDay: string; //  "20190731"
    cookRequestedTime: string; //  "2019-07-31 13:14:24"
    deliveryFee: string; //  "4400"
    estimatedPickupExecuteTime: string; //  "2019-07-31 13:29:24"
    handOverTime: string; //  "2019-07-31T04:47Z"
    messageUrl: string; //  ""
    messageUserId: string; //  ""
    pickupExecuteTime: string; //  "2019-07-31 13:36:46"
    pickupTime: string; //  "2019-07-31T04:00Z"
    reDelivery: boolean; //  false
    riderAssignTime: string; //  "2019-07-31T03:46Z"
    riderName: string; //  "김진영"
    riderPhoneNo: string; //  "*****"
    sn: string; //  "0614HUCW"
  };
  riderStatus: BaeminAppRiderStatus | null; // "DELIVERY_COMPLETED"
  seq: number; // 253047448,
  serviceType: 'BAEMIN' | 'BAERA'; // "BAEMIN",
  shopInfo: {
    shopNo: string; // "10716176",
    shopName: string; // "도쿄카레"
  };
  siteCode: 'BAEMIN' | 'BAERA'; // "BAEMIN",
  tableNumber: null;
  txDateTime: string; // "2019/04/09 18:50:51.814",
  udate: string | null;
}

//////////////////////////////////////////////////////////////////////////////
//
// baemin-ceo-proxy
//

export type BaeminCeoOrderStatus = 'OPENED' | 'ACCEPTED' | 'CLOSED' | 'CANCELLED';

/**
 * 주문 목록에 포함된 간략한 주문 정보
 */
export interface BaeminCeoListOrder {
  orderNo: string;
  status: BaeminCeoOrderStatus;
  serviceType: 'BAEMIN';
  deliveryType: 'DELIVERY';
  purchaseType: 'BARO' | 'MEET';
  reservation: boolean;
  payAmount: number;
  orderAmount: number; // deliveryTip이 포함되지 않은 금액
  discountAmount: number;
  orderDatetime: string;
  acceptDatetime: string;
  arriveDatetime: string;
  shop: {
    shopNo: string;
    categoryCode: '1' /*치킨*/ | '2' /*중식*/ | '3' /*피자*/ | '4' /*족발,보쌈*/ | '5' /*야식*/ | '6' /*찜,탕*/ | '7' /*패스트푸드*/ | '9' /*도시락*/ | '10'/*돈까스,회,일식*/ | '32' /*한식*/ | '33' /*분식*/ | '34' /*카페,디저트*/
    name: string;
  };
  items: {
    name: string;
    quantity: number;
  }[];
  charge: {
    deliveryTip: number;
    takeoutDiscountAmount: number | null;
  };
}

export interface BaeminCeoOrderListResponse {
  timestamp: number;
  statusCode: '200' | '401' | '503';
  statusMessage: string; // 'SUCCESS' | ...
  data: {
    totalCount: number;
    totalPayAmount: number;
    histories: BaeminCeoListOrder[];
  };
}

interface BaeminCeoOrderItemOptionItem {
  name: string;
  price: number;
  quantity: number;
}
interface BaeminCeoOrderItemOption {
  group: string; // '가격'
  items: BaeminCeoOrderItemOptionItem[];
}
export interface BaeminCeoOrderItem {
  name: string;
  price: number;
  quantity: number;
  options: BaeminCeoOrderItemOption[];
}

interface BaeminCeoOrderPayment {
  method: 'RIDER_CARD' | 'RIDER_CASH' | 'CARD' | 'MEET_CARD' | 'MEET_CASH';
  name: '만나서 카드결제' | '만나서 현금결제' | '카드결제';
  amount: number;
}

export type BaeminCategoryCode =
  '1' /*치킨*/ |
  '2' /*중식*/ |
  '3' /*피자*/ |
  '4' /*족발,보쌈*/ |
  '5' /*야식*/ |
  '6' /*찜,탕*/ |
  '7' /*패스트푸드*/ |
  '9' /*도시락*/ |
  '10'/*돈까스,회,일식*/ |
  '32' /*한식*/ |
  '33' /*분식*/ |
  '34' /*카페,디저트*/ |
  '48' /*아시안·양식*/;

export type BaeminRidersCategoryCode =
  '37' /* 한식 */ |
  '38' /* 양식 */ |
  '39' /* 디저트·커피 */ |
  '40' /* 일식·회 */ |
  '41' /* 아시안 */ |
  '43' /* 분식 */;

export interface BaeminCeoDetailOrder {
  acceptDatetime: string;
  arriveDatetime: string;
  card: boolean;
  cash: boolean;
  charge: {
    deliveryTip: number;
    takeoutDiscountAmount: number | undefined;
  };
  closedDatetime: string;
  deliveryType: 'DELIVERY' | 'TAKEOUT';
  discountAmount: number;
  discounts: {
    amount: number; // 23000 / 2000
    description: any; // null / "쿠폰"
    discountProvider: any; // null / "WOOWABROS"
    method: string; // "OKCASHBAG" / "COUPON"
    name: string; // "OK캐쉬백" / "할인쿠폰"
  }[];
  items: BaeminCeoOrderItem[];
  memo: {
    delivery: any[];
  };
  ocurredPoint: number; // 사라진 필드로 추정
  orderAmount: number;
  orderDatetime: string;
  orderNo: string;
  orderer: {
    tel: string | null;
    safetyTel: string | null;
    oldAddress: string;
    streetAddress: string;
  };
  payAmount: number;
  payments: BaeminCeoOrderPayment[];
  purchaseType: 'BARO' | 'MEET' | 'RIDER';
  remark: string;
  reservation: boolean;
  serviceType: 'BAEMIN' | 'BAERA';
  shop: {
    shopNo: string;
    name: string;
    tel: string;
    categoryCode: BaeminCategoryCode | BaeminRidersCategoryCode;
  };
  status: BaeminCeoOrderStatus;
}

export interface BaeminCeoDetailOrderResponse {
  timestamp: number;
  statusCode: '200' | '401' | '503';
  statusMessage: string; // 'SUCCESS' | ...
  data: BaeminCeoDetailOrder;
}

export interface BaeminCeoListShop {
  shopNumber: number; // 10676687,
  name: string; // "난나나 파스타&스테이크",
  address: string; // "서울특별시 강남구 논현동",
  addressDetail: string; // "118-18",
  telephoneInfo: {
    telephoneType: string; // "MAJOR",
    telephoneNo: string; // "025117598",
    virtualTelephoneNo: string; // "05063816035"
  }[];
  use: true;
  block: false;
  deliveryArea: string; // "강남구(논현1동, 논현2동, 역삼1동, 역삼2동[일부], 삼성2동, 청담동[일부], 대치4동, 신사동[일부]), 서초구(반포1동[일부], 서초2동[일부], 서초4동[일부], 잠원1동[일부])",
  shopIntro: string; // "* 임시휴무 안내 *\n\n'난나나 파스타&스테이크'가 고객님들께 더 맛있는 파스타를 보내드리기위해 일주일간 리모델링을 진행하게 되었습니다.\n4/22(월)부터는 '난나나 파스타'에서 기존의 메뉴들을 만나보실 수 있습니다.\n그동안 '난나나 파스타&스테이크'를 사랑해주셔서 감사드리고, 리모델링 기간 동안 더 알차고 맛있는 메뉴 준비해서 돌아올테니 기다려주세요 >.<\n감사합니다.",
  logoPath: string; // "usr/shoplogoc/2018/2/14/676687_201802141337.jpg",
  logoCircle: string; // "usr/shoplogoc/2018/2/14/676687_201802141337.jpg",
  logoRectangle: string; // "usr/shoplogoc/2018/2/14/676687_201802141337.jpg",
  cardYn: 'Y' | 'N' | null; // null,
  closeDay: string; // "",
  shopCategory: string; // "배달의민족",
  shopCategoryCode: string; // "1",
  shopMenuCategory: string; // "패스트푸드",
  shopMenuCategoryCode: BaeminCategoryCode | BaeminRidersCategoryCode; // "7",
  baroSettlement: boolean; // true,
  minOrderPrice: number; // 10800,
  foodOrg: string; // "월남고추(베트남), 부추(국내산), 적채(국내산), 토마토(국내산), 레몬(미국산), 홍합(국내산), 닭고기(브라질산), 치킨가라아게(태국산), 청양고추(중국산), 샐러리(국내산), 쭈꾸미(베트남), 꽃게(중국산), 양배추(국내산), 간마늘(중국산), 마늘(국내산), 양송이(국내산), 양파(국내산), 숙주(국내산), 오이(국내산), 감자(국내산), 새송이(국내산), 고추가루(중국산), 오징어(국내산), 바지락(국내산), 우민찌(호주산), 계란(국내산), 우육 부채살(미국산), 새우(베트남), 대파(국내산) ",
  baeminShop: boolean; // true,
  starAvgScore: number; // 4.59,
  favorites: number; // 2008,
  regDate: string; // "2017-05-23T11:56:32",
  modDate: string; // "2019-04-11T20:31:05"
}

export interface BaeminCeoShopListResponse {
  timestamp: number;
  statusCode: '200' | '401' | '503';
  statusMessage: string; // 'SUCCESS' | ...
  data: BaeminCeoListShop[];
}

export interface BaeminCeoShopsOpenItem {
  shopNumber: number; // 10676687,
  name: string; // "난나나 파스타&스테이크",
  serviceTypes: ('BAEMIN' | 'BAERA')[]; // [ "BAEMIN"]
  categories: {
    code: BaeminCategoryCode | BaeminRidersCategoryCode;
    text: string; // '패스트푸드'
  }[];
  address: {
    region1Code: string; // "11",
    region1Name: string; // "서울특별시",
    region2Code: string; // "11680",
    region2Name: string; // "강남구",
    region3Code: string; // "11680590",
    region3Name: string; // "삼성2동"
  };
  operationHour: {
    openTime: string; // "11:30",
    closeTime: string; // "19:50",
    allDay: boolean;
  };
  businessPause: {
    startDate: string; // "2019-11-06T14:20",
    endDate: string; // "2019-11-06T15:30",
    reason: string; // "PERSONAL_REASON"
  };
  useAdService: boolean; // true,
  useSmartOrder: boolean; // false,
  status: boolean; // "OPEN",
  shopStopReason: null;
}

export interface BaeminCeoShopsOpenResponse {
  timestamp: number; // 1573006391107,
  statusCode: 'OK'; // "OK",
  statusMessage: 'OK'; // "OK",
  data: BaeminCeoShopsOpenItem[];
}

export interface BaeminCeoDetailShop {
  shopNumber: number; // 10676687,
  name: string; // "난나나 파스타&스테이크",
  serviceTypes: {
    id: string; // "BAEMIN",
    name: string; // "배달의민족"
  }[];
  categories: {
    id: string; // "FASTFOOD",
    name: string; // "패스트푸드"
  }[];
  telephoneInfo: {
    telephoneType: string; // "MAJOR",
    telephoneNo: string; // "025117598",
    virtualTelephoneNo: string; // "05063816035"
  }[];
  realLocation: {
    zipCode: string; // "135010",
    address: string; // "서울특별시 강남구 논현동",
    addressDetail: string; // "118-18",
    roadZipCode: string; // "",
    roadAddress: string; // "",
    roadAddressDetail: string; // "",
    region1Code: string; // "11",
    region1Name: string; // "서울특별시",
    region2Code: string; // "11680",
    region2Name: string; // "강남구",
    region3Code: string; // "11680531",
    region3Name: string; // "논현2동",
    latitude: number; // 37.5171953,
    longitude: number; // 127.0391858
  };
  intro: string; // "* 임시휴무 안내 *\n\n'난나나 파스타&스테이크'가 고객님들께 더 맛있는 파스타를 보내드리기위해 일주일간 리모델링을 진행하게 되었습니다.\n4/22(월)부터는 '난나나 파스타'에서 기존의 메뉴들을 만나보실 수 있습니다.\n그동안 '난나나 파스타&스테이크'를 사랑해주셔서 감사드리고, 리모델링 기간 동안 더 알차고 맛있는 메뉴 준비해서 돌아올테니 기다려주세요 >.<\n감사합니다.",
  foodOrg: string; // "월남고추(베트남), 부추(국내산), 적채(국내산), 토마토(국내산), 레몬(미국산), 홍합(국내산), 닭고기(브라질산), 치킨가라아게(태국산), 청양고추(중국산), 샐러리(국내산), 쭈꾸미(베트남), 꽃게(중국산), 양배추(국내산), 간마늘(중국산), 마늘(국내산), 양송이(국내산), 양파(국내산), 숙주(국내산), 오이(국내산), 감자(국내산), 새송이(국내산), 고추가루(중국산), 오징어(국내산), 바지락(국내산), 우민찌(호주산), 계란(국내산), 우육 부채살(미국산), 새우(베트남), 대파(국내산) ",
  orderNotice: string; // "* 임시휴무 안내 *\n\n'난나나 파스타&스테이크'가 고객님들께 더 맛있는 파스타를 보내드리기위해 일주일간 리모델링을 진행하게 되었습니다.\n4/22(월)부터는 '난나나 파스타'에서 기존의 메뉴들을 만나보실 수 있습니다.\n그동안 '난나나 파스타&스테이크'를 사랑해주셔서 감사드리고, 리모델링 기간 동안 더 알차고 맛있는 메뉴 준비해서 돌아올테니 기다려주세요 >.<\n감사합니다.",
  useSmartMenu: boolean; // true,
  useBaroPay: boolean; // true,
  useAdService: boolean; // true,
  status: string; // "OPEN",
  logo: {
    circleLogo: string; // "usr/shoplogoc/2018/2/14/676687_201802141337.jpg",
    rectangleLogo: string | null;
  };
  headerImageFileList: {
    seq: number; // 1,
    size: string; // "720",
    path: string; // "usr/shop_header/2018/2/26",
    name: string; // "676687_720_201802261723.jpg"
  }[];
  businessInfo: {
    shopNumber: number; // 201707100078,
    bizNo: string; // "6728100712",
    subBizNo: string; // "",
    bizTypeCode: string; // "BUSINESS",
    bizType: string; // "즉석판매제조",
    bizSubTypeCode: string; // "음식점업",
    name: string; // "주식회사 단추로끓인수프",
    ceoName: string; // "최정이",
    dateOfBirth: string; // "",
    gradeCode: string; // "ADVERTISEMENT",
    statusCode: string; // "OPEN",
    billInfo: {
      taxTypeCode: string; // "CORPORATE",
      taxBillTypeCode: string; // "TAX_BILL",
      cashBillProofCode: string; // "NONE",
      billIdentityTypeCode: string; // "BUSINESS_NO",
      billIdentityNo: string; // "6728100712",
      billIdentitySsn: string; // ""
    };
    manager: {
      memberNumber: any; // null,
      name: string; // "최정이",
      relType: string; // "1",
      relTypeName: string; // "본인",
      mobileNo: string; // "01027988608",
      email: string; // "bum.park@buttonsoup.co"
    };
  };
  orderOptions: {
    reservationOrder: boolean; // false,
    minimumOrderPrice: number; // 10800,
    takeOutDiscount: {
      discountFee: number; // 0,
      discount: boolean; // false,
      minimumOrderAmountDiscount: boolean; // false
    }
  };
  deliveryFee: {
    regions: any; // null,
    days: {
      deliveryFee: number; // 1000,
      dayCode: string; // "MONDAY",
      dayName: string; // "월요일",
      startTime: string; // "00:00",
      endTime: string; // "24:00"
    }[];
    holiday: any; // null
  };
  deliveryRegion: {
    regionType: string; // "GEOFENCE",
    deliveryArea: string; // "강남구(논현1동, 논현2동, 역삼1동, 역삼2동[일부], 삼성2동, 청담동[일부], 대치4동, 신사동[일부]), 서초구(반포1동[일부], 서초2동[일부], 서초4동[일부], 잠원1동[일부])",
    areas:
    {
      region1Code: string; // "11",
      region2Code: string; // "11650",
      region3Code: string; // "11650520",
      region1Name: string; // "서울특별시",
      region2Name: string; // "서초구",
      region3Name: string; // "서초2동"
    }[];
    geofence: {
      latitude: any; // null,
      longitude: any; // null
    }[];
  };
  franchise: any; // null
}

/**
 * 다른 Ceo 응답과 형태가 다르다.
 */
export interface BaeminCeoDetailShopResponse {
  timestamp: number; // 1555066252971,
  statusCode: string; // "OK",
  statusMessage: string; // "OK",
  data: BaeminCeoDetailShop;
}

/**
 * 2019-04-23 확인
 *
 * prices: 배열의 형태를 갖지만 요소의 개수는 1개이다. optionGroups를 밖으로 빼 내면서 예전의 모습이 남은 것으로 추정된다.
 *
 * 표시/숨김 설정 : show
 * 메뉴 타입 : type
 * status는 show와 함께 움직인다.
 * soldOutDate는 soldOutInfo.resetData와 값이 같다. 해당일부터 판매 가능하다는 뜻이다.
 * representative : true이면 representativeMenuGroup과 menuGroups 양쪽에 모두 존재하며 대표 메뉴에도 표시된다.
 */
interface BaeminCeoMenupanSoldOutInfo {
  id: number; // 19134234
  soldOut: boolean; // true
  resetDate: string; // "2019-04-26"
}
interface BaeminCeoMenupanMenuGroup {
  id: number; // 0,
  name: string; // "representative_group",
  description: string; // "",
  sequence: number; // 0,
  status: string; // "on",
  menus: {
    id: number; // 16844841,
    name: string; // "가라아게카레정식",
    imageUrl: string; // "http://imagefarm.baemin.com/smartmenuimage/upload/image/2018/32/2018/32/oK-Zx5hAw01B8p2-B7oj4roQwomg6EaQYGz-BilKBNEvdTBK6WTcxb6Im6M_jiPE1ai-RtsBrQD4S68GKA4gGTMTydAw5cAtbhoXs0LCJK3EHYhkVVvC1X0giRA3VX-w.jpg",
    summary: string; // "촉촉한 치킨가라아게와 함께 먹는 진하고 부드러운 카레+미니 면 요리",
    description: string; // "치킨 가라아게카레+미니 면 요리",
    type: 'normal' | 'set'; // "set",
    nutrient: any; // null,
    allergy: any; // null,
    placeOfOrigin: string; // "",
    soldOut: boolean; // false,
    soldOutDate: null | string; // "2019-04-26",
    soldOutInfo: null | BaeminCeoMenupanSoldOutInfo;
    representative: boolean; // true,
    sequence: number; // 1,
    status: 'on' | 'off'; // "off",
    linked: boolean; // false,
    show: boolean; // false,
    editable: boolean; // true,
    priceGroup: {
      id: number; // 149404122,
      prices: {
        id: number; // 149404123,
        name: string; // "치킨 가라아게카레+미니 면 요리",
        price: number; // 10900,
        sequence: number; // 1,
        optionGroups: any[]; // []
      }[];
    };
    optionGroups: {
      id: number; // 149404124,
      name: string; // "면요리 선택",
      min: number; // 1,
      max: number; // 1,
      sequence: number; // 1,
      options: {
        id: string; // "157596133",
        name: string; // "미니 우동",
        price: number; // 0,
        sequence: number; // 1,
        soldOutInfo: null | BaeminCeoMenupanSoldOutInfo;
      }[];
    }[];
  }[];
}

export interface BaeminCeoMenupan {
  id: number; // 390005,
  status: boolean; // true,
  autoUpdate: boolean; // false,
  locked: boolean; // false,
  hasSecondOptionGroup: boolean; // false,
  legacy: boolean; // false,
  representativeMenuGroup: BaeminCeoMenupanMenuGroup;
  menuGroups: BaeminCeoMenupanMenuGroup[];
}

export interface BaeminCeoMenupanResponse {
  timestamp: number; // 1555066252971,
  code: string; // "0000",
  message: string; // "OK",
  result: BaeminCeoMenupan;
}

//////////////////////////////////////////////////////////////////////////////
//
// 배민 사용자 앱 api
//
export interface BaeminUserShopFood {
  Shop_Food_Grp_Seq: string; // '2643179',
  Shop_Food_Seq: string; // '16314030',
  Food_Nm: string; // '(타임이벤트 진행중!) 규동',
  Img_Url: string; // 'http://imagefarm.baemin.com/smartmenuimage/upload/image/2018/20/2018/20/oJf6a5pQpts4o3Fi6qS9x0-ywGEW8zGYoAs4xGQF8Dc=.jpg',
  Remark: string; // '고소한 우삼겹을 넣은 일본식 소고기덮밥',
  Food_Cont: string; // '고소한 우삼겹을 넣은 일본식 소고기덮밥',
  Cook_Type: string; // 'none',
  Use_Yn_Ord: 'Y' | 'N'; // 'Y',
  Menu_Ty_Cd: string; // 'normal',
  Food_Nutrition: string; // '',
  Food_Allergy: string; // '',
  Sold_Out: boolean; // false,
  Food_Nutrition_Url: string; // '',
  Img_Urls: any[]; // [],
  List_Shop_Food_Price_Grp: {
    Shop_Food_Seq: string; // '16314030',
    Shop_Food_Grp_Seq: string; // '2643179',
    Shop_Food_Price_Grp_Seq: number; // 149404084,
    Shop_Food_Price_Grp_Nm: string; // '가격',
    Min_Sel: string; // '1',
    Max_Sel: string; // '1',
    Def_Price_Yn: 'Y' | 'N'; // 'Y',
    Discount: boolean; // false,
    List_Shop_Food_Price: {
      Shop_Food_Seq: string; // '16314030',
      Shop_Food_Grp_Seq: string; // '149404085',
      Shop_Food_Price_Grp_Seq: number; // 149404084,
      Shop_Food_Price_Seq: string; // '149404085',
      Food_Price_Nm: string; // '',
      Food_Price: string; // '7800',
      Normal_Food_Price: string; // '',
      Use_Yn_Ord: 'Y' | 'N'; // 'Y',
      Sold_Out: boolean; // false
    }[];
  }[];
  representative: boolean; // false
}

export interface BaeminUserShopMenuOrd {
  rec: BaeminUserShopFood[];
  normal: {
    Shop_Food_Grp_Seq: string; // "2643181",
    Shop_Food_Grp_Nm: string; // "추천메뉴",
    Img_Url: string; // "",
    Images: {
      order: number; // 1,
      Image_Detail: {
        normal: {
          url: string; // "http://imagefarm.baemin.com/smartmenuimage/upload/image/2019/34/2019/34/JtK2xl0WxByK60wWRkTe-ALtndXWIMjyGNaPQYf9W54wdbPQkK5VinMBjM18S-NW.jpg",
          width: null;
          height: null;
        };
      };
    }[];
    Remark: string; // "",
    List_Shop_Food: BaeminUserShopFood[];
  }[];
  set: BaeminUserShopFood[];
  solo: BaeminUserShopFood[]; // 2019-07-31에 발견
}

export interface BaeminUserShopRidersDeliveryTip {
  ridersDeliveryTipKind: string; // "CHANGEABLE",
  deliveryTipDetail: {
    description: string; // "배달팁은 주문금액에 따라 달라집니다.",
    deliveryTipElements: {
      orderPriceRange: {
        from: number; // 8000,
        to: number; // 9999
      },
      ridersDeliveryTipForCurrentRange: number; // 3900,
      index: number; // 0, 1, 2, 3
      orderPriceRangePhrase: string; // "8,000원~9,999원"
    }[];
  };
  deliveryTipRangePhrase: string; // "<font color='#888888'><del>4,300원 ~ 5,300원</del></font>",
  deliveryTipRangePhraseWithDiscount: string; // "<font color='#000000'>2,900원 ~ 3,900원</font>",
  deliveryTipProperty: {
    distance: number; // 0,
    extraDeliveryTip: number; // 0,
    ridersContractType: {
      contractType: string; // "R0002",
      contractEntryType: string; // "UNMODIFIABLE",
      commissionRate: number; // 15.0,
      ridersDeliveryTipKind: string; // "CHANGEABLE",
      commissionAmount: number; // 0,
      baseDeliveryDistance: number; // 1500,
      deliveryTipPerAdditionalDistance: number; // 1000,
      additionalDistanceUnit: number; // 500,
      minimumOrderPrice: number; // 8000,
      deliveryTipRules: {
        orderPriceFrom: number; // 8000,
        deliveryTip: number; // 5300
      }[];
    },
    ridersDeliveryTipDiscounts: {
      discountType: string; // "CONTRACT_DISCOUNT",
      discountPrice: number; // 1400,
      valid: boolean; // true
    }[];
  };
}

/**
 * 2019-09-27 v6
 */
export interface BaeminUserDetailShop {
  status: string; // "SUCCESS",
  message: string; // "성공",
  serverDatetime: string; // "2019-09-27 18:28:11",
  data: BaeminUserDetailShopData;
}

export interface BaeminUserDetailShopData {
  shop_info: {
    themeCodes: number[]; // [ 10 ],
    useReservedOrder: boolean; // false,
    useTakeout: boolean; // false,
    useTableOrder: boolean; // false, // 2019-12-31
    useDelivery: boolean; // true,
    takeoutDiscountPrice: number; // 0,
    takeoutDiscountWhenOverMinimumOrderPrice: boolean; // false,
    ridersDeliveryTipDescription: string; // '배민라이더스 배달팁은 배달주소와 가게의 거리, 주문금액, 가게 또는 지점의 운영상 사유 등에 따라 달라질 수 있습니다.',
    ridersDeliveryTip: BaeminUserShopRidersDeliveryTip | null; // 라이더스인 경우에만 사용
    actualAddress: {
      address: string; // '서울특별시 강남구 논현동 118-18',
      latitude: number; // 37.5171953,
      longitude: number; // 127.0391858
    };
    orderCountText: string; // '2000+',
    shopStatus: string; // 'OPEN';
    inDeliveryArea: boolean; // true // 2019-07-31에 발견
    soloShop: boolean; // false // 2019-07-31에 발견
    Shop_No: string; // '10716176',
    Shop_Nm: string; // '도쿄카레',
    Tel_No: string; // '025117598',
    Vel_No: string; // '05078863243',
    Fr_No: string; // '',
    Fr_Tel_No: string; // '05078863243',
    Addr: string; // '서울특별시 강남구 논현동',
    Loc_Pnt_Lat: string; // 37.5171953,
    Loc_Pnt_Lng: string; // 127.0391858,
    Review_Cnt: string; // '367',
    Star_Pnt_Avg: string; // '4.54',
    Dlvry_Tm_B: string; // '',
    Dlvry_Mi_B: string; // '',
    Dlvry_Tm_E: string; // '',
    Dlvry_Mi_E: string; // '',
    Dlvry_Date_1_B: string; // '',
    Dlvry_Date_1_E: string; // '',
    Dlvry_Date_2_B: string; // '',
    Dlvry_Date_2_E: string; // '',
    Dlvry_Date_3_B: string; // '',
    Dlvry_Date_3_E: string; // '',
    Block_Date_B: string; // '',
    Block_Date_E: string; // '',
    Close_Date_B: string; // '',
    Close_Date_E: string; // '',
    Logo_Host: string; // 'http://buf.baemin.com/cache',
    Logo_Path: string; // '',
    Logo_File: string; // '',
    Dlvry_Info: string; // '강남구(논현1동, 논현2동, 역삼1동, 역삼2동[일부], 삼성2동, 청담동[일부], 대치4동, 신사동[일부]), 서초구(반포1동[일부], 서초2동[일부], 서초4동[일부], 잠원1동[일부])',
    Close_Day: string; // '연중무휴',
    Shop_Intro: string; // "* 안내드립니다 *\n\n‘도쿄카레’를 운영하던 고스트키친이 공유주방을 준비하게되어 ‘도쿄카레’를 잠시 쉬어가려고 합니다.\n패밀리 브랜드인 ‘난나나 파스타’는 4/22(월)에 다시 오픈할 예정이오니 많이 찾아주세요.\n그동안 아껴주신 고객님들께 진심으로 감사 말씀 올립니다.\n(검색창에서 '난나나 파스타'를 검색해보세요!)",
    Favorite_Cnt: string; // '717',
    View_Cnt: 0,
    Call_Cnt: string; // '286',
    Ord_Cnt: string; // '2030',
    Ct_Cd: BaeminCategoryCode | BaeminRidersCategoryCode; // '10',
    Ct_Cd_Nm: string; // '돈까스·회·일식',
    Ct_Cd_Nm_En: string; // 'Japanese',
    Ct_Ty_Cd: string; // '1',
    Use_Yn_Ord: 'Y' | 'N'; // 'Y',
    Use_Yn_Ord_Menu: 'Y' | 'N'; // 'Y',
    Biz_No: string; // '6728100712',
    Shop_Owner_Nm: string; // '주식회사 단추로끓인수프',
    Ord_Avail_Yn: 'Y' | 'N'; // 'N',
    Svc_Shop_Ad_List: any[]; // [],
    Shop_Icon_Cd: string[]; // [ '2', '7', '18' ],
    Evt_Land_Ty_Val: string; // '',
    Dh_Img_Host: string; // '',
    Dh_Img_Path: string; // '',
    Dh_Img_File: string; // '',
    Review_Cnt_Latest: number; // 202,
    Review_Cnt_Ceo_Latest: number; // 204,
    Review_Cnt_Ceo_Say_Latest: number; // 2,
    Review_Cnt_Img: number; // 0,
    Review_Cnt_Ceo: number; // 371,
    Review_Cnt_Ceo_Say: number; // 5,
    Comp_No: string; // '',
    Comp_Nm: string; // '',
    Dh_Rgn_Ty_Cd: string; // '',
    Mov_Url: string; // '',
    Contract_Standard_Fee: string; // '',
    Contract_Sale_Fee: string; // '',
    Contract_Sale_Fee_Yn: string; // '',
    Noncontract_Standard_Fee: string; // '',
    Noncontract_Sale_Fee: string; // '',
    Noncontract_Sale_Fee_Yn: string; // '',
    Contract_Shop_Yn: string; // '',
    Baemin_Kitchen_Yn: string; // '',
    Shop_Prom: {
      Shop_Prom_Cd: string; // 'MAIN_PROMOTION',
      Shop_Prom_Cont: string; // ''
    };
    Ceo_Notice: {
      Review_Cont: null;
      Reg_Dt: null;
    };
    Ad_Yn: 'Y' | 'N'; // 'Y',
    Meet_Cash: 'Y' | 'N'; // 'Y',
    Meet_Card: 'Y' | 'N'; // 'Y',
    Dlvry_Tm: string; // '매일 - 오전 11:30 ~ 오후 8:00',
    Close_Day_Tmp: string; // '2019년 04월 12일 ~ 2020년 12월 31일',
    Award_Type: any[]; // [],
    Award_Info: any[]; // [],
    Cache: string; // '',
    Live_Yn_Shop: 'Y' | 'N'; // 'N',
    Shop_Cpn_Info: any; // {},
    Shop_Cpn_Yn: 'Y' | 'N'; // 'N',
    Live_Yn_Ord: 'Y' | 'N'; // 'N',
    Shop_Break_Yn: 'Y' | 'N'; // 'N',
    Break_Tm_Info: string; // '',
    Favorite_Yn: 'Y' | 'N'; // 'N',
    Distance: number; // 0.0,
    Distance_Txt: string; // '계산불가. 주소를 설정하면 배달거리를 확인할 수 있습니다.',
    badge: {
      Free: 'Y' | 'N'; // 'N',
      Discount: 'Y' | 'N'; // 'N'
    };
    sanitation: {
      IS_EXIST: boolean; // false
    };
    Ceo_Nm: string; // '최정이',
    Business_Location: string; // '서울 강남구 논현동 176-24 지하1층',
    deliveryTip: BaeminUserDetailShopDeliveryTip;
    Dlvry_Exactly_Time: 'Y' | 'N'; // 'N',
    Expected_Delivery_Time: string; // '',
    Dh_Fee: string; // ''
    trackingLog: { // 2019-10-22에 발견, fastDelivery만 남고 곧 사라졌다.
      baeminExpectedDeliveryTime?: {
        calcDeliveryTime: number; // 49.99987252941177
        deliveryTime: number[]; // [46, 56]
        deliveryTimeWeightVersion: string; // "1.0.0"
      };
      fastDelivery: boolean; // false
    };
  };
  shop_menu: {
    menu_info: {
      liquorOrder: {
        menuPopup: null | {
          infoPhrase: string; // "잠깐, 주류는 만 19세 이상 성인만 주문할 수 있어요! 라이더에게 <font color=\"#F52926\"><b>신분증</b></font>을 꼭 보여주세요!",
          subInfoPhrase: string; // "청소년보호법 제 28조에 따라 성인여부 확인이 필요하며, 본인 확인이 안될 경우 주류를 전달할 수 없습니다. 제출하신 정보는 성인여부 확인 외 다른 용도로 절대 활용되지 않습니다."
        }; // null,
        basketInfoPhrase: string; // '주류를 주문할 경우, 신분증을 확인할 수 있습니다'
        basketInfoHtmlPhrase: string; // "주류를 주문하셨네요. <font color=\"#F52926\"><b>신분증</b></font>을 준비해주세요"
      };
      Att_Cont: string; // "* 안내드립니다 *\n\n‘도쿄카레’를 운영하던 고스트키친이 공유주방을 준비하게되어 ‘도쿄카레’를 잠시 쉬어가려고 합니다.\n패밀리 브랜드인 ‘난나나 파스타’는 4/22(월)에 다시 오픈할 예정이오니 많이 찾아주세요.\n그동안 아껴주신 고객님들께 진심으로 감사 말씀 올립니다.\n(검색창에서 '난나나 파스타'를 검색해보세요!)",
      Min_Ord_Price: string; // '9900',
      Shop_Ord_Att: string; // '',
      Shop_Header_Img_Host: string; // 'http://img-cdn.baemin.com',
      Shop_Header_Img_Path: string; // 'usr/shop_header/2018/2/24',
      Shop_Header_Img_File: string; // '716176_720_201802241659.jpg',
      Shop_Header_Img: {
        Shop_Header_Img_Path: string; // "usr/shopheader/2019/7/30",
        Shop_Header_Img_File: string; // "5260843_shopheader.jpg"
      }[]; // [], 라이더스인 경우에만 배열에 아이템이 있는 것으로 추정
      Bangga_Msg: string; // '',
      Dsm_Tel_No: string; // '',
      Min_Ord_Price_Txt: string; // '최소주문금액 : 9,900원',
      Ct_Ty_Cd: string; // '1',
      Ord_Take_Ty_Cd: string; // '',
      IS_MENUALL: 'Y' | 'N'; // 'N',
      Baedal_Notice: string[]; // '메뉴이미지는 상품의 종류에 따라 제공되는 이미지로 실제 음식과 다를 수 있습니다.',
      Food_Org: string; // '계란(국내산), 호박고구마(국내산), 김치(중국산), 느타리버섯(국내산), 단호박(국내산), 닭다리살(브라질산), 당근(중국산), 대파(국내산), 돈육 등심(국내산), 돈육 민찌(미국산), 무(국내산), 방울토마토(국내산), 백미(국내산), 팽이버섯(국내산), 양배추(국내산), 양파(중국산), 우삼겹(미국산), 우육 민찌(호주산), 쪽파(국내산), 참나물(국내산), 청피망(국내산), 표고버섯(중국산), 홍피망(국내산), 감자(국내산), 샐러리(국내산), 오복채(국내산), 우육 차돌박이(미국산), 장마(국내산), 홍게대게살(국내산), 새송이(국내산)',
      Menu_Icon: any[]; // [],
      Menu_Img_Url: string; // '',
      disposition: {
        IS_EXIST: boolean; // false,
        CONTENTS: any[]; // []
      }
    };
    menu_ord: BaeminUserShopMenuOrd;
    menu_img: any[];
  };
}

export interface BaeminUserDetailShopDeliveryTip { // 라이더스인 경우에는 deliveryTipInfoPhrase('') 만 존재한다.
  deliveryTipInfoPhrase: string; // "가게 운영방침에 따라 주문금액, 배달주소, 시간 등에 의해 배달팁이 변경될 수 있습니다.",
  deliveryTipRangePhraseWithDiscount: string; // "<font color='#000000'>무료 ~ 3,000원</font>",
  deliveryTipRangePhrase: string; // "",
  deliveryTipChargePhrase: string; // "",
  deliveryTipCharges: {
    groupName: string; // "지역",
    groupPhrase: string; // "<font color='#000000'>500원</font> <font color='#888888'>신사동</font><br><font color='#000000'>1,000원</font> <font color='#888888'>압구정동</font>"
  }[];
  deliveryTipDetails: {
    index: number; // 0,
    orderPriceRangePhrase: string; // "<font color='#000000'>10,000원 ~ </font>",
    deliveryTipPhraseWithDiscount: string; // "<font color='#000000'>3,000원</font>",
    deliveryTipPhrase: string; // ""
  }[];
  orderPriceRangeDeliveryTips: {
    index: number; // 0,
    orderPriceRangePhrase: string; // "<font color='#000000'>10,000원 ~ </font>",
    deliveryTipPhraseWithDiscount: string; // "<font color='#000000'>3,000원</font>",
    deliveryTipPhrase: string; // ""
  }[];
}

export type BaeminUserDetailShopResponse = BaeminUserDetailShop;

//
// 삭제한 리뷰
// 게시자가 삭제한 리뷰입니다. 라고 앱에 표시된다.
// 예: https://admin.toe.cloud/firestore/baeminUserReview/2020071200093955
//
export interface BaeminUserReview {
  id: number; // 2020063000060558,
  member: {
    memberNo: number; // 200522005141,
    nickname: string; // "bombom",
    imageUrl: string; // "https://img-cdn.baemin.com/usr/memphoto/mamber_1.jpg",
    showReviews: boolean; // true | false (삭제된 경우)
  };
  rating: 0 | 1.0 | 2.0 | 3.0 | 4.0 | 5.0; // 0(삭제된 경우) 5.0,
  ceoOnlyMessage: string; // "",
  blockMessage: string; // "", "게시자가 삭제한 리뷰입니다"
  contents: string; // "사진찍는걸 깜빡햇어요 ㅠㅠ 두번째 주문인데 양도 넘 많고 맛잇어요 떡볶이 어렷을때 먹던 맛이라서 좋아요 깔끔한 포장도 좋고용!!",
  modifiable: boolean; // false,
  deletable: boolean; // false,
  displayStatus: 'DISPLAY' | 'DELETE';
  displayType: 'ALL' | 'CEO_ONLY';
  menus: {
    menuId: number; // 43762594,
    reviewMenuId: number; // 2020063000089193,
    name: string; // "진짜찰순대",
    recommendation: 'NONE' | 'GOOD';
    contents: string; // ""
  }[];
  comments: {
    id: number; // 2020062900001301,
    nickname: string; // "사장님",
    contents: string; // "예슬님,\n주문 주셔서 정말 감사드립니다 ! 항상 요청사항 꼼꼼히 확인해서 준비 해 드리고 있으니 요청사항 있으시면 언제든 편하게 적어주세요 ㅎㅎ 늘 맛있고 따듯한 분식을 제공해드리려 최선을 다하겠습니다 ! \n",
    displayStatus: 'DISPLAY';
    blockMessage: string; // "",
    ceoOnlyMessage: string; // "",
    dateText: string; // "어제"
  }[];
  images: {
    id: number; // 2020063000013592,
    url: string; // "https://img-cdn.baemin.com/fw/shopreview/2020/6/30/57553084_201402073615005912_1_b.jpg"
  }[];
  dateText: string; // "오늘" | "어제, 수정됨"
}

export interface BaeminUserReviewsResponse {
  status: 'SUCCESS';
  message: '성공';
  serverDatetime: string; // "2020-06-30 12:50:47",
  data: {
    reviews: BaeminUserReview[];
    shop: {
      no: number; // 13046495,
      name: string; // "달떡볶이 강남점",
      serviceType: 'BAEMIN'
    }
  };
}

/**
 * GET https://ceo.baemin.com/v2/commercial/campaigns/operation/{{shopNo}}?ts={{timestamp}} HTTP/1.1
 * 2019-11-14 확인
 */
export interface BaeminCeoCampaignsOperationResponse {
  timestamp: number; // 1573006391107,
  statusCode: 'OK'; // "OK",
  statusMessage: 'OK'; // "OK",
  data: BaeminCeoCampaignsOperationItem[];
}

export interface BaeminCeoCampaignsOperationItem {
  campaignId: number; // 105999,
  purchaseDateTime: string; // "2019-03-31T21:42:07.609",
  flightPeriod: {
    startDate: string; // "2018-11-03",
    endDate: string; // "2019-11-20"
  };
  ad: {
    adId: string; // "ULTRA_CALL_88000",
    group: null;
    type: null;
    scope: null;
    name: string; // "울트라콜",
    text: null;
    image: null;
    retailPrice: null;
    discountPrice: null;
    discountRate: null;
    intervalDays: null;
    confirmed: null;
    testing: null;
  };
  group: {
    code: string; // "ULTRA_CALL",
    text: string; // "울트라콜"
  };
  location: {
    address: string; // "서울 강남구 논현동 211-14",
    latitude: number; // 127.03496395509774,
    longitude: number; // 37.513392089181885
  };
  status: {
    code: string; // "OPERATING",
    text: string; // "광고 진행중"
  };
  serviceType: string; // "BAEMIN_LIST",
  displayName: string; // "난나나 파스타&스테이크",
  displayPause: null;
}

/**
 * 영업임시중지 GET,POST 응답
 * 확인: 2019-12-03
 */
export interface BaeminAppBlockResponse {
  timestamp: number; // 1554796338088,
  statusCode: '200' | '401' | '503'; // "200",
  statusMessage: string; // "SUCCESS",
  data: {
    merchantNo: string; // "201707100078",
    blocked: boolean; // true,
    temporaryBlockedInfo: string | null; // "임시중지시간 : 17:28 ~ 17:58"
  } | null;
}

export type BaeminCeoOperatingAdCampaignResponse = BaeminCeoOperatingAdCampaignItem[];

export interface BaeminCeoOperatingAdCampaignItem  {
  adKindId: 11 | 3361 | 3380; // 11 ULTRA_CALL, 3361 TAKEOUT, 3380 OPEN_LIST
  adInventoryId: 1 | 3 | 6; // 1 OPEN_LIST, 3 ULTRA_CALL, 6 TAKEOUT
  shopNumber: number; // 13021124,
  pause: boolean; // false,
  confirmed: boolean; // true,
  serviceBeginDate: string; // "2019-08-21",
  serviceEndDate: string; // "2020-06-10",
  adArea: string; // "POINT (127.01588083 37.49204685)",
  autoRenew: boolean; // true,
  totalCapacity: number; // -1,
  dailyCapacity: number; // -1,
  throttle: number; // 1.0000;
  contractor: {
    userId: string; // 'kbs_helee@woowacs.com',
    userName: string; // 'KBS이희은',
    userType: string; // 'SUPER'
  };
  data: {
    modified: string; // '2019-11-03T01:49:55.059Z',
    adAddress?: string; // '서울특별시 서초구 서초중앙로20길 34-8', TAKEOUT, OPEN_LIST의 경우에는 없다.
    possibleTakeout?: boolean; // TAKEOUT인 경우에만 존재, 포장
    displayOptions?: {  // OPEN_LIST인 경우에만 존재
      theme: boolean;   // 테마광고(1인분 등)
      listing: boolean; // 카테고리 리스트 상단
    };
    billingDate: string; // 'DAY_5' 매달 5일,
    serviceBeginDate: string; // '2019-08-17',
    displayCategories: string[]; /// [ 'KOREAN' ]
  };
  parentAdCampaignId: null;
  id: number; // 783371;
  adInventoryKey: 'ULTRA_CALL' | 'TAKEOUT' | 'OPEN_LIST';
  status: 'OPERATING';
  days: number; // 267;
  createdBy: {
    userType: string; // 'SUPER',
    userId: string; // 'kbs_helee@woowacs.com',
    userName: string; // 'KBS이희은'
  };
  modifiedBy: {
    userType: string; // 'SYSTEM',
    userId: string; // 'ad-center-billing',
    userName: string; // 'ad-center-billing'
  };
  createdAt: string; // '2019-08-16T10:43:57.233',
  modifiedAt: string; // '2020-05-05T17:33:10.072',
  adKind: {
    advertiserId: number; // 1,
    adInventoryId: 1 | 3 | 6;
    title: string; // '울트라콜',
    adKindKey: string; // 'ULTRA_CALL_88000',
    adKindGroup: string; // 'ULTRA_CALL',
    metadata: {
      combine: boolean; // true,
      canHaveDisplayName: boolean; // true,
      canHaveDisplayCategory: boolean; // true
    },
    properties: {
      radius: number; // 500,
      territoryType: string; // 'SPOT'
    },
    confirmed: boolean; // true,
    testing: boolean; // false,
    sellable: boolean; // true,
    sellableByBroker: boolean; // true,
    sellBeginDate: string; // '2016-01-04',
    sellEndDate: null,
    priority: string; // 0.5,
    adType: string; // 'LIST',
    adGoalType: string; // 'VISIT',
    supplyPrice: number; // 80000,
    dailySupplyPrice: number; // 2670,
    adIntervalDays: string; // 'MONTH1',
    defaultAutoRenew: boolean; // true,
    commissionRate: number; // 0.0000,
    commissionFixedSupplyPrice: number; // 0,
    commissionSpecialRate: number; // 0.0000,
    commissionSpecialFixedSupplyPrice: number; // 0,
    uiTemplateKey: string; // 'Location',
    uniqueInstanceKey: null,
    adCostType: string; // 'BIZMONEY_REGULAR',
    connectedShopTypes: string[]; // [ 'BAEMIN' ],
    adCampaignBeginDate: string; // '2019-04-01',
    id: 11 | 3361 | 3380; // 11 ULTRA_CALL, 3361 TAKEOUT, 3380 OPEN_LIST
    adInventoryKey: string; // 'ULTRA_CALL',
    createdBy: {
      userType: string; // 'SYSTEM',
      userId: string; // 'System',
      userName: string; // 'System'
    },
    modifiedBy: {
      userType: string; // 'SYSTEM',
      userId: string; // 'mayaul@woowahan.com',
      userName: string; // '고정섭'
    },
    createdAt: string; // '2019-03-31T21:20:28.132',
    modifiedAt: string; // '2019-07-09T15:14:57',
    maximumOverdueDay: number; // 0,
    commissionFixedPrice: number; // 0,
    settleExcludes: any[]; // [],
    commissionSpecialFixedPrice: number; // 0,
    adIntervalDaysCount: number; // 30,
    adIntervalDaysName: string; // '1개월'
  };
  cancelDateTime: null;
  serviceBeginDateTime: string; // '2019-08-21T00:00:00' (적용기간),
  serviceEndDateTime: string; // '2020-06-10T23:59:59.999999',
  childAdCampaignIds: string; // [];
  maximumCancelRequestServiceEndDate: string; // '2020-06-10',
  possibleOperating: boolean; // true;
  statusName: string; // '광고 진행중',
  possibleAdDisplayPause: boolean; // true;
}

export interface BaeminUserListShop {
  addonBadges: {
      backgroundColor: string; // "#F45452"
      text: '신규' | '쿠폰' // "신규"
  }[]; // [],
  campaignId: string; // "479429",
  Shop_No: string; // "12026763",
  Shop_Nm: string; // "화양156 강남점",
  Shop_Owner_No: string; // "201905275031",
  Addr: string; // "서울특별시 강남구 신사동 636-30",
  Addr_Det: string; // "",
  Dlvry_Date_1_B: string; // "",
  Dlvry_Date_1_E: string; // "",
  Dlvry_Date_2_B: string; // "",
  Dlvry_Date_2_E: string; // "",
  Dlvry_Date_3_B: string; // "",
  Dlvry_Date_3_E: string; // "",
  Shop_Representation_Menu: string; // "화양떡볶이, 크림떡볶이",
  Use_Yn_Ord: 'Y' | 'N'; // "Y",
  Use_Yn_Ord_Menu: 'Y' | 'N'; // "Y",
  List_Shop_Svc: any[]; // [],
  Svc_Rgn3_Cd: string; // "",
  Svc_No: string; // "2019050100",
  Svc_Expire_Time: string; // "2999-12-31T00:00:00.000+0900",
  Ct_Cd: BaeminCategoryCode; // "33",
  Shop_Intro: string; // "안녕하세요. 화양156입니다.\n저희는 주문접수와 동시에 음식이 조리가 됩니다. \n시간이 조금 걸리어도 조금만 기다려 주시면 금방 배달해 드리겠습니다.\n언제 어디서나 찾고싶은 맛으로 보답하겠습니다. \n화양동에서 기억나는 음식점으로 만들도록 하겠습니다.\n고객과 소통하며 가게를 운영하려고 노력합니다. \n모든 메뉴를 솔직하고 성실하게 조리 하겠습니다. \n감사합니다. 많이 이용해 주세요.",
  Dlvry_Info: string; // "",
  Use_Yn: 'Y' | 'N'; // "Y",
  Tel_No: string; // "025121560",
  Vel_No: string; // "05077784282",
  Close_Day: string; // "",
  Close_Date_B: string; // "",
  Close_Date_E: string; // "",
  Loc_Pnt: [number, number]; // [ 37.52701535, 127.03482257 ],
  Loc_Pnt_Lat: number; // 37.52701535,
  Loc_Pnt_Lng: number; // 127.03482257,
  Favorite_Cnt: number; // 15,
  Shop_Menu_Cnt: string; // "0",
  Review_Cnt_Img: number; // 6,
  Review_Cnt_Ceo: number; // 10,
  List_Svc_Shop_Ad: any[]; // [],
  Call_Cnt: number; // 4,
  Min_Ord_Price: number; // 13000,
  Ord_Cnt: number; // 37,
  Logo_Blank: string; // "",
  Logo_Host: string; // "http://buf.baemin.com/cache",
  Logo_Path: string; // "",
  Logo_File: string; // "",
  Logo_Cycle_Blank: string; // "",
  Logo_Cycle_Host: string; // "http://buf.baemin.com/cache",
  Logo_Cycle_File: string; // "19791295_logoc_12026763.jpg",
  Logo_Cycle_Path: string; // "shop/logo/2019/5/28",
  List_Shop_Dlvry_Rgn3: any[]; // [],
  Block_Date_B: string; // "",
  Block_Date_E: string; // "",
  Evt_Land_Ty_Val: string; // "",
  Live_Yn_Shop: 'Y' | 'N'; // "Y",
  Reg_Dt: string; // "",
  distance: number; // 0.0,
  List_Shop_Icon: string[]; // [ "2", "7", "18" ],
  Review_Cnt: number; // 10,
  Star_Pnt_Avg: number; // 4.3,
  Ct_Ty_Cd: string; // "1",
  Ct_Cd_Nm_En: string; // "Snack",
  Ct_Cd_Nm: string; // "분식",
  Dlvry_Tm: string; // "",
  Live_Yn_Ord: 'Y' | 'N'; // "Y",
  Review_Cnt_Latest: number; // 10,
  Review_Cnt_Ceo_Latest: number; // 10,
  Review_Cnt_Ceo_Say_Latest: number; // 1
}

export interface BaeminUserListShopsResponse {
  shop_list: BaeminUserListShop[];
  list_info: {
    totalCount: number; // 450;
    Connect: 'Albatross';
    List_Svc: {
      Svc_Nm: '오픈리스트' | '슈퍼리스트' | '파워콜'; // "오픈리스트",
      Ad_Yn: 'Y' | 'N'; // 'Y',
      Title_Img: string; // "http://bm-cdn.baemin.com",
      Ad_Cont: string; // "광고상품 영역으로\n브랜드명은 상호와 다를 수 있습니다.",
      Svc_No: '2019050100' | '2015061801' /* 슈퍼리스트 */ | '2013013001' /* 슈퍼리스트 */ | '2011120801'; // "2019050100",
      headerYn: boolean; // true
    }[];
  };
}

// "Ct_Ty_Cd": "4",
export type BaeminUserRidersCategoryCodeNumber =
  37 /* 한식 */ |
  38 /* 양식 */ |
  39 /* 디저트·커피 */ |
  40 /* 일식·회 */ |
  41 /* 아시안 */ |
  43 /* 분식 */
  ;
export type BaeminUserRidersCategoryCode =
  '37' /* 한식 */ |
  '38' /* 양식 */ |
  '39' /* 디저트·커피 */ |
  '40' /* 일식·회 */ |
  '41' /* 아시안 */ |
  '43' /* 분식 */
  ;

export const BaeminUserRidersCategoryMappings = {
  37: '한식',
  38: '양식',
  39: '디저트·커피',
  40: '일식·회',
  41: '아시안',
  43: '분식'
};

/**
 * 사용자 앱의 배민라이더스 목록 조회시 개별 업소의 구조체
 *
 * @export
 * @interface BaeminRidersListShop
 */
export interface BaeminUserRidersListShop {
  reviewStatisticsInfo: {
    starPointAverage: number; // 4.38,
    totalReviewCount: number; // 299,
    totalCeoReviewCount: number; // 119,
    totalImageReviewCount: number; // 125,
    latestReviewCount: number; // 154,
    latestCeoReviewCount: number; // 97,
    latestCeoSayReviewCount: number; // 3
  };
  shopInfo: {
    campaignId: string; // "185951",
    shopName: string; // "해물꽃돈'미소꽃돈'",
    categoryCode: BaeminUserRidersCategoryCodeNumber; // 37,
    telNumber: string; // "025485374",
    franchiseTelNumber: string; // "",
    virtualTelNumber: string; // "",
    logoPath: string; // "http://buf.baemin.com/cache/usr/shoplogo/2018/7/4/584188_201807041737.jpg",
    address: string; // "서울특별시 강남구 논현동 191-2",
    themes: BaeminUserRidersCategoryCode[]; // "37"
    shopNo: number; // 10584188,
    categoryType: number; // 4,
    minimumOrderPrice: number; // 16000,
    seafoodTheme: boolean; // false
  };
  shopStatusInfo: {
    useBaropay: boolean; // true,
    centerRunning: boolean; // true,
    businessDay: boolean; // true,
    operation: boolean; // true,
    shopBreak: boolean; // false,
    liveBaropay: boolean; // true
  };
  shopStatisticsInfo: {
    callCount: number; // 0,
    orderCount: number; // 1678,
    viewCount: number; // 0,
    favoriteCount: number; // 1234
  };
  deliveryInfo: {
    distance: number; // 0.09191029512926684,
    useExpectedDeliveryTime: boolean; // true,
    expectedDeliveryTime: string; // "약 56분",
    deliveryFeeTypeCode: string; // "2",
    deliveryRegionInfo: string; // "",
    originDeliveryFee: number; // 4300,
    deliveryFee: number; // 0,
    extraDeliveryFee: number; // 700,
    useShopExactlyDeliveryTime: boolean; // false
  };
  badge: {
    discount: boolean; // true
  };
  feeHtml: string; // "<font size='24px'; color='#333333'>배달팁</font> <font size='24px'; color='#000000'>700~ </font> <font size='24px'; color='#a9a9a9'><del>5,000~</del></font>",
  id: number; // 10584188
}

export interface BaeminUserRidersListShopsResponse {
  apiVersion: string; // "1.0"
  data: {
    shopInfoList: BaeminUserRidersListShop[];
  };
}
