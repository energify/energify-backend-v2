import { dateTo15SecondsInterval } from './util';

describe('util', () => {
  it('should create 15 seconds date interval from a date', () => {
    let int1 = dateTo15SecondsInterval(new Date('12-22-2020 12:21:12'));
    expect(int1.start.getSeconds()).toBe(0);
    expect(int1.end.getSeconds()).toBe(14);
    let int2 = dateTo15SecondsInterval(new Date('12-22-2020 12:21:16'));
    expect(int2.start.getSeconds()).toBe(15);
    expect(int2.end.getSeconds()).toBe(29);
  });
});
