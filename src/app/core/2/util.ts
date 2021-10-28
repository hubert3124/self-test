import fecha from 'fecha';
import { setGlobalDateI18n } from 'fecha';
import { Diff } from 'deep-diff';

import { UnifiedOrderFood, UnifiedOrder, FoodflyCeoListOrderDoc } from '../1/schema';
import { unifiedOrderVendorMappings, unifiedOrderChannelMappings, unifiedOrderDeliveryTypeMappings } from '../1/string-map';

setGlobalDateI18n({
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
});

// input에 대한 형식과 캘린더 월 셀렉트박스 형식
export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'YYYY-MM',
    dateA11yLabel: 'YYYY-MM-DD',
    monthYearA11yLabel: 'YYYY-MM'
  }
};

// 요일 및 월 표시 형식을 한글로 표시한다.
export const MY_LOCALE = {
  monthsShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  weekdaysMin: ['일', '월', '화', '수', '목', '금', '토']
};

export async function sleep(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 입력 과정 중에 자동으로 -를 붙여준다.
 * util.ts에 있는 noramlizeTel과는 쓰임이 다르다.
 */
export function normalizingTel(telNo: string) {
  // 숫자 이외에는 모두 제외한다.
  telNo = telNo.replace(/[^0-9]/g, '');

  if (telNo[0] !== '0') {
    return '';
  }
  // 2번째 숫자가 허용되지 않는 숫자라면 거부
  if (telNo[1] !== '1' && telNo[1] !== '2' && telNo[1] !== '5' && telNo[1] !== '7') {
    return telNo[0];
  }

  if (telNo.match(/^010|050|070|011/)) {
    // 국번이 0이나 1로 시작하지 않는다.
    if (telNo[3] === '0' || telNo[3] === '1') {
      return telNo.substr(0, 3);
    }

    if (telNo.length === 12) {
      return `${telNo.substr(0, 4)}-${telNo.substr(4, 4)}-${telNo.substr(8, 4)}`;
    } else if (telNo.length === 10) {
      return `${telNo.substr(0, 3)}-${telNo.substr(3, 3)}-${telNo.substr(6, 4)}`;
    } else if (telNo.length > 7) {
      return `${telNo.substr(0, 3)}-${telNo.substr(3, 4)}-${telNo.substr(7, 4)}`;
    } else if (telNo.length > 3) {
      return `${telNo.substr(0, 3)}-${telNo.substr(3, 4)}`;
    } else {
      return telNo;
    }
  } else { // 02
    // 국번이 0이나 1로 시작하지 않는다.
    if (telNo[2] === '0' || telNo[2] === '1') {
      return telNo.substr(0, 2);
    }

    if (telNo.length > 9) {
      return `${telNo.substr(0, 2)}-${telNo.substr(2, 4)}-${telNo.substr(6, 4)}`;
    } else if (telNo.length > 5) {
      return `${telNo.substr(0, 2)}-${telNo.substr(2, 3)}-${telNo.substr(5, 4)}`;
    } else if (telNo.length > 2) {
      return `${telNo.substr(0, 2)}-${telNo.substr(2, 3)}`;
    } else {
      return telNo;
    }
  }
}

/**
 * - 를 삽입한다.
 */
export function normalizeTel(telNo: string) {
  if (telNo == null || telNo === '') {
    return '';
  }
  // 숫자 이외에는 모두 제외한다.
  telNo = telNo.replace(/[^0-9]/g, '');

  // 2018-11-15 부터는 050으로 변환해서 FS에 저장하기 때문에 불펼요할 수 있다.
  telNo = telNo.replace(/^090/, '050');

  // 010- , 070-
  let matches = telNo.match(/^(0[17][01])(.{3,4})(.{4})$/);
  if (matches) {
    return `${matches[1]}-${matches[2]}-${matches[3]}`;
  }

  // 050은 4자리 식별번호를 사용하지만 3자리가 익숙하니 12자리가 아닌 경우에는 050에서 끊어준다.
  // 050-AAA?-BBBB
  matches = telNo.match(/^(050)(.{3,4})(.{4})$/);
  if (matches) {
    return `${matches[1]}-${matches[2]}-${matches[3]}`;
  }

  // 050X-AAAA-BBBB
  matches = telNo.match(/^(050.)(.{4})(.{4})$/);
  if (matches) {
    return `${matches[1]}-${matches[2]}-${matches[3]}`;
  }

  matches = telNo.match(/^(02)(.{3,4})(.{4})$/);
  if (matches) {
    return `${matches[1]}-${matches[2]}-${matches[3]}`;
  }

  matches = telNo.match(/^(0..)(.{3,4})(.{4})$/);
  if (matches) {
    return `${matches[1]}-${matches[2]}-${matches[3]}`;
  }

  return telNo;
}

/**
 * 사업자 번호 형식을 만든다.
 */
export function normalizingBusinessNumber(businessNumber: string) {
  // 1. 숫자 이외에는 모두 제외한다.
  // 2. 3-2-5+로 분리한다.
  // 10자리가 되지 않도라도 match 된다.
  // 10자리가 넘는 숫자는 자르지 않고 뒤에 붙인다.
  const [, ...groups] = businessNumber.replace(/[^0-9]/g, '').match(/^(\d{0,3})(\d{0,2})(\d*)$/);
  return groups.filter(group => group !== '').join('-');
}

/**
 * '고스트키친 삼성점 04호'를 '삼성점 04호'로 변환한다.
 */
export function trimOrganization(text: string) {
  return text?.replace(/^고스트키친 /, '');
}

/**
 * '고스트키친 삼성점 04호'를 '04호'로 변환한다.
 */
export function trimSite(text: string) {
  return text?.replace(/^고스트키친 [^\s]+\s/, '');
}

/**
 *
 * @param dateStr  '2018-01-01T12:34:56+0900'
 */
export function weekdayKR(dateStr: string): string {
  // Safari는 +09:00은 지원해도 +0900은 지원하지 않는다.
  return fecha.format(fecha.parse(dateStr, 'YYYY-MM-DDTHH:mm:ssZZ'), 'ddd');
}

/**
 * 여러 형태의 시간을 ISO 형식의 문자열로 변환한다.
 * date2iso.test.ts에 사용예 확인
 */
export function toDate(date: string | number | Date): Date {
  if (date === undefined) {
    throw TypeError(`undfiend date format @ toDate()`);
  }

  if (date instanceof Date) {
    return date;
  } else if (typeof date === 'number') {
    if (date > 9999999999) {
      // 밀리초라면
      return new Date(date);
    } else {
      // 초라면
      return new Date(date * 1000);
    }
  } else {
    // Case 0. '2019-05-03T12:08:38+0900'
    let match = date.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})([+-]\d{2}):?(\d{2})$/);
    if (match) {
      return fecha.parse(date, 'YYYY-MM-DDTHH:mm:ssZZ');
    }

    // Case 1-1. '2019-05-03 12:08:38'
    // Case 1-2. '2019-05-03 12:08:38.0'
    match = date.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})(\.0)?$/);

    if (match) {
      return fecha.parse(`${match[1]}T${match[2]}+0900`, 'YYYY-MM-DDTHH:mm:ssZZ');
    }

    // Case 2.
    match = date.match(/^(\d{4}\d{2}\d{2})T(\d{2}\d{2}\d{2})Z/);

    if (match) {
      return fecha.parse(`${match[1]}T${match[2]}+0000`, 'YYYYMMDDTHHmmssZZ');
    }

    // Case 3. 1559097490
    // 단위가 초라면 10자가 될 것이다.
    match = date.match(/^\d{10}$/);
    if (match) {
      return new Date(parseInt(date, 10) * 1000);
    }

    // 단위가 밀리초라면 13자가 될 것이다.
    match = date.match(/^\d{13}$/);
    if (match) {
      return new Date(parseInt(date, 10));
    }
  }

  throw TypeError(`Unexpected date format : ${date}`);
}

