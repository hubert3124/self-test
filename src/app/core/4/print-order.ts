/* eslint-disable max-len */
import fecha, {setGlobalDateI18n} from 'fecha';
import cloneDeep from 'lodash/cloneDeep'; // refer: https://medium.com/@armno/til-importing-lodash-into-angular-the-better-way-aacbeaa40473
import { inspect } from 'util';

import { EP } from '../0/escpos';
import { ReviewChange, vendorMappingsKR } from '../1/string-map';
import { BaeminUserReviewDoc, RoomDoc, UnifiedOrderFood, UnifiedOrderMerge } from '../1/schema';
import { addressFormatter, getLast4digit, normalizeTel, splitTextByWidthForESCPOS } from '../2/util';

setGlobalDateI18n({
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토']
});

const maxWidth = 42; // character, 한글은 21

/**
 * printStat =>
 * 메뉴만 출력한다.
 *
 * @param room 주문이 아닌 conf/organization의 정보에서 가져온다.
 */
const renderFoods = async (what: 'customer' | 'cook', orders: UnifiedOrderMerge[], room: RoomDoc, ignoreZeroOption = false) => {
  const mergedOrder = mergeOrders(orders, ignoreZeroOption);

  const start =
    EP.INIT +
    // 홀더 마진
    '\n\n\n';

  let data = '';

  // 메뉴별 판매 일간 집계
  const title = EP.ALIGN_CENTER + EP.MODE_DHW + '메뉴별 판매 집계\n' + EP.ALIGN_LEFT + EP.MODE_RESET;
  data += title;
  if (ignoreZeroOption) {
    const subtitle = EP.ALIGN_CENTER + '(0원 옵션 무시, 옵션 분리)\n' + EP.ALIGN_LEFT;
    data += subtitle;
  }

  // 업소호실:
  const shopName = `\n${EP.MODE_EM}업소호실:${EP.MODE_RESET} ${room.name}\n`;
  data += shopName;

  // POS는 정렬순서가 desc지만 여기서는 asc로 했기 때문에 최초 주문의 시각이 제일 빠르다.
  // 주문시작:
  if (orders.length > 0) {
    const order = orders[0];
    const date = fecha.format(fecha.parse(order.orderDate, 'YYYY-MM-DDTHH:mm:ssZZ')!, 'YYYY-MM-DD ddd HH:mm:ss');
    const orderDate = `${EP.MODE_EM}주문시작:${EP.MODE_RESET} ${date}\n`;
    data += orderDate;
  }

  // 주문끝:
  if (orders.length > 0) {
    const order = orders[orders.length - 1];
    const date = fecha.format(fecha.parse(order.orderDate, 'YYYY-MM-DDTHH:mm:ssZZ')!, 'YYYY-MM-DD ddd HH:mm:ss');
    const orderDate = `${EP.MODE_EM}주문끝  :${EP.MODE_RESET} ${date}\n`;
    data += orderDate;
  }

  // 출력일시:
  const now = fecha.format(new Date(), 'YYYY-MM-DD ddd HH:mm:ss');
  data += `${EP.MODE_EM}출력일시:${EP.MODE_RESET} ${now}\n`;

  // 주문건수:
  const numOrders = `${EP.MODE_EM}주문건수:${EP.MODE_RESET} ${orders.length}건\n`;
  data += numOrders;

  if (orders.length > 0) {
    data += await escposFoods(what, mergedOrder);
  }

  const end = '\n\n' + EP.FEED_PARTIAL_CUT_N + '\x10';

  return start + data + end;
};

/**
 * printReview =>
 * 리뷰를 출력한다.
 */
