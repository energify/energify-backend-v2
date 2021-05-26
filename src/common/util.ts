import { subHours } from 'date-fns';
import { Document } from 'mongoose';
import { DateInterval, TimeInterval } from './types';

export function dateTo15SecondsInterval(date: Date) {
  const start = new Date(date);
  const end = new Date(date);

  start.setMilliseconds(0);
  end.setMilliseconds(0);
  start.setSeconds((Math.floor(date.getSeconds() / 15) * 15) % 60);
  end.setSeconds(start.getSeconds() + 14);

  return { start, end } as DateInterval;
}

export function mergeArrays<T, K>(arr1: T[], arr2: K[], arr1Key: string, arr2Key: string) {
  const arr2Keys = arr2.map((el) => JSON.stringify(el[arr2Key]));
  const intersection = arr1.filter((el) => arr2Keys.includes(JSON.stringify(el[arr1Key])));
  return intersection.map((el, i) => {
    const el2 = arr2[i];
    return {
      ...(el instanceof Document ? el.toObject() : el),
      ...(el2 instanceof Document ? el2.toObject() : el2),
    };
  }) as (T & K)[];
}

export function timeIntervalToDateIntervals(end: Date, samples: number, interval: TimeInterval) {
  const dateIntervals = new Array<DateInterval>();
  let hours = 0;
  let i = 0;

  if (interval === '1h') {
    hours = 1;
  } else if (interval === '1d') {
    hours = 24;
  } else if (interval === '1w') {
    hours = 24 * 7;
  } else if (interval === '1m') {
    hours = 24 * 30;
  } else {
    hours = 24 * 365;
  }

  while (i < samples) {
    dateIntervals.push({ start: subHours(end, hours), end });
    end = subHours(end, hours);
    i++;
  }

  return dateIntervals;
}