/**
 * 두 시각 차이를 계산해서 M:ss 형식으로 변환한다.
 * timestamp2 - timestamp1
 *
 * round는 1,2초의 차이가 나는 경우에 보정하기 위해서 사용한다.
 */
export function diffTime(timestamp1: string | number | Date, timestamp2: string | number | Date, round?: boolean) {
  if (round == null) {
    round = false;
  }

  const ret = {
    m: 0,
    s: 0,
    sStr: '00'
  };

  if (timestamp1 == null || timestamp2 == null) {
    return ret;
  }

  // Safari는 +09:00은 지원해도 +0900은 지원하지 않는다.
  const date1 = toDate(timestamp1).getTime();
  const date2 = toDate(timestamp2).getTime();

  const diffSec = Math.floor((date2 - date1) / 1000);

  let m = Math.floor(diffSec / 60);
  let s = diffSec % 60;

  // 50초보다 큰 경우에는 1분으로 계산한다.
  // 초는 사용하지 않고 분만 표시하는 경우에 사용
  if (round && s > 50) {
    s = 0;
    m += 1;
  }

  const sStr = s < 10 ? `0${s}` : `${s}`;

  ret.m = m;
  ret.s = s;
  ret.sStr = sStr;

  return ret;
}

/**
 * 초를 분과 초로 분리해 준다.
 * 포맷팅을 위한 변환이기 때문에 음수의 경우에 m * 60 + s가 $seconds가 되지는 않는다.
 *
 * 69 => { 1, 9, '09'}
 * -69 => { -1, 9, '09'}
 *
 */