const renderReview = (type: 'added' | 'modified' | 'removed', review: BaeminUserReviewDoc, oldReview?: ReviewChange): string => {
  const start =
    EP.INIT +
    // 홀더 마진
    '\n\n\n';

  let data = ``;

  switch (type) {
    case 'added':
      data += '          --- 배민리뷰  알림 ---\n\n';
      break;
    case 'modified':
      data += '          --- 배민리뷰  변경 ---\n\n';
      break;
    case 'removed':
      data += '          --- 배민리뷰  삭제 ---\n\n';
      break;
  }

  // 소리출력
  if (review.rating === 1 || review.rating === 2) {
    data += '\x07\x07\x07\x07\x07\x07';
  } else {
    data += '\x07\x07';
  }


  data += `업소명: ${review._shopName} (${review._shopNo})\n`;
  data += `${review.member.nickname}>\n`;

  if (type === 'modified') {
    // 최신 내용 먼저 출력
    data += EP.MODE_DHW;
    switch (review.rating) {
      case 5:
        data += '★★★★★\n';
        break;
      case 4:
        data += '★★★★\n';
        break;
      case 3:
        data += '★★★\n';
        break;
      case 2:
        data += '★★\n';
        break;
      case 1:
        data += '★\n';
        break;
    }
    data += EP.MODE_RESET;
    data += EP.ALIGN_RIGHT + `첨부 사진: ${review.images.length} 개  \n` + EP.ALIGN_LEFT;

    if (review.displayStatus === 'DELETE') {
      data += review.blockMessage; // "게시자가 삭제한 리뷰입니다"
    } else {
      // DISPLAY
      if (review.displayType === 'ALL') {
        data += review.contents;
      } else {
        data += review.ceoOnlyMessage;
      }
    }

    if (oldReview) {
      // 동시에 2개가 바뀌는 경우도 고려한다.
      if (oldReview.rating !== review.rating || oldReview.contents !== review.contents) {
        data += '\n\n          ------- 변경전 -------\n';
      }

      // 별점은 항상 출력한다. 혼동방지
      data += EP.MODE_DHW;
      switch (oldReview.rating) {
        case 5:
          data += '★★★★★\n\n';
          break;
        case 4:
          data += '★★★★\n\n';
          break;
        case 3:
          data += '★★★\n\n';
          break;
        case 2:
          data += '★★\n\n';
          break;
        case 1:
          data += '★\n\n';
          break;
      }
      data += EP.MODE_RESET;

      if (review.displayStatus === 'DELETE') {
        if (review.displayType === 'ALL') {
          data += oldReview.contents;
        } else {
          // 사장님에게 보이는 메세지는 동일하므로 그냥 표시한다.
          data += review.ceoOnlyMessage;
        }
      } else {
        // DISPLAY
        if (review.displayType === 'ALL') {
          if (oldReview.contents === review.contents) {
            data += '내용 변동 없음';
          } else {
            data += oldReview.contents;
          }
        } else {
          // CEO_ONLY
          data += review.ceoOnlyMessage;
        }
      }
    }
  } else {
    data += EP.MODE_DHW;
    switch (review.rating) {
      case 5:
        data += `★★★★★\n`;
        break;
      case 4:
        data += '★★★★\n';
        break;
      case 3:
        data += '★★★\n';
        break;
      case 2:
        data += '★★\n';
        break;
      case 1:
        data += '★\n';
        break;
    }
    data += EP.MODE_RESET;
    data += EP.ALIGN_RIGHT + `첨부 사진: ${review.images.length} 개  \n` + EP.ALIGN_LEFT;
    // displayType: 'ALL' | 'CEO_ONLY' 만 있다고 가정하자...
    if (review.displayType === 'ALL') {
      data += review.contents;
    } else {
      data += review.ceoOnlyMessage;
    }
  }

  data += '\n\n' + '메뉴:\n';
  review.menus.forEach((menu) => {
    data += ` - ${menu.name}`;
    if (menu.recommendation === 'GOOD') {
      data += ' (추천)\n';
    } else {
      data += '\n';
    }
  });

  const printTime = fecha.format(new Date(), 'YYYY-MM-DD ddd HH:mm:ss');
  data += `\n출력일시: ${printTime}`;
  const end = '\n\n' + EP.FEED_PARTIAL_CUT_N + '\x10';

  // logger.debug(data);
  return start + data + end;
};

/**
 * printOrder =>
 * 1건의 주문을 출력한다.
 */
