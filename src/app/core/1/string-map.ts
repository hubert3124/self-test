/* eslint-disable @typescript-eslint/naming-convention */
import { UnifiedOrderVendor } from './schema';

export const vendorMappingsKR: {
  [vendor in UnifiedOrderVendor]: string;
} = {
  baemin: '배달의민족',
  foodfly: '푸드플라이',
  yogiyo: '요기요',
  ddingdong: '띵동',
  coupangeats: '쿠팡이츠',
  ghostkitchen: '고스트키친',
  shuttle: '셔틀',
  other: '기타'
};

export interface ReviewChange {
  rating: 0 | 1.0 | 2.0 | 3.0 | 4.0 | 5.0; // 0(삭제된 경우) 5.0,
  contents: string;
}

export const unifiedOrderVendorMappings = {
  baemin: '배민',
  foodfly: '푸플',
  yogiyo: '요기요',
  ubereats: '우버이츠',
  ddingdong: '띵동',
  coupangeats: '쿠팡이츠',
  shuttle: '셔틀',
  ghostkitchen: '고스트키친',
  other: '기타',
};

export const unifiedOrderChannelMappings = {
  app: '앱',
  tel: '전화',
  face: '직접방문'
};

export const unifiedOrderDeliveryTypeMappings = {
  DELIVERY: '배달',
  TAKEOUT: '포장',
  FOODFLY: '푸드플라이',
  BAERA: '배라',
  DDINGDONG: '띵동',
  UBER: '우버이츠',
  COUPANG: '쿠팡이츠',
  SHUTTLE: '셔틀',
  HERE: '매장식사',
  YOGIYO: '익스프레스'
};

