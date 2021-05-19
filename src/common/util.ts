export function dateTo15SecondsInterval(date: Date) {
  const start = new Date(date);
  const end = new Date(date);

  start.setMilliseconds(0);
  end.setMilliseconds(0);
  start.setSeconds((Math.floor(date.getSeconds() / 15) * 15) % 60);
  end.setSeconds(start.getSeconds() + 14);

  return { start, end };
}