export function formatSeconds($seconds: number | string, round = false) {
  let seconds = (typeof $seconds === 'string') ? parseInt($seconds, 10) : $seconds;

  // 음수라면 양수로 만든다.
  const bReverse = seconds < 0 ? true : false;
  seconds = bReverse ? -seconds : seconds;

  let m = Math.floor(seconds / 60);
  let s = seconds % 60;

  const ret = {
    m: 0,
    s: 0,
    sStr: '00'
  };

  // 50초보다 큰 경우에는 1분으로 계산한다.
  // 초는 사용하지 않고 분만 표시하는 경우에 사용
  if (round && s > 50) {
    s = 0;
    m += 1;
  }

  const sStr = s < 10 ? `0${s}` : `${s}`;

  ret.m = bReverse ? -m : m;
  ret.s = s;
  ret.sStr = sStr;

  return ret;
}

/**
 * 1 -> 'A', 2 -> 'B', ....
 */
export function numberToAlphabet(num: number) {
  return String.fromCharCode(num + 64);
}

/**
 * deep-diff의 결과를 보기 좋게 보여준다.
 */
export function formatDiffs(diffs: ReadonlyArray<Diff<any>>) {
  let output = '';

  function formatDiff(diff: Diff<any>) {
    switch (diff.kind) {
      case 'N':
        return `[${diff.kind}] ${diff.path ? diff.path.join('.') : 'N/A'} : ${JSON.stringify(diff.rhs, null, 2)}`;
      case 'E':
        // tslint:disable-next-line: max-line-length
        return `[${diff.kind}] ${diff.path ? diff.path.join('.') : 'N/A'} : ${JSON.stringify(diff.lhs, null, 2)} => ${JSON.stringify(diff.rhs, null, 2)}`;
      case 'D':
        return `[${diff.kind}] ${diff.path ? diff.path.join('.') : 'N/A'} : ${JSON.stringify(diff.lhs, null, 2)}`;
      default:
        return `${JSON.stringify(diff, null, 2)}`;
    }
  }

  for (const diff of diffs) {
    switch (diff.kind) {
      case 'A':
        output += `[${diff.kind}] ${diff.path ? diff.path.join('.') : 'N/A'} : ( ${formatDiff(diff.item)} )\n`;
        break;

      // 'N' | 'E' | 'D'
      default:
        output += `${formatDiff(diff)}\n`;
        break;
    }
  }

  return output;
}

