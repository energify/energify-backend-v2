import { addSeconds, subDays, subHours, subMonths, subYears } from 'date-fns';
import { Document } from 'mongoose';
import { DateInterval, TimeInterval } from './types';

export function dateTo15SecondsInterval(date: Date) {
  const start = new Date(date);
  const end = new Date(date);
  start.setMilliseconds(0);
  end.setMilliseconds(0);
  start.setUTCSeconds((Math.floor(date.getSeconds() / 15) * 15) % 60);
  end.setUTCSeconds(start.getSeconds() + 14);

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
  let i = 1;
  if (interval === '1h') {
    end.setUTCSeconds(59);
    end.setUTCMinutes(59);
    while (i <= samples) {
      dateIntervals.push({ start: addSeconds(subHours(end, i), 1), end: subHours(end, i - 1) });
      i++;
    }
  } else if (interval === '1d') {
    end.setUTCSeconds(59);
    end.setUTCMinutes(59);
    while (i <= samples) {
      dateIntervals.push({ start: addSeconds(subDays(end, i), 1), end: subDays(end, i - 1) });
      i++;
    }
  } else if (interval === '1w') {
    end.setUTCSeconds(59);
    end.setUTCMinutes(59);
    while (i <= samples) {
      dateIntervals.push({
        start: addSeconds(subDays(end, i * 7), 1),
        end: subDays(end, (i - 1) * 7),
      });
      i++;
    }
  } else if (interval === '1m') {
    while (i <= samples) {
      const start = addSeconds(subMonths(end, i), 1);
      end.setUTCHours(23);
      end.setUTCMinutes(59);
      end.setUTCSeconds(59);
      dateIntervals.push({ start, end: subMonths(end, i - 1) });
      i++;
    }
  } else {
    end.setUTCMonth(12);
    end.setUTCDate(31);
    end.setUTCHours(23);
    end.setUTCMinutes(59);
    end.setUTCSeconds(59);
    while (i <= samples) {
      const start = subYears(end, i);
      start.setUTCDate(1);
      start.setUTCHours(0);
      start.setUTCMinutes(0);
      start.setUTCSeconds(0);
      dateIntervals.push({ start, end: subYears(end, i - 1) });
      i++;
    }
  }

  return dateIntervals;
}
