const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Человекочитаемая относительная метка времени для списка работ. */
export function formatRelative(timestamp: number, now = Date.now()): string {
  const diff = now - timestamp;
  if (diff < MINUTE) return 'только что';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} мин назад`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} ч назад`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)} дн назад`;
  return new Date(timestamp).toLocaleDateString('ru-RU');
}