/**
 * toe-order-hub에서 가져왔다.
 *
 * foods가 1차 완성된 후에 다음의 2가지를 수행한다.
 * 1. 옵션을 포함해서 한 줄로 이름을 정리한 mergedName을 추가한다.
 * 2. 비싼 음식 먼저 앞에 위치하도록 정렬한다.
 *
 */
export function postProcessFoods(foods: UnifiedOrderFood[]) {
  // 1. mergedName 생성
  for (const food of foods) {
    if (food.foodOpts.length > 0) {
      const opt = food.foodOpts[0];
      let mergedName = opt.optName === '' ? food.foodName.trim() : `${food.foodName.trim()}_${opt.optName.trim()}`;
      // (사이드)잡채_사이드 같은 경우는 _사이드를 제거한다.
      mergedName = mergedName.replace(/(\(사이드\).+)_사이드$/, '$1');

      if (food.foodOpts.length > 1) {
        mergedName += ' [' + food.foodOpts.slice(1).map(foodOpt => foodOpt.optName.trim()).join(' + ') + ']';
      }
      food.mergedName = mergedName;
    } else {
      food.mergedName = food.foodName;
    }
  }

  // 2. 동일한 옵션 구성은 하나로 merge 한다.
  const keyedFoods: {
    [longkey: string]: UnifiedOrderFood;
  } = {};

  // 새롭게 추가되는 food는 배열의 뒤 쪽에 위치하고 있고 _uiState 속성을 갖고 있을 수 있으므로
  // _uiState 속성을 살려주기 위해서 reverse()를 이용해서 배열의 마지막 요소가 우선권을 높게 한다.
  // isNew는 DOM 추가 애니메이션에 사용하고 있다ㅏ.
  for (const food of foods.reverse()) {
    // 옵션 가격까지 포함해서 비교한다.
    // optQty는 1로 가정하고 비교하지 않는다.
    const longkey = `${food.mergedName}${food.foodOpts.map(opt => String(opt.optPrice)).join('-')}`;
    const keyedFood = keyedFoods[longkey];

    // 중복 메뉴
    if (keyedFood) {
      keyedFood.foodQty += food.foodQty;
      keyedFood.foodOrdPrice = keyedFood.foodOpts.reduce((sum, foodOpt) => sum + foodOpt.optQty * foodOpt.optPrice, 0) * keyedFood.foodQty;

      // 중복이 있다는 것은 추가되었다는 뜻이므로 'added'로 변경한다.
      if (keyedFood._uiState === 'new') {
        keyedFood._uiState = 'added';
      }

      continue;
    }

    keyedFoods[longkey] = food;
  }

  foods = Object.values(keyedFoods);

  // 3. 가격이 비싼 메뉴가 앞에 위치하도록
  const sorted = foods.sort((food1: UnifiedOrderFood, food2: UnifiedOrderFood) => {
    const price1 = food1.foodOrdPrice; // foodQty가 포함된 가격
    const price2 = food2.foodOrdPrice;

    if (price1 > price2) {
      return -1;
    } else if (price1 < price2) {
      return 1;
    } else {
      if (food1.mergedName < food2.mergedName) {
        return -1;
      } else if (food1.mergedName > food2.mergedName) {
        return 1;
      }
      return 0;
    }
  });

  return sorted;
}

/**
 * 아래와 같은 문자열에서 태그를 제거하기 위해 사용한다.
 * <font color='#000000'>10,000원 ~ </font>
 * 일단 간단하게 <.*?>를 태그의 시작과 끝으로 가정한다. *?는 non-greedy
 *
 * @bSplit true이면 배열을 리턴한다. 그렇지 않은 경우에는 문자열을 리턴한다.
 */