const renderOrder = async (what: 'customer' | 'cook', order: UnifiedOrderMerge, room: RoomDoc, autoPrint: boolean, doublePrint: boolean): Promise<string> => {
  const telNo = room.telNo ? normalizeTel(room.telNo) : '';

  const title0 = order.simpleNo ?? '';
  let title1 = '';
  let title2 = '';

  switch (order.deliveryType) {
    case 'DELIVERY':
      title1 = `${order.address_dong ?? order.address_key} `; // 동 분석에 실패한 경우에도 보여줄 것이 있어야 한다.
      title2 = order.address_jibun ?? ''; // undefined 는 출력하지 않는다. (callAugmentAddress error 인 경우)
      break;
    case 'BAERA':
      title1 = `${order.orderNo} `;
      title2 = '배민1';
      break;
    case 'YOGIYO':
      title1 = `${order.displayNo} `;
      title2 = '요기요 익스프레스';
      break;
    case 'FOODFLY':
      title1 = `${order.address_dongH ?? order.address_dong ?? order.address_key} `;
      title2 = '푸플';
      break;
    case 'TAKEOUT':
      if (order.orderVendor === 'baemin') {
        title1 = '배민 포장';
      } else if (order.orderVendor === 'coupangeats') {
        title1 = '쿠팡이츠 포장';
      } else if (order.orderVendor === 'ghostkitchen') {
        title1 = '고스트키친 포장';
      } else if (order.orderVendor === 'yogiyo') {
        title1 = '요기요 포장';
      } else {
        title1 = '포장';
      }
      break;
    case 'DDINGDONG':
      title1 = '띵동';
      break;
    case 'COUPANG':
      // FIX_COUPANGEATS
      title1 = `${order.displayNo ?? order.orderNo} `;
      title2 = '쿠팡이츠';
      break;
    case 'SHUTTLE':
      title1 = '셔틀';
      break;
    case 'HERE':
      title1 = '매장식사';
      break;
  }

  const start =
    EP.INIT +
    // 홀더 마진
    '\n\n\n';

  // -------------------- 서초동 123
  const title =
    EP.ALIGN_CENTER +
    EP.MODE_DHW +
    // X-XXXX
    `[${title0}]` +
    '\n\n' +
    // 서초동 123
    `${title1}` +
    EP.REVERSE_ON +
    `${title2}` +
    '\n' +
    EP.REVERSE_OFF +
    EP.ALIGN_LEFT +
    EP.MODE_RESET +
    '\n';

  // -------------------- 배민 접수번호 : 109 / 전화번호: 1234
  let takeoutId;
  if (order.displayNo) {
    const key = order.orderVendor === 'baemin' ? '배민접수번호: ' : '접수번호: ';
    takeoutId = EP.ALIGN_CENTER + EP.MODE_EM + key + EP.MODE_DW + order.displayNo + EP.ALIGN_LEFT + EP.MODE_RESET + '\n\n';
  } else {
    const telLast4 = getLast4digit(order.userTel);
    if (telLast4 === '번호없음') {
      takeoutId = '';
    } else {
      takeoutId = EP.ALIGN_CENTER + EP.MODE_EM + '전화번호: ' + EP.MODE_DW + telLast4 + EP.ALIGN_LEFT + EP.MODE_RESET + '\n\n';
    }
  }

  // -------------------- 결제방법: 선불(23,100원)
  const price = order.orderAmount + order.deliveryTip - (order.eventDiscount ? order.eventDiscount : 0);
  const paymentMethod = EP.ALIGN_LEFT + `${EP.MODE_EM}결제방법:${EP.MODE_RESET} ` + (order.paymentMethod !== '선불' ? EP.REVERSE_ON : '') + order.paymentMethod + EP.REVERSE_OFF + `(${new Intl.NumberFormat().format(price)}원)\n`;

  // -------------------- 배달주소: 역삼동 660-3
  const addressLine = order.address_dong ? `${order.address_dong} ${order.address_jibun} ${order.address_detail}` : `${order.address_key} ${order.address_detail}`;
  const addressLines = splitTextByWidthForESCPOS(addressLine, maxWidth - 10, false);
  let address = EP.ALIGN_LEFT + `${EP.MODE_EM}배달주소:${EP.MODE_RESET} ${addressLines[0].line}\n`;
  if (addressLines.length > 1) {
    // 12 * 10 = 120 = 0x78
    address +=
      EP.LEFT_MARGIN +
      '\x78\x00' +
      addressLines
        .slice(1)
        .map((line) => line.line)
        .join('') +
      '\n' +
      EP.LEFT_MARGIN +
      '\x00\x00';
  }

  const roadLine = `${addressFormatter(order.address_road!)}${order.address_building_name ? ' ' + order.address_building_name : ''}`;
  const roadLines = splitTextByWidthForESCPOS(roadLine, maxWidth - 10, false);
  let road = EP.ALIGN_LEFT + `${EP.MODE_EM}  도로명:${EP.MODE_RESET} ${roadLines[0].line}\n`;
  if (roadLines.length > 1) {
    // 12 * 10 = 120 = 0x78
    road +=
      EP.LEFT_MARGIN +
      '\x78\x00' +
      roadLines
        .slice(1)
        .map((line) => line.line)
        .join('') +
      '\n' +
      EP.LEFT_MARGIN +
      '\x00\x00';
  }

  const userTel = EP.ALIGN_LEFT + `${EP.MODE_EM}전화번호:${EP.MODE_RESET} ${normalizeTel(order.userTel)}\n`;

  // -------------------- 요청사항: 리뷰이벤트
  const orderMsgLines = splitTextByWidthForESCPOS(order.orderMsg, doublePrint && what === 'cook' ? maxWidth : maxWidth - 10, false, doublePrint && what === 'cook');
  let orderMsg =
    // 요청사항
    doublePrint && what === 'cook'
      ? EP.ALIGN_LEFT + `${EP.MODE_EM}${EP.MODE_DHW}요청사항:${EP.MODE_RESET}\n` + EP.MODE_DHW + ' ' + EP.DOUBLE_STRIKE_ON + orderMsgLines[0].line + '\n'
      : EP.ALIGN_LEFT + `${EP.MODE_EM}요청사항:${EP.MODE_RESET} ` + EP.DOUBLE_STRIKE_ON + orderMsgLines[0].line + '\n';

  if (orderMsgLines.length > 1) {
    const leftMarge = doublePrint && what === 'cook' ? '\x00\x00' : '\x78\x00';
    orderMsg +=
      EP.LEFT_MARGIN +
      leftMarge +
      // LEFT_MARGIN이 있을 경우에 MARGIN을 제외한 폭을 기준으로 줄바꾸기를 자동으로 해 줄 것으로 기대했으나
      // 42기준으로 줄바꾸기를 하는 것으로 보인다. 폭을 지정하는 명령이 있을 수도 있겠지만 일단 \n을 집어넣어 원하는 결과를 얻었다.
      orderMsgLines
        .slice(1)
        .map((line) => {
          console.log(`map : ${line.line}`);
          return line.line;
        })
        .join('\n') +
      '\n' +
      EP.LEFT_MARGIN +
      '\x00\x00';
  }
  orderMsg += doublePrint && what === 'cook' ? EP.DOUBLE_STRIKE_OFF + EP.MODE_RESET : EP.DOUBLE_STRIKE_OFF + EP.MODE_RESET;

  // -------------------- 주문업소: 난나나 파스타&*스테이크
  const shopName = `${EP.MODE_EM}주문업소:${EP.MODE_RESET} ${order.shopName}\n`;
  // -------------------- 주문채널: 배달의민족
  const orderVendorKR = vendorMappingsKR[order.orderVendor];
  const orderVendor = `${EP.MODE_EM}주문채널:${EP.MODE_RESET} ${orderVendorKR}${order.deliveryType === 'BAERA' ? ' / 배민라이더스' : ''}\n`;
  // -------------------- 간단번호: <siteNo>-XXXX
  const simpleNo = `${EP.MODE_EM}간단번호:${EP.MODE_RESET} ${order.simpleNo}\n`;
  // -------------------- 주문번호: B0XXXXYYYY
  const orderNo = `${EP.MODE_EM}주문번호:${EP.MODE_RESET} ${order.orderNo}\n`;
  // -------------------- 주문일시: 2019-09-30 19:07:53
  const orderDate = `${EP.MODE_EM}주문일시:${EP.MODE_RESET} ${fecha.format(fecha.parse(order.orderDate, 'YYYY-MM-DDTHH:mm:ssZZ')!, 'YYYY-MM-DD HH:mm:ss')}\n`;

  // -------------------- Notice
  const notice = EP.ALIGN_CENTER + '\n\n음식이나 배달관련 불편 사항은\n연락주시면 즉시 해결해 드리겠습니다.\n' + `☎ ${telNo}\n` + EP.ALIGN_LEFT;

  // 밖에서 자르기로 한다. order by S
  // const end = EP.FEED_PARTIAL_CUT_N + '\x10';

  let data = start;

  if (what === 'cook') {
    if (autoPrint) {
      data += '             << 자동  인쇄 >>\n\n';
    }
    data += '          ------- 주방용 -------\n';
    data += title;
    data += orderMsg;
    data += await escposFoods(what, order, doublePrint);
    data += orderVendor;
    if (order.simpleNo) {
      data += simpleNo;
    }
    data += orderDate;
  } else {
    data += title;
    if (order.deliveryType === 'TAKEOUT') {
      data += takeoutId;
    }
    if (order.paymentMethod !== 'NA') {
      data += paymentMethod;
    }
    if (order.deliveryType === 'DELIVERY' && order.address_detail) {
      data += address;
    }
    if (order.deliveryType === 'DELIVERY' && order.address_road) {
      data += road;
    }
    if (order.deliveryType === 'DELIVERY' || (order.deliveryType === 'TAKEOUT' && order.orderVendor !== 'coupangeats')) {
      data += userTel;
    }
    data += orderMsg;

    data += await escposFoods(what, order);

    data += shopName;
    data += orderVendor;
    if (order.orderNo) {
      data += orderNo;
    }
    if (order.simpleNo) {
      data += simpleNo;
    }
    data += orderDate;

    // 룸에 전화번호 설정이 안되어 있는 경우에는 고객 안내메세지를 출력하지 않는다.
    if (telNo) {
      data += notice;
    }
  }
  // data += end;

  return data;
};

