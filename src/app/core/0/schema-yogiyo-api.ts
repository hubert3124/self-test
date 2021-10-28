// /api/owners/login
// 'error'인 경우에는 result, error_message만 응답
// 'ok'인 경우에는 error_message 필드는 없음
export interface YogiyoAppLoginResponse {
  show_mall?: boolean; // true,
  restaurants?: {
    name: string; // "버거그랩",
    phones: string[]; // "07042578889",
    company_number: string; // "584-21-00973",
    address: string; // "서울 강남구 삼성동 119-9 경산빌딩 지하1층 9호",
    logo: string; // "https://www.yogiyo.co.kr/media/restaurant_logos/업체자체_20200330_362424_버거그랩_대표사진_300x300.jpg",
    id: number; // 362424
  }[];
  result: 'ok' | 'error'; // "ok",
  app_id?: string; // "YUKL4C"
  error_message?: string; // "app not found",
}

/**
 * 포장인 경우에만 사용하는 필드
 * - pickup_code
 * - expected_pickup_date
 * - expected_pickup_time
 */
export interface YogiyoAppOrderListItem {
  /** '[안전배달] 문 앞에 놓고, 전화주세요! (8ksnsna)리뷰이벤트 치즈떡사리' */
  comment: string;
  /** 'delayed' 앱에서 '배달 지연'으로 노출된다. */
  status: 'pending' | 'retry_processing' | 'completed' | 'failed' | 'delayed';
  /** '' | '2020-07-02 17:30:00' (포장) */
  expected_pickup_date: '';
  /** '2020-04-06 14:16:25' */
  submitted_at: string;
  /** '' | '17:30' (포장) */
  expected_pickup_time: string;
  payment_method: '현장결제/카드' | '현장결제/현금' | '요기서결제/네이버페이' | '요기서결제/스마일페이' | '요기서결제/카카오페이' | '요기서결제/페이코' | '요기서결제/휴대전화' | '요기서결제/신용카드' | '요기서 1초결제' | 'EBAY 결제';
  /** 'https://www.yogiyo.co.kr/smsrelay/process_order_apps/413909261/206382/' */
  order_link: string;
  /** 16800 */
  price: number;
  /** '' | '7LLLRTTCB' (포장) */
  pickup_code: string;
  /** '1인분 마라샹궈' | '더블패티버거세트（더블패티버거＋케이준프렌치프라이＋탄산음료355mL 中 택1） 외 3건' */
  order_items: string;
  /**
   * ex)455 -> 앱에서 '픽업예정시간 6분 55초'으로 표기된다.
   * 이 숫자를 기준으로 HTML의 배달원 도착 예정 시간이 정해지는 것으로 보인다.
   * 이 숫자가 0이 되면 앱 목록에서는 '픽업 완료'라고 나온다.
   */
  remaining_delivery_seconds: number;
  /** '결제완료' | '현장카드' | '현장현금' */
  payment_result: string;
  /** '송파구 잠실동 27 잠실주공아파트 511동 904호' */
  customer_address: string;
  /** 0 */
  pending_seconds: number;
  /** waiting일때 null, completed되면서 25 */
  /** 50, 포장은  */
  delivery_minutes: number | null;
  /** '20040614565849' */
  order_number: string;
  /** 413909261 */
  id: number;
  restaurant: {
    /** 419447 */
    id: number;
    /** '마라하오-잠실점 */
    name: string;
  };
  /** 익스프레스 주문의 경우 true */
  is_own_delivery_order: boolean;
  /** 익스프레스 주문의 경우 true */
  is_simultaneous_od_order: boolean;
  od_rider_name: string;
}

export interface YogiyoAppOrderListResponse {
  processing_total_count: number; // 67,
  waiting_total_count: number; // 0,
  has_next: boolean; // true,
  data: YogiyoAppOrderListItem[];
}

export interface YogiyoAppOrderActionResponse {
  result: 'OK';
  error: null | string;
}

export interface YogiyoAppSendVeriCodeResponse {
  result: 'ok';
}
