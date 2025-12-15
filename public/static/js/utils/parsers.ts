import { API_AVATARS_URL } from '@/data.ts';

export function pluralize(number: number, one: string, few: string, many: string): string {
  const n = Math.floor(number);
  const lastDigit = n % 10;
  const lastTwoDigits = n % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return many;
  if (lastDigit === 1) return one;
  if (lastDigit >= 2 && lastDigit <= 4) return few;
  return many;
}

export function playsParser(plays: number): string {
  const formatter = new Intl.NumberFormat('ru-RU', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1
  });

  const value = formatter.format(plays);
  return `${value} ${pluralize(plays, 'прослушивание', 'прослушивания', 'прослушиваний')}`;
}

export function durationParser(duration: number): string {
  const durationM = Math.floor(duration / 60);
  const durationS = duration % 60;
  return durationS < 10 ? `${durationM}:0${durationS}` : `${durationM}:${durationS}`;
}

export function durationToSec(d: string): number {
    const [m, s] = d.split(':').map(Number);
    return m * 60 + s;
}

export function totalDurationParser(duration: number): string {
  const duration_h = Math.floor(duration / 3600);
  const duration_m = Math.floor((duration % 3600) / 60);
  const duration_s = duration % 60;

  const parts: string[] = [];

  if (duration_h > 0) {
    parts.push(`${duration_h} ${pluralize(duration_h, 'час', 'часа', 'часов')}`);
    if (duration_m > 0) parts.push(`${duration_m} ${pluralize(duration_m, 'минута', 'минуты', 'минут')}`);
  } else if (duration_m > 0) {
    parts.push(`${duration_m} ${pluralize(duration_m, 'минута', 'минуты', 'минут')}`);
    if (duration_s > 0) parts.push(`${duration_s} ${pluralize(duration_s, 'секунда', 'секунды', 'секунд')}`);
  } else {
    parts.push(`${duration_s} ${pluralize(duration_s, 'секунда', 'секунды', 'секунд')}`);
  }

  return parts.join(' ');
}

export function tracksNumParser(count: number | null | undefined): string {
  if (count == null || count < 0) return '0 треков';
  return `${count} ${pluralize(count, 'трек', 'трека', 'треков')}`;
}

export function getValidImage(url: string | null | undefined, defaultImage?: string) {
  if (!url || url === '') {
    return defaultImage || '';
  }
  return `${API_AVATARS_URL}/${url}`;
}

export function dateParser(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ru-RU').format(date);
}