/**
 * printMessage =>
 * 메시지를 출력한다.
 */
const renderMessage = async (
  textTitle: string,
  textRaw: string,
  beep: boolean,
  autoPrint: boolean,
  order: UnifiedOrderMerge | undefined,
  telNo?: string,
  originDesc?: string
): Promise<string> => {
  let start = EP.INIT;
  start += beep ? '\x07\x07\x07\x07\x07\x07' : '';
  start += autoPrint ? '             << 자동  인쇄 >>' : '';
  start += '\n\n';

  const title = EP.ALIGN_CENTER + EP.MODE_DHW + `${textTitle}` + '\n' + EP.ALIGN_LEFT + EP.MODE_RESET + '\n';

  let data = start;
  data += title + EP.INIT; // textTitle 에 escpos 코드가 들어갈 수 있어서 초기화한다.
  data += textRaw + '\n';

  data += EP.INIT; // textRaw 에 escpos 코드를 허용하기 때문에 초기화한다.
  if (order !== undefined) {
    data += '---------------- 관련주문 ----------------\n\n';
    data += await renderOrderForMessage(order, telNo, originDesc);
  }
  const printTime = fecha.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
  const end = `\n\n\n출력일시: ${printTime}` + '\n' + EP.FEED_PARTIAL_CUT_N + '\x10';
  data += end;
  return data;
};

/**
 * 프린트 출력 메시지를 Render하는 주요 함수
 */
export {renderFoods, renderReview, renderOrder, renderMessage};

/**
 * UnifiedOrderMerge의 메뉴와 가격 부분만 생성한다.
 *
 * order1 + order2
 */
