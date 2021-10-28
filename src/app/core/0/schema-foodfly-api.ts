//////////////////////////////////////////////////////////////////////////////
//
// foodfly-ceo-proxy
//

// '0',  // 신규주문
// '1',  // 미접수 (접수하지 않았는데 취소된 경우로 추정), OM_ACCEPT_TIME은 '0'
// '3',  // 조리중
// '5',  // 조리완료
// '98', // 취소
// '99', // 거부
export type FoodflyAcceptStatus = '0' | '1' | '3' | '5' | '98' | '99';
// '0' : 미배차
// '1' : 배차대기
// '2' : 배차
// '3' : 업장도착
// '4' : 픽업
// '5' : 배달완료
// '6' : 취소
export type FoodflySendStatus = '0' | '1' | '2' | '3' | '4' | '5' | '6';

// '1' : 푸드플라이 배송
// '2' : 매장자체배송
// '3' : 포장
export type FoodflyDeliveryType = '1' | '2' | '3';

export interface FoodflyCeoListOrder {
  OM_IDX: string; // '5965908',
  CM_IDX: string; // '24404',
  OM_NO: string; // '6501900792051911',
  OM_STATUS: string; // '2',
  OM_SEND_STATUS: FoodflySendStatus; // '5',
  CM_CONTRACTED: string; // '1',
  M_NO: string; // '310395',
  OM_DELIVERY_TYPE: FoodflyDeliveryType; // '1',
  OM_TAKEOUT_TIME: string; // '0',
  OM_RIDERAPP_TYPE: string; // 'n',
  OM_RIDERAPP_STATUS: string; // '2',
  OM_ACCEPT_TIME: string; // '1558258924',
  OM_NOTIFY_STATUS: string; // '1',
  OM_NOTIFY_TIME: string; // '1558258898',
  OM_ACCEPT_STATUS: FoodflyAcceptStatus; // '5',
  OM_REJECT_REASON: string | null;
  OM_PREPARE_TIME: string; // '0',
  OM_EST_PICKUP_TIME: string; // '20',
  OM_PRINT_STATUS: string; // '1',
  OM_PRINT_TIME: string; // '1558258924',
  OM_PRINT_STAFF: string | null; // null;
  OM_PRINT_ACCEPTANCE: string | null; // null;
  OM_PRINT_ACCEPTANCE_TIME: string | null; // null;
  OM_TCS_SEND_STATUS: string; // '0',
  OM_TCS_SEND_TIME: string | null;
  OM_TIME: string; // '1558257477',
  OM_CONFIRM_STAFF: string; // '4075',
  OM_C_TIME: string; // '0',
  OM_C_STAFF: string; // '0',
  OM_C_REASON: string; // '0',
  OM_COMMISSION_PERCENT: string; // '25.3',
  OM_COMMISSION_AMOUNT: string; // '1650',
  OM_PIC_NAME: string; // '최지현',
  OM_PIC_COMMISSION_PERCENT: string; // '0',
  OM_FINAL_TOTAL_AMT: string; // '25500',
  OM_TOTAL_AMT: string; // '22000',
  OM_PURCHASE_PRICE: string; // '22000',
  OM_TOTAL_MENU_CNT: string; // '2',
  OM_TOTAL_ORDER_CNT: string; // '2',
  OM_CM_TOTAL_AMT: string; // '0',
  OM_CM_TOTAL_MENU_CNT: string; // '0',
  OM_CM_TOTAL_ORDER_CNT: string; // '0',
  OM_SEND_NAME: string; // '하현정',
  OM_SEND_TIME: string; // '0',
  OM_TIME_A: string; // '1558257519',
  OM_TIME_0: string; // '1558258886',
  OM_TIME_1: string; // '1558258898',
  OM_TIME_2: string; // '1558260548',
  OM_TIME_3: string; // '1558260578',
  OM_TIME_4: string; // '1558261431',
  OM_ESTIMATED_TIME_4: string; // '1558261478',
  OM_TIME_P: string; // '0',
  OM_SEND_ZIPCODE: string; // '',
  OM_SEND_ADDR: string; // '서울 서초구 잠원동 69-2',
  OM_SEND_ADDR2: string; // '반포쇼핑타운4동402호',
  OM_SEND_EMAIL: string; // 'hhj1777@hanmail.net',
  OM_SEND_MEMO: string; // '',
  OM_SEND_END_TIME: string; // '0',
  OM_ADMIN_MEMO: string; // '',
  OM_CONTROL_MEMO: string; // '',
  PM_METHOD: string; // '3',
  OM_DAILY_INDEX: null;
  OM_SEND_TEL: string; // '',
  OM_SEND_MOBILE: string; // '010-3899-1879',
  OM_SEND_MOBILE2: string; // '01038991879',
  OM_COUPON_NO: string; // '',
  OM_COUPON_DISCOUNT: string; // '0',
  OM_SEND_TIP_AMT: string; // '3500',
  OM_SEND_TIP_MODIFIED: string; // '0',
  OM_SEND_TIP_DEFAULT: string; // '3500',
  OM_SEND_TIP_ADDITIONAL_OFFLINE: string; // '0',
  OM_SEND_TIP_ADDITIONAL_ETC: string; // '0',
  OM_CANCEL_MEMO: string; // '',
  OM_UPDATE_DATE: string; // '1558257519',
  OM_INSERT_DATE: string; // '1558257477',
  OM_USE_POINT: string; // '0',
  OM_STAFF_IDX: null;
  OM_RIDER_IDX: string; // '3538',
  OM_OPERATE_STAFF_IDX: string; // '565',
  OM_AREA_CODE: string; // '11650106',
  OM_DISTRICT_IDX: string; // '3',
  OM_DISTRICT_SHARED: string; // '1',
  OM_SIGUGUN_CODE: string; // '650',
  OM_LEGACY: string; // '0',
  OM_CHANNEL: string; // '1',
  OM_ONLINE_DISCOUNT: string; // '0',
  OM_EVENT_DISCOUNT: string; // '0',
  OM_DISTANCE: string; // '2.422',
  OM_INCENTIVE: string; // '0',
  OM_INCENTIVE_ADD: string; // '0',
  OM_CVS_OPTION: string; // '0',
  OM_TAKEOUT_DISCOUNT: null;
  OM_AS_ORDER_MEMO: null;
  OM_AS_ORDER_TYPE: string; // '-1',
  OM_AS_COMMISSION: null;
  OM_FIRST_ORDER: string; // '0',
  OM_CVS_FEE: string; // '0',
  OM_CVS_MEMO: null;
  OM_CVS_INCENTIVE: null;
  menu_summary: string; // '혁명치킨 외 1개'
}

export interface FoodflyCeoDetailMenu {
  name: string; // "혁명치킨",
  options: string[]; // ["떡사리 추가", "순살로 변경"],
  count: string; // "1",
  amt: string; // "21000"
}

export interface FoodflyCeoDetailOrder {
  status: 'OK'; // "OK",
  order: {
    OM_NO: string; // "6501900792051911",
    OM_STATUS: string; // "2",
    OM_SEND_ADDR: string; // "서울 서초구 잠원동",
    OM_TOTAL_AMT: string; // "22000",
    OM_DISTANCE: string; // "2.422",
    OM_SEND_MEMO: string; // "",
    OM_TIME_1: string; // "1558258898",
    OM_EST_PICKUP_TIME: string; // "20",
    OM_ACCEPT_STATUS: FoodflyAcceptStatus; // "5",
    OM_DELIVERY_TYPE: FoodflyDeliveryType; // "1",
    OM_SEND_TIME: string; // "0",
    OM_SEND_STATUS: FoodflySendStatus; // "5"
  };
  menus: FoodflyCeoDetailMenu[];
}