export function removeTags(str: string, bSplit = false) {
  if (bSplit) {
    return str.split(/<.*?>/).filter(s => s.trim().length > 0);
  } else {
    return str.split(/<.*?>/).filter(s => s.trim().length > 0).join('').trim();
  }
}

/**
 * 주문 상태 다이얼로그에 이용
 */
export function channelVendorDeliveryType(order: UnifiedOrder) {
  try {
    // eslint-disable-next-line max-len
    return `${unifiedOrderChannelMappings[order.orderChannel]}/${unifiedOrderVendorMappings[order.orderVendor]}/${unifiedOrderDeliveryTypeMappings[order.deliveryType]}`;
  } catch (err) {
    console.error(err);
    return 'Unexpected value => 개발자를 부르세요';
  }
}

/**
 *
 * WGS84 좌표계의 두 점 사이의 거리를 구한다.
 * refer: https://blog.asamaru.net/2015/09/14/calculate-distance-between-two-wgs84-points/
 *
 * @param lat1 좌표1의 위도
 * @param lng1 좌표1의 경도
 * @param lat2 좌표2의 위도
 * @param lng2 좌표2의 경도
 * @returns 단위는 미터
 */
export function calcGeoDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  // const R = 6371000; // Radius from wikipedia (https://en.wikipedia.org/wiki/Earth_radius)
  const R = 6372000;  // 부릉의 값과 비교해서 약간 조정한 값
  const dLat = deg2rad(lat2 - lat1);  // deg2rad below
  const dLon = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
    Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in meter

  // meter
  return Math.floor(d);
}

/**
 * 푸플 창을 생성할 때 사용한다.
 *
 * refer: https://stackoverflow.com/questions/133925/javascript-post-request-like-a-form-submit
 */
export function postForm(path, params, method = 'post', target: string | undefined = '_blank') {
  // The rest of this code assumes you are not using a library.
  // It can be made less wordy if you use one.
  const form = document.createElement('form');
  form.method = method;
  form.action = path;
  if (target) {
    form.target = target;
  }

  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const hiddenField = document.createElement('input');
      hiddenField.type = 'hidden';
      hiddenField.name = key;
      hiddenField.value = params[key];

      form.appendChild(hiddenField);
    }
  }

  document.body.appendChild(form);
  form.submit();

  // 새 창이 생생되기 때문에 기존 창에 생기는 잔재는 없애주는 것이 좋다.
  setTimeout(() => form.parentNode.removeChild(form), 1000);
}

/**
 * 픽업 시각을 계산한다.
 * 푸플 사이트의 계산식을 가져왔다.
 *
 * 문자열로 된 UnixTime을 리턴한다.
 */
export function calculateFoodflyPickupTime(order: FoodflyCeoListOrderDoc) {
  let pickupTime = '0'; // 초

  // 즉시배송
  if (order.OM_SEND_TIME === '0') {
    if (order.OM_EST_PICKUP_TIME === '0' && (order.OM_SEND_STATUS === '0' || order.OM_RIDER_IDX === '-5')) {
      // return '-';
    } else if (order.OM_EST_PICKUP_TIME !== '0') {
      // OM_PREPARE_TIME이 '0'이 아닌 경우는 보지 못했다.
      if (order.OM_ACCEPT_STATUS === '3' /* 조리중 */ || order.OM_ACCEPT_STATUS === '5' /* 조리완료 */) {
      pickupTime = String(parseInt(order.OM_TIME_1, 10) + (parseInt(order.OM_EST_PICKUP_TIME, 10) + parseInt(order.OM_PREPARE_TIME, 10)) * 60);
      } else {
        pickupTime = String(parseInt(order.OM_TIME_1, 10) + parseInt(order.OM_EST_PICKUP_TIME, 10) * 60);
      }
    }
  } else {
    pickupTime = String(parseInt(order.OM_SEND_TIME, 10) - 20 * 60);
  }

  return pickupTime;
}