const appendOrder = (order1: Partial<UnifiedOrderMerge>, order2: UnifiedOrderMerge, ignoreZeroOption = false) => {
  const mergedOrder: Partial<UnifiedOrderMerge> = {
    orderAmount: (order1.orderAmount ? order1.orderAmount : 0) + (order2.orderAmount ? order2.orderAmount : 0),
    deliveryTip: (order1.deliveryTip ? order1.deliveryTip : 0) + (order2.deliveryTip ? order2.deliveryTip : 0),
    eventDiscount: (order1.eventDiscount ? order1.eventDiscount : 0) + (order2.eventDiscount ? order2.eventDiscount : 0)
  };

  if (order1.foods === undefined) {
    order1.foods = [];
  }

  // foods의 개별 food를 변경하기 때문에 copy를 한다.
  mergedOrder.foods = cloneDeep(order1.foods).concat(cloneDeep(order2.foods));

  let foods = mergedOrder.foods;

  //
  // 1. 0원 옵션 무시 및 옵션을 food로 승격
  if (ignoreZeroOption) {
    const optFoods: UnifiedOrderFood[] = [];

    for (const food of foods) {
      // 1. 0원 옵션 제거, foodOrdPrice는 변동없음
      // 2020-06-18 모든 옵션의 가격이 0원인 경우 발생
      food.foodOpts = food.foodOpts.filter((foodOpt) => foodOpt.optPrice > 0);

      if (food.foodOpts.length === 0) {
        console.error(`0원 메뉴 등장. 어떤 경우인가? food = ${inspect(food, true, 10, true)}`);
      }

      // 2. 옵션을 food로 승격 (이름 앞에 '+ ' 추가)
      food.foodOpts.slice(1).forEach((foodOpt) => {
        optFoods.push({
          foodName: '+ ' + foodOpt.optName,
          foodOpts: [
            {
              optName: '',
              optPrice: foodOpt.optPrice,
              optQty: foodOpt.optQty
            }
          ],
          foodQty: food.foodQty,
          foodOrdPrice: food.foodQty * foodOpt.optQty * foodOpt.optPrice, // foodQty까지 포함한 금액
          mergedName: ''
        });
      });

      if (food.foodOpts.length > 1) {
        // foodOrdPrice도 재조정되어야 한다.
        food.foodOrdPrice = food.foodQty * food.foodOpts[0].optQty * food.foodOpts[0].optPrice;

        // 잘라낸다.
        food.foodOpts.length = 1;
      }
    }

    foods = foods.concat(optFoods);
  }

  // 2. mergedName 생성
  for (const food of foods) {
    // 공백 제거
    food.foodName = food.foodName.trim();

    if (food.foodOpts.length > 0) {
      const opt = food.foodOpts[0];
      let mergedName = opt.optName === '' ? food.foodName : `${food.foodName}_${opt.optName.trim()}`;

      if (food.foodOpts.length > 1) {
        mergedName +=
          ' [' +
          food.foodOpts
            .slice(1)
            .map((foodOpt) => foodOpt.optName.trim())
            .join(' + ') +
          ']';
      }
      food.mergedName = mergedName;
    } else {
      food.mergedName = food.foodName;
    }
  }

  // 3. 동일한 옵션 구성은 하나로 merge 한다.
  const keyedFoods: {
    [longkey: string]: UnifiedOrderFood;
  } = {};

  for (const food of foods.reverse()) {
    // ignoreZeroOptions인 경우에는 이름만으로 비교하고,
    // 그렇지 않은 경우에는 옵션 가격까지 포함해서 비교한다. optQty는 1로 가정하고 비교하지 않는다.
    // 중간 공백도 무시하고 비교한다.
    const longkey = ignoreZeroOption
      ? food.mergedName.replace(/ /g, '')
      : `${food.mergedName}${food.foodOpts
          .map((opt) => String(opt.optPrice))
          .join('-')
          .replace(/ /g, '')}`;

    // 기존 메뉴가 존재해서 합하는 경우
    const keyedFood = keyedFoods[longkey];
    if (keyedFood) {
      keyedFood.foodQty += food.foodQty;
      // keyedFood.foodOrdPrice = keyedFood.foodOpts.reduce((sum, foodOpt) => sum + foodOpt.optQty * foodOpt.optPrice, 0) * keyedFood.foodQty;
      keyedFood.foodOrdPrice += food.foodOrdPrice;
    } else {
      keyedFoods[longkey] = food;
    }
  }

  foods = Object.values(keyedFoods);

  // 4. 가격이 비싼 메뉴가 앞에 위치하도록
  const sorted = foods.sort((food1: UnifiedOrderFood, food2: UnifiedOrderFood) => {
    const price1 = food1.foodOrdPrice; // foodQty가 포함된 가격
    const price2 = food2.foodOrdPrice;

    // +로 시작하는 메뉴가 뒤에 위치하기 위해서 정렬용 문자열에 '힣'을 추가한다.
    const food1Name = `${food1.foodName[0] === '+' ? '힣' : ''}` + food1.foodName;
    const food2Name = `${food2.foodName[0] === '+' ? '힣' : ''}` + food2.foodName;

    // 이름 > 가격 기준으로 정렬한다.
    if (food1Name < food2Name) {
      return -1;
    } else if (food1Name > food2Name) {
      return 1;
    } else {
      if (price1 > price2) {
        return -1;
      } else if (price1 < price2) {
        return 1;
      } else {
        return 0;
      }
    }
  });

  mergedOrder.foods = sorted;

  return mergedOrder;
};

/**
 * 모든 주문 내용을 하나로 합한다.
 * 여러 주문을 하나의 거대 주문으로 변환한다.
 */
const mergeOrders = (orders: UnifiedOrderMerge[], ignoreZeroOption = false) => (
  orders.reduce<Partial<UnifiedOrderMerge>>((acc, order) => appendOrder(acc, order, ignoreZeroOption), {})
);

/** (사이드)잡채_사이드 같은 경우는 _사이드를 제거한다. */
const postProcessFoodName = (foodName: string): string => foodName.replace(/(\(사이드\).+)_사이드$/, '$1');

