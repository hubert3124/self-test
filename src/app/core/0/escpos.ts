/* eslint-disable @typescript-eslint/naming-convention */
export const EP = {
  // BEEPER: '\x07',      // ESC BEEPER

  INIT:           '\x1b@',     // ESC @
  LINE_SPACING_N: '\x1b3',     // ESC 3  : line spacing \n을 했을 때의 줄 간격 (dot-8 일때는 8, dot-24 일때는 24로 해야 이미지가 이어진다.)
  FEEDN:          '\x1bJ',     // ESC J  : Print and feed
  FEEDLINEN:      '\x1bd',     // ESC d  : Print and feed n lines
  RIGHT_MARGIN_N: '\x1b ',     // ESC SP : 1/180 inch
  SET_TAB_NK:     '\x1bD',     // ESC D : 1 <= N <= 255, 0~32개까지 지정가능, 마지막은 NUL
  MODE_RESET:     '\x1b!\x00', // ESC !(0x21)
  MODE_FONT_B:    '\x1b!\x01', // ESC !(0x21) : Font B
  MODE_EM:        '\x1b!\x08', // ESC !(0x21) : Emphasized
  MODE_DH:        '\x1b!\x10', // ESC !(0x21) : Double-height
  MODE_DW:        '\x1b!\x20', // ESC !(0x21) : Double-width
  // MODE_UL:            '\x1b!\x80', // ESC !(0x21) : Underline
  MODE_DHW:       '\x1b!\x30', // ESC !(0x21) : DW + DH
  MODE_DHW_UL:    '\x1b!\xb0', // ESC !(0x21) : DW + DH + UL
  MODE_DHW_EM:    '\x1b!\x38', // ESC !(0x21) : DW + DH + EM
  // MODE_DHW_EM_UL:     '\x1b!\xb8', // ESC !(0x21) : DW + DH + EM + UL
  BEEP_BUZZER:    '\x1b\x28\x41\x03\x00\x61', // ESC ( A pL pH fn

  UL_OFF:             '\x1b\x2d\x00', // ESC - : Undeline Off
  UL_ONE:             '\x1b\x2d\x01', // ESC - : Undeline 1-dot thick
  UL_TWO:             '\x1b\x2d\x02', // ESC - : Undeline 2-doc thick
  DOUBLE_STRIKE_ON:   '\x1b\x47\x01', // ESC G : Double-strike On
  DOUBLE_STRIKE_OFF:  '\x1b\x47\x00', // ESC G : Double-strike Off
  STANDARD_MODE:      '\x1b\x53',     // ESC S : Select Standard Mode
  ALIGN_LEFT:         '\x1b\x61\x00', // ESC a : Left alignment
  ALIGN_CENTER:       '\x1b\x61\x01', // ESC a : Center alignment
  ALIGN_RIGHT:        '\x1b\x61\x02', // ESC a : Right alignment

  NV_PRINT:         '\x1c\x70',     // FS p : Print NV bit image + n + m
  NV_DEFINE:        '\x1c\x71',     // FS q : Define NV bit image + n +
  REVERSE_OFF:      '\x1d\x42\x00', // GS B : Reverse Off
  REVERSE_ON:       '\x1d\x42\x01', // GS B : Reverse On
  LEFT_MARGIN:      '\x1d\x4c',     // GS L : nL + nH x 256 x horizontal motion units

  BARCODE_PRINT:      '\x1d\x6b',                     // GS k : Print Bard code + m + n + d1..dn
  QRCODE_SET_MODEL:   '\x1d\x28\x6b\x04\x00\x31\x41', // GK ( k ... + n1, n2
  QRCODE_SET_SIZE:    '\x1d\x28\x6b\x03\x00\x31\x43', // GK ( K ... + n (1 =< n < 8)
  QRCODE_STORE_BEGIN: '\x1d\x28\x6b',                 // GS ( k
  QRCODE_STORE_END:   '\x31\x50\x30',                 // cn fn m
  QRCODE_PRINT:       '\x1d\x28\x6b\x03\x00\x31\x51\x30', // GS ( k + pL + pH + cn fn m

  GRAPHIC_PRINT_BUFFER:  '\x1d\x28\x4c\x02\x00\x30\x32', // GS ( L pL pH m fn <fn=2,50>
  GRAPHIC_SET_DATA:      '\x1d\x38\x4c',   // GS 8 L

  IMAGE_8_SINGLE:   '\x1b*\x00', // ESC * 8-dot-single-density
  IMAGE_8_DOUBLE:   '\x1b*\x01', // ESC * 8-dot-double-density
  IMAGE_24_SINGLE:  '\x1b*\x20', // ESC * 24-dot-single-density
  IMAGE_24_DOUBLE:  '\x1b*\x21', // ESC * 24-dot-double-density

  FULL_CUT:           '\x1d\x56\x30', // GS V
  PARTIAL_CUT:        '\x1d\x56\x31', // GS V
  FEED_FULL_CUT_N:    '\x1d\x56\x41', // GS V
  FEED_PARTIAL_CUT_N: '\x1d\x56\x42', // GS V

  // BS Commands 대체
  // PARTIAL_CUT: '\x08V\x30', // BS V
  // FULL_CUT: '\x08V\x31', // BS V
  // FEED_PARTIAL_CUT_N: '\x08V\x41', // BS V
  // FEED_FULL_CUT_N: '\x08V\x42', // BS V
};
