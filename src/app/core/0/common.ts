import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../../environments/environment';

// message, log에서 사용한다.
export const instanceId = uuidv4();
export type WHERE = [string, string, any];

/**
 * 깊은 구조의 object에 사용
 */
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export function debugLog(msg: string) {
  // 디버깅용
  if (environment.production === false) {
    console.log(msg);
  }
}

export function debugDir(msg: string) {
  // 디버깅용
  if (environment.production === false) {
    console.dir(msg);
  }
}

export interface DateDurationType {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export interface DateSetOptions {
  year?: number;
  month?: number;
  date?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

export interface DateRangeButton {
  buttonName: string;
  startDateDurationFromToday: DateDurationType;
  endDateDurationFromStartDate: DateDurationType;
  startDateSetOptions?: DateSetOptions;
  endDateSetOptions?: DateSetOptions;
}