const escposFoods = (what: 'cook' | 'customer', order: Partial<UnifiedOrderMerge>, doublePrint = false) => {
  let escpos: string;

  if (what === 'customer') {
    escpos = '-'.padStart(maxWidth, '-') + '\n';

    // 10 + 11 + 9                 1 + 4     2 + 4 + 1
    escpos += EP.MODE_EM + '          메뉴/상품명         ' + ' 수량' + '  금액 \n' + EP.MODE_RESET;

    escpos += '-'.padStart(maxWidth, '-') + '\n';
  } else {
    // 그래픽문자의 폭은 2 이다.
    escpos = '─'.padStart(maxWidth / 2, '─') + '\n';

    // 12 + 11 + 12                        2(구분선)   1 + 4
    escpos += EP.MODE_EM + '            메뉴/상품명            ' + '   수량\n' + EP.MODE_RESET;

    escpos += '─'.repeat(18) + '┬' + '─'.repeat(2) + '\n';
  }

  // tslint:disable-next-line: prefer-for-of
  for (const [index, food] of order.foods!.entries()) {
    // 통계용으로 메뉴 변환한 경우에 0원 옵션을 제거할 경우에 foodOpts가 빈 배열인 경우가 있다.
    const optName = food.foodOpts[0] ? food.foodOpts[0].optName : '';
    const optPrice = food.foodOpts[0] ? food.foodOpts[0].optPrice : 0;
    const optQty = food.foodOpts[0] ? food.foodOpts[0].optQty : 0;

    let menu = `${postProcessFoodName(food.foodName + (optName ? '_' + optName : ''))}`;
    let qty = `${food.foodQty}`;
    // ignoreZeroOptions의 경우에는 동일 이름의 서로 다른 옵션 가격이 존재할 수 있게 된다.
    // 이럴 경우에 optPrice을 이용한 계산은 맞지 않는다.
    // TODO: 유지 관리가 어려운 코드 방식이다.
    let price = food.foodOpts.length === 1 ? `${new Intl.NumberFormat().format(food.foodOrdPrice)}` : `${new Intl.NumberFormat().format(optPrice * optQty * food.foodQty)}`;

    if (what === 'customer') {
      escpos += escposFood(menu, String(qty), price, 30, 5, 7);
    } else {
      escpos += escposFoodCook(menu, String(qty), 36, 4, doublePrint);
    }

    for (const foodOpt of food.foodOpts.slice(1)) {
      menu = `+ ${postProcessFoodName(foodOpt.optName)}`;
      qty = '';
      price = `${new Intl.NumberFormat().format(foodOpt.optPrice * foodOpt.optQty * food.foodQty)}`;

      if (what === 'customer') {
        escpos += escposFood(menu, String(qty), price, 30, 5, 7);
      } else {
        escpos += escposFoodCook(menu, String(qty), 36, 4, doublePrint);
      }
    }
    if (what === 'customer') {
      escpos += '-'.padStart(maxWidth, '-') + '\n';
    } else {
      // 메뉴가 2개 이상일 경우 중간과 마지막 구분선은 다르다.
      if (index === order.foods!.length - 1) {
        escpos += '─'.repeat(18) + '┴' + '─'.repeat(2) + '\n';
      } else {
        escpos += '─'.repeat(18) + '┼' + '─'.repeat(2) + '\n';
      }
    }
  }

  // 배달팁
  if (what === 'customer' && order.deliveryTip) {
    escpos += `            배달팁               ${new Intl.NumberFormat().format(order.deliveryTip).padStart(9, ' ')}` + '\n' + '-'.padStart(maxWidth, '-') + '\n';
  }

  // 할인액
  if (what === 'customer' && order.eventDiscount) {
    escpos += `             할인액                ${('-' + new Intl.NumberFormat().format(order.eventDiscount)).padStart(7, ' ')}` + '\n' + '-'.padStart(maxWidth, '-') + '\n';
  }

  if (what === 'customer') {
    const total = order.orderAmount! + order.deliveryTip! - (order.eventDiscount ? order.eventDiscount : 0);
    escpos +=
      EP.MODE_EM +
      '          ' +
      EP.MODE_DW +
      '합계' +
      EP.MODE_EM +
      `             ${new Intl.NumberFormat().format(total).padStart(11, ' ')}` +
      '\n' +
      // EP.MODE_RESET +
      '-'.padStart(maxWidth, '-') +
      '\n' +
      EP.MODE_RESET;
  }

  return escpos;
};