/**
 * 현재 시간 기준으로 지정한 시간만큼의 이전이나 이후의 시간 분을 계산한다.
 *
 * @param hourOffsetFromNow 현재 시간 기준으로 더하는 시간값
 */
export function shiftedHoursMinutes(hourOffsetFromNow: number) {
  if (hourOffsetFromNow < -23) {
    console.error(`${hourOffsetFromNow}는 -23보다 작기 때문에 atDate와 함께 사용하는 경우에 원하는 대로 동작하지 않습니다.`);
  }

  const now = new Date();
  // hourOffsetFromNow 만큼 시간 변경
  now.setHours(now.getHours() + hourOffsetFromNow);
  const hours = now.getHours();
  const minutes = now.getMinutes();

  return [hours, minutes];
}

const diffTimestampInstances: {
  [instanceKey: string]: [number, number];
} = {};
/**
 * 실행하는 시점 간의 시간 차이를 구할 때 사용한다.
 */
export function diffTimestamp(instanceKey: string) {
  const nowMilli = Date.now();
  if (diffTimestampInstances[instanceKey] === undefined) {
    diffTimestampInstances[instanceKey] = [nowMilli, 0];
  }

  // 1. get old time
  const [oldTimestamp, oldCount] = diffTimestampInstances[instanceKey];
  // 2. calculate diffTIme
  const diffMilli = nowMilli - oldTimestamp;

  const sec = Math.floor(diffMilli / 1000);
  const milli = String(diffMilli % 1000);

  // 3. update oldTIme
  diffTimestampInstances[instanceKey] = [nowMilli, oldCount + 1];

  return `[${oldCount + 1}] ${sec}.${milli.padStart(3, '0')}`;
}

export const addressFormatter = (addr: string) => {
  if (addr === undefined) {
    return addr;
  }

  const match = addr.match(/^(서울[^\s]*)\s+(.+)$/);
  if (match) {
    return match[2];
  }

  return addr;
};

export const getLast4digit = (telNo: string): string => {
  // tslint:disable-next-line: no-null-keyword
  if (telNo == null) {
    return '번호없음';
  }
  // 숫자 이외에는 모두 제외한다.
  telNo = telNo.replace(/[^0-9]/g, '');

  // 010-
  const matches = telNo.match(/^(010)(.{3,4})(.{4})$/);
  if (matches) {
    return `${matches[3]}`;
  }
  return '번호없음';
};

export const splitTextByWidthForESCPOS = (text: string, width: number, bTrim = true, doublePrint = false) => {
  const maxWidth = 42;

  if (width > maxWidth) {
    width = maxWidth;
  }

  // tslint:disable-next-line: no-null-keyword
  if (text == null || text === '') {
    return [
      {
        line: '',
        width: 0
      }
    ];
  }

  const lines: {
    line: string;
    width: number;
  }[] = [];

  let line = '';
  let widthCount = 0; // 한글은 2, 아스키는 1
  for (let i = 0; i < text.length; i++) {
    const code = text.codePointAt(i)!;
    // 3바이트 이상은 iconv 에서 skip 되어 무시한다.
    if (code > 65535) {
      continue;
    }

    // 한글영역 이외의 특수문자는 ?로 변경, 한글자만 차지한다.
    const charWidth = (code < 128 ? 1 : code > 55215 ? 1 : 2) * (doublePrint ? 2 : 1);
    // logger.debug(`text=${text[i]}, code=${code}, charWidth=${charWidth}`);

    if (widthCount + charWidth > width) {
      // 기존 줄을 닫는다.
      lines.push({
        line: bTrim ? line.trim() : line,
        width: widthCount
      });

      line = text[i];
      widthCount = charWidth;
    } else {
      line = `${line}${text[i]}`;
      widthCount += charWidth;
    }
  }

  // 마지막 줄
  if (line.length > 0) {
    lines.push({
      line: bTrim ? line.trim() : line,
      width: widthCount
    });
  }

  return lines;
};
