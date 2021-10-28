export type VroongPosDeliveryStatus =
  | 'SUBMITTED'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'CANCELED';
type VroongPosDeliveryPayMethod = 'PREPAID' | 'AT_DEST_CARD' | 'AT_DEST_CASH';

interface VroongPosPickupAdjustment {
  pickup_expected_at: string; // '2018-12-06T18:44:00+0900'
  adjusted_by: 'AGENT' | 'STORE';
  adjustment_received_at: string; // '2018-12-06T18:14:46+0900'
}

interface VroongPosDeliveryAddress {
  beonji_address: {
    si_do: string; // 서울특별시
    si_gun_gu: string; // 강남구
    eup_myeon_dong_ri: string; // 신사동
    beonji: string; // 524-16
    detail_address: string; // 과적건\/ 허신영기사님)그랜드 성형외과 지하1층
    raw_address: string; // 서울특별시 강남구 신사동 524-16 (예약건)(7시까지 배달해주세요)그랜드 성형외과 지하1층
    admin_dong: string; // 신사동
    legal_dong: string; // 신사동
    legal_ri: string; //
    legal_dong_code: string | null;
    admin_dong_code: string | null;
    eup_myeon_dong: string; // 신사동
    major_number: number; // 524
    minor_number: number; // 16
    is_mountain: boolean; // false
  };
  road_address: {
    si_do: string; // 서울특별시
    si_gun_gu: string; // 강남구
    road_name: string; // 압구정로10길
    building_number: string; // 34
    detail_address: string; // 과적건\/ 허신영기사님)그랜드 성형외과 지하1층
    raw_address: string; // 서울특별시 강남구 압구정로10길 34 (예약건)(7시까지 배달해주세요)그랜드 성형외과 지하1층
    road_code: string | null;
    is_basement: number; // 0
    major_number: number; // 34
    minor_number: number; // 0
  };
  latlng: {
    lat: number; // 37.50901739
    lng: number; // 127.03196222
  };
  address_provider: 'UNKNOWN' | 'PARSED_ADDRESS' | 'NAVER' | 'MESH_ADDRESS_DB';
  real_id: string | null;
}

/**
 * 최종 확인
 *  - 2019-03-29
 */
export interface VroongPosDelivery {
  id: number; // 35454598
  applicant_name: string; // (논현)고스트키친 논현점
  applicant_phone: string; // 025117598
  applicant_order_number: string; // BAEMIN-B0CI00BHAB
  applicant_delivery_number: string; // BAEMIN-B0CI00BHAB-1
  origin_name: string; // (논현)고스트키친 논현점
  origin_phone: string; // 025117598
  dest_name: string; //
  dest_phone: string; // 050712333022
  distance: number; // 1419
  cargo_type: 'FOOD_QUICK';
  delivery_number: string; // (배송번호) 19032777775776
  store_id: number; // 4439
  delivery_fee_pay_method: 'BILLED_LATER';
  cargo_price: number; // 19400,
  // 최초 결제 방법. 이후에 변경이 된 경우에는 delivery_payment_history에 추가된다.
  cargo_price_pay_method: VroongPosDeliveryPayMethod;
  // 최후 결제 방법.
  vroong_cargo_price_pay_method: VroongPosDeliveryPayMethod;
  billable_cargo_price: number; // 0
  billable_fee: number; // 3820
  billable_cancel_fee: number; // 0
  requested_pick_up_at: string; // 2019-03-27T19:18:16+0900
  created_at: string; // 2019-03-27T18:58:16+0900
  updated_at: string; // 2019-03-27T18:58:16+0900
  request_notes: string; // 리뷰할께요 웰치스
  cancel_pricing_policy: {
    submitted: number; // 0
    assigned: number; // 0
    picked_up: number; // 0
  };
  pricing_policy: {
    type: 'BASIC';
    param: {
      distance_multiplier: string; // 1
      longest_deliverable_distance: number; // 10
      bin_farm: {
        start_point: number; // 0
        end_point: number; // 1.3
        type: 'flat' | 'variable'; // flat
        cost: number; // 3600
        unit_dist: number; // 0
      }[];
    };
  };
  agent_buying: boolean; // false
  is_point: boolean; // true
  is_van: boolean; // true
  origin_address: VroongPosDeliveryAddress;
  dest_address: VroongPosDeliveryAddress;
  delivery_fee: {
    base_fee: number; // 4040
    extra_fees: {
      amount: number; // 550
      vroong_extra_charge_amount: number; // 500
      title: string; // [기상할증]강남논현지점
      type: string; // WEATHER
    }[]; // []
  };
  // tslint:disable-next-line: no-null-keyword
  parent_delivery_number: null;
  status: VroongPosDeliveryStatus;
  is_payment_complete: boolean; // true
  additional_info: {
    source: string | null;
    source_matching_key: string | null;
  };
  // tslint:disable-next-line: no-null-keyword
  order_id: null;
  delivery_tracking_status: {
    id: number; // 35454578
    delivery_id: number; // 35454598
    agent_id: null;
    agent_name: string; // 논현)이종현
    agent_phone: string; // 01032676997
    agent_timestamp: null;
    agent_lat: number; // 37.50890130266243
    agent_lng: number; // 127.032023370266
    agent_vehicle: 'MOTORCYCLE';
    mask: null;
    status: VroongPosDeliveryStatus;
    notes: null;
    pick_up_delay_at: null;
    expected_at: string; // 2019-03-27 19:35:01
    assigned_at: string; // 2019-03-27 19:00:18
    picked_up_at: string; // 2019-03-27 19:15:01
    delivered_at: string | null;
    canceled_at: string | null;
    reserved_at: string | null;
    submitted_at: string; // 2019-03-27 18:58:17
    created_at: string; // 2019-03-27 18:58:17
    system_change_note: null;
    vroong_order_number: string; // 20190327190918#2507
    vroong_tms_order_number: null;
    tms_cancellation_code: null;
    cargo_prepared_at: string; // 2019-03-27 19:06:17
    is_pickup_adjustment_enabled: boolean; // true
  };
  // 최초 cargo_price_pay_method 이후의 변경이 추가된다.
  // 예: 1905070914623165 (키친혁명 논현점)
  delivery_payment_history: {
    id: number; // 20138026
    delivery_id: number; // 35535523
    payment_type: 'APPROVED';
    payment_method: 'CARD' | 'CASH';
    amount: number; // 22500
    transaction_id: null;
    vroong_payment_id: number; // 20528187
    created_at: string; // "2019-03-28 19:47:57"
    updated_at: null;
    delivery_payment_history_credit_card_approval_info: {
      authorization_number: string; // "35758522"
      authorized_at: string; // "2019-03-28 00:00:00"
      card_company: string; // "신한"
      card_number: string; // "436420"
    } | null;
    cash_receipt_issued: boolean; // false
  }[];
  delivery_pickup_adjustments: VroongPosPickupAdjustment[];
}