const renderOrderForMessage = async (order: UnifiedOrderMerge, telNo = '', originDesc?: string) => {
  const normalizedTelNo = normalizeTel(telNo);

  const title0 = order.simpleNo ?? '';
  let title1 = '';
  let title2 = '';

  switch (order.deliveryType) {
    case 'DELIVERY':
      title1 = `${order.address_dong ?? order.address_key} `; // 동 분석에 실패한 경우에도 보여줄 것이 있어야 한다.
      title2 = order.address_jibun ?? ''; // undefined 는 출력하지 않는다. (callAugmentAddress error 인 경우)
      break;
    case 'BAERA':
      title1 = `${order.orderNo} `;
      title2 = '배민1';
      break;
    case 'YOGIYO':
      title1 = `${order.displayNo} `;
      title2 = '요기요 익스프레스';
      break;
    case 'FOODFLY':
      title1 = `${order.address_dongH ?? order.address_dong ?? order.address_key} `;
      title2 = '푸플';
      break;
    case 'TAKEOUT':
      if (order.orderVendor === 'baemin') {
        title1 = '배민 포장';
      } else if (order.orderVendor === 'coupangeats') {
        title1 = '쿠팡이츠 포장';
      } else if (order.orderVendor === 'ghostkitchen') {
        title1 = '고스트키친 포장';
      } else if (order.orderVendor === 'yogiyo') {
        title1 = '요기요 포장';
      } else {
        title1 = '포장';
      }
      break;
    case 'DDINGDONG':
      title1 = '띵동';
      break;
    case 'COUPANG':
      // FIX_COUPANGEATS
      title1 = `${order.displayNo ?? order.orderNo} `;
      title2 = '쿠팡이츠';
      break;
    case 'SHUTTLE':
      title1 = '셔틀';
      break;
    case 'HERE':
      title1 = '매장식사';
      break;
  }

  // -------------------- 서초동 123
  const title =
    EP.ALIGN_CENTER +
    EP.MODE_DHW +
    // X-XXXX
    `[${title0}]` +
    '\n\n' +
    // 서초동 123
    `${title1}` +
    EP.REVERSE_ON +
    `${title2}` +
    '\n' +
    EP.REVERSE_OFF +
    EP.ALIGN_LEFT +
    EP.MODE_RESET +
    '\n';

  // -------------------- 배민 접수번호 : 109 / 전화번호: 1234
  let takeoutId;
  if (order.displayNo) {
    const key = order.orderVendor === 'baemin' ? '배민접수번호: ' : '접수번호: ';
    takeoutId = EP.ALIGN_CENTER + EP.MODE_EM + key + EP.MODE_DW + order.displayNo + EP.ALIGN_LEFT + EP.MODE_RESET + '\n\n';
  } else {
    const telLast4 = getLast4digit(order.userTel);
    if (telLast4 === '번호없음') {
      takeoutId = '';
    } else {
      takeoutId = EP.ALIGN_CENTER + EP.MODE_EM + '전화번호: ' + EP.MODE_DW + telLast4 + EP.ALIGN_LEFT + EP.MODE_RESET + '\n\n';
    }
  }

  // -------------------- 결제방법: 선불(23,100원)
  const price = order.orderAmount + order.deliveryTip - (order.eventDiscount ? order.eventDiscount : 0);
  const paymentMethod = EP.ALIGN_LEFT + `${EP.MODE_EM}결제방법:${EP.MODE_RESET} ` + (order.paymentMethod !== '선불' ? EP.REVERSE_ON : '') + order.paymentMethod + EP.REVERSE_OFF + `(${new Intl.NumberFormat().format(price)}원)\n`;

  // -------------------- 배달주소: 역삼동 660-3
  const addressLine = order.address_dong ? `${order.address_dong} ${order.address_jibun} ${order.address_detail}` : `${order.address_key} ${order.address_detail}`;
  const addressLines = splitTextByWidthForESCPOS(addressLine, maxWidth - 10, false);
  let address = EP.ALIGN_LEFT + `${EP.MODE_EM}배달주소:${EP.MODE_RESET} ${addressLines[0].line}\n`;
  if (addressLines.length > 1) {
    // 12 * 10 = 120 = 0x78
    address +=
      EP.LEFT_MARGIN +
      '\x78\x00' +
      addressLines
        .slice(1)
        .map((line) => line.line)
        .join('') +
      '\n' +
      EP.LEFT_MARGIN +
      '\x00\x00';
  }

  const roadLine = `${addressFormatter(order.address_road!)}${order.address_building_name ? ' ' + order.address_building_name : ''}`;
  const roadLines = splitTextByWidthForESCPOS(roadLine, maxWidth - 10, false);
  let road = EP.ALIGN_LEFT + `${EP.MODE_EM}  도로명:${EP.MODE_RESET} ${roadLines[0].line}\n`;
  if (roadLines.length > 1) {
    // 12 * 10 = 120 = 0x78
    road +=
      EP.LEFT_MARGIN +
      '\x78\x00' +
      roadLines
        .slice(1)
        .map((line) => line.line)
        .join('') +
      '\n' +
      EP.LEFT_MARGIN +
      '\x00\x00';
  }

  const userTel = EP.ALIGN_LEFT + `${EP.MODE_EM}전화번호:${EP.MODE_RESET} ${normalizeTel(order.userTel)}\n`;

  // -------------------- 요청사항: 리뷰이벤트
  const orderMsgLines = splitTextByWidthForESCPOS(order.orderMsg, maxWidth - 10, false);
  let orderMsg =
    // 요청사항
    EP.ALIGN_LEFT + `${EP.MODE_EM}요청사항:${EP.MODE_RESET} ` + EP.REVERSE_ON + orderMsgLines[0].line + '\n';
  if (orderMsgLines.length > 1) {
    orderMsg +=
      EP.LEFT_MARGIN +
      '\x78\x00' +
      // LEFT_MARGIN이 있을 경우에 MARGIN을 제외한 폭을 기준으로 줄바꾸기를 자동으로 해 줄 것으로 기대했으나
      // 42기준으로 줄바꾸기를 하는 것으로 보인다. 폭을 지정하는 명령이 있을 수도 있겠지만 일단 \n을 집어넣어 원하는 결과를 얻었다.
      orderMsgLines
        .slice(1)
        .map((line) => line.line)
        .join('\n') +
      '\n' +
      EP.LEFT_MARGIN +
      '\x00\x00';
  }
  orderMsg += EP.REVERSE_OFF;

  // -------------------- 주문업소: 난나나 파스타&*스테이크
  const shopName = `${EP.MODE_EM}주문업소:${EP.MODE_RESET} ${order.shopName}\n`;
  // -------------------- 주문채널: 배달의민족
  const orderVendorKR = vendorMappingsKR[order.orderVendor];
  const orderVendor = `${EP.MODE_EM}주문채널:${EP.MODE_RESET} ${orderVendorKR}${order.deliveryType === 'BAERA' ? ' / 배민라이더스' : ''}\n`;
  // -------------------- 간단번호: <siteNo>-XXXX
  const simpleNo = `${EP.MODE_EM}간단번호:${EP.MODE_RESET} ${order.simpleNo}\n`;
  // -------------------- 주문번호: B0XXXXYYYY
  const orderNo = `${EP.MODE_EM}주문번호:${EP.MODE_RESET} ${order.orderNo}\n`;
  // -------------------- 주문일시: 2019-09-30 19:07:53
  const orderDate = `${EP.MODE_EM}주문일시:${EP.MODE_RESET} ${fecha.format(fecha.parse(order.orderDate, 'YYYY-MM-DDTHH:mm:ssZZ')!, 'YYYY-MM-DD HH:mm:ss')}\n`;

  // -------------------- Notice
  const notice = EP.ALIGN_CENTER + '\n\n음식이나 배달관련 불편 사항은\n연락주시면 즉시 해결해 드리겠습니다.\n' + `☎ ${normalizedTelNo}\n` + EP.ALIGN_LEFT;

  // 밖에서 자르기로 한다. order by S
  // const end = EP.FEED_PARTIAL_CUT_N + '\x10';

  let data = title;
  if (order.deliveryType === 'TAKEOUT') {
    data += takeoutId;
  }
  if (order.paymentMethod !== 'NA') {
    data += paymentMethod;
  }
  if (order.deliveryType === 'DELIVERY' && order.address_detail) {
    data += address;
  }
  if (order.deliveryType === 'DELIVERY' && order.address_road) {
    data += road;
  }
  if (order.deliveryType === 'DELIVERY' || (order.deliveryType === 'TAKEOUT' && order.orderVendor !== 'coupangeats')) {
    data += userTel;
  }
  data += orderMsg;

  data += await escposFoods('customer', order);

  data += shopName;
  data += orderVendor;
  if (order.orderNo) {
    data += orderNo;
  }
  if (order.simpleNo) {
    data += simpleNo;
  }
  data += orderDate;
  // 룸에 전화번호 설정이 안되어 있는 경우에는 고객 안내메세지를 출력하지 않는다.
  if (normalizedTelNo) {
    data += notice;
  }
  // data += end;

  if (originDesc) {
    const line = originDesc.trim();
    if (line.length > 0) {
      const originPrint = EP.INIT + '\n          ---- 원산지  표기 ----\n' + `${line}`;
      data += originPrint;
    }
  }
  return data;
};

