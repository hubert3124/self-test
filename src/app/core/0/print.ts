export const printBin = async (buf: Buffer, host: string): Promise<string> => {
  await (new Promise<void>((resolve) => setTimeout(resolve, 1000)));
  return 'success';
};

/**
 * 지정한 폭에 맞추어서 문자열을 분리한다.
 * 영수증 프린터 출력에 사용한다.
 *
 * 한글폭 : 2, 아스키: 1
 *
 * @param width 최대 42
 */
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
