import { dateTo15SecondsInterval, mergeArrays, timeIntervalToDateIntervals } from './util';

describe('util', () => {
  it('should create 15 seconds date interval from a date', () => {
    let int1 = dateTo15SecondsInterval(new Date('12-22-2020 12:21:12'));
    expect(int1.start.getSeconds()).toBe(0);
    expect(int1.end.getSeconds()).toBe(14);
    let int2 = dateTo15SecondsInterval(new Date('12-22-2020 12:21:16'));
    expect(int2.start.getSeconds()).toBe(15);
    expect(int2.end.getSeconds()).toBe(29);
  });

  it('should merge two arrays of objects', () => {
    const a = [
      { id: 1, a: 't' },
      { id: 2, a: 'd' },
      { id: 3, a: 'c' },
      { id: 4, a: 'e' },
    ];
    const b = [
      { id: 1, c: '3' },
      { id: 2, d: '2' },
      { id: 3, e: '1' },
    ];
    const ab = mergeArrays(a, b, 'id', 'id');
    expect(ab).toHaveLength(3);
    expect(ab[0].id).toBe(1);
    expect(ab[0].a).toBe('t');
    expect(ab[0].c).toBe('3');
  });

  it('should generate date intervals from time interval', () => {
    const dateIntervals = timeIntervalToDateIntervals(new Date(), 10, '1d');
    expect(dateIntervals).toHaveLength(10);
  });
});