/**
 * escposFood 에 같이 구현하려고 했으나,
 * 수량 3자리 지원시 맨 위 아래 구분선까지 변경해야 해서 지원불가 등의 문제가 있어서 우선 분리했다.
 */
const escposFoodCook = (menu: string, qty: string, widthMenu = 36, widthQty = 4, doublePrint: boolean) => {
  // 2021-06-93
  // 그래픽 라인으로 변경 후 수량은 2자리까지만 허용한다.

  const lines = splitTextByWidthForESCPOS(menu, widthMenu, false, doublePrint);
  let escpos =
    // 한글에 대해서는 padStart를 사용할 수 없다. 한글폭은 2이기 때문이다.
    doublePrint ? EP.MODE_DHW + lines[0].line + EP.MODE_RESET + ''.padStart(widthMenu - lines[0].width, ' ') : lines[0].line + ''.padStart(widthMenu - lines[0].width, ' ');

  try {
    if (qty && qty.length === 2) {
      // 메뉴 수량이 2자리 수 (뒤에 공백 제거 | 로 인해 한자리씩 뒤로 줄였다.)
      escpos += doublePrint
        ? EP.MODE_DH + '│' + EP.MODE_RESET + ' '.repeat(widthQty - 0 - qty.length * 2) + EP.REVERSE_ON + EP.MODE_DHW + qty + EP.REVERSE_OFF + EP.MODE_RESET
        : '│' + ' '.repeat(widthQty - 0 - qty.length * 2) + EP.REVERSE_ON + EP.MODE_DW + qty + EP.REVERSE_OFF + EP.MODE_RESET;
    } else if (qty && qty !== '1') {
      // 메뉴 수량 한자리수
      escpos += doublePrint
        ? EP.MODE_DH + '│' + EP.MODE_RESET + ' '.repeat(widthQty - 1 - qty.length * 2) + EP.REVERSE_ON + EP.MODE_DHW + qty + EP.REVERSE_OFF + EP.MODE_RESET + ' '
        : '│' + ' '.repeat(widthQty - 1 - qty.length * 2) + EP.REVERSE_ON + EP.MODE_DW + qty + EP.REVERSE_OFF + EP.MODE_RESET + ' ';
    } else {
      // 수량이 없는 옵션
      escpos += doublePrint
        ? EP.MODE_DH + '│' + EP.MODE_RESET + ' '.repeat(widthQty - 1 - qty.length) + EP.MODE_DHW + qty + EP.MODE_RESET
        : '│' + ' '.repeat(widthQty - 1 - qty.length) + qty + EP.REVERSE_OFF + ' ';
    }
  } catch (error) {
    throw new Error(`[escposFood] repeat에서 예외 발생\n${error}`);
  }

  lines
    .slice(1)
    .map((line) => line.line)
    .forEach((line, index) => {
      // 메뉴명이 길어서 다음줄로 넘어갈 경우 구분선을 표시한다.
      escpos += doublePrint
        ? EP.MODE_DHW + line + EP.MODE_RESET + ''.padStart(widthMenu - lines[index + 1].width, ' ') + EP.MODE_DH + '│' + EP.MODE_RESET + '\n'
        : line + ''.padStart(widthMenu - lines[index + 1].width, ' ') + '│' + '\n';
    });

  return escpos;
};

/**
 * menu가 지정한 폭을 넘으면 여러 줄에 걸쳐 표시해야 한다.
 * maxWidth = 30 + 5 + 7
 */
const escposFood = (menu: string, qty: string, price: string, widthMenu = 30, widthQty = 5, widthPrice = 7) => {
  // 2020-12-05
  // 수량은 하루 최대 두 자리로 가정했는데 3자리가 되는 경우가 발생해서 예외가 발생했다.
  // 빈도가 매우 낮은 건이라 해당 경우가 발생하면 폭을 보정하도록 했다.
  if (qty && qty.length !== 1) {
    const qtyWidth = 1 + qty.length * 2;
    if (qtyWidth > widthQty) {
      console.warn(`qty 폭(${qtyWidth})이 우리가 생각한 widthQty(${5})를 넘었다. 보정한다.`);
      const compensation = qtyWidth - widthQty;
      widthMenu -= compensation;
      widthQty += compensation;
    }
  }

  const lines = splitTextByWidthForESCPOS(menu, widthMenu, false);
  let escpos =
    // 한글에 대해서는 padStart를 사용할 수 없다. 한글폭은 2이기 때문이다.
    lines[0].line + ''.padStart(widthMenu - lines[0].width, ' ');
  try {
    if (qty && qty !== '1') {
      escpos += ' '.repeat(widthQty - 1 - qty.length * 2) + EP.REVERSE_ON + EP.MODE_DW + qty + EP.REVERSE_OFF + EP.MODE_RESET + ' ';
    } else {
      escpos += ' '.repeat(widthQty - 1 - qty.length) + qty + EP.REVERSE_OFF + ' ';
    }
  } catch (error) {
    throw new Error(`[escposFood] repeat에서 예외 발생\n${error}`);
  }

  if (widthPrice > 0) {
    escpos += price.padStart(widthPrice, ' ') + '\n';
  }

  lines
    .slice(1)
    .map((line) => line.line)
    .forEach((line) => {
      escpos += line + '\n';
    });

  return escpos;
};
