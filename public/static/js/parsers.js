import { API_AVATARS_URL } from '@/data.js';

export function pluralize(number, one, few, many) {
  const n = Math.floor(number);
  const lastDigit = n % 10;
  const lastTwoDigits = n % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return many;
  if (lastDigit === 1) return one;
  if (lastDigit >= 2 && lastDigit <= 4) return few;
  return many;
}

export function playsParser(plays) {
  let display = plays;

  if (plays >= 1_000_000_000) {
    const value = plays / 1_000_000_000;
    display = (value < 10 ? value.toFixed(1) : value.toFixed(0)).replace('.', ',') + ' млрд.';
  } else if (plays >= 1_000_000) {
    const value = plays / 1_000_000;
    display = (value < 10 ? value.toFixed(1) : value.toFixed(0)).replace('.', ',') + ' млн.';
  } else if (plays >= 1_000) {
    const value = plays / 1_000;
    display = (value < 10 ? value.toFixed(1) : value.toFixed(0)).replace('.', ',') + ' тыс.';
  }

  return `${display} ${pluralize(plays, 'прослушивание', 'прослушивания', 'прослушиваний')}`;
}

export function durationParser(duration) {
  const durationM = Math.floor(duration / 60);
  const durationS = duration % 60;
  return durationS < 10 ? `${durationM}:0${durationS}` : `${durationM}:${durationS}`;
}

export function totalDurationParser(duration) {
  let duration_h = Math.floor(duration / 3600);
  let duration_m = Math.floor((duration % 3600) / 60);
  let duration_s = duration % 60;

  let parts = [];

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

export function tracksNumParser(count) {
  if (!count || count < 0) return '';
  return `${count} ${pluralize(count, 'трек', 'трека', 'треков')}`;
}

export function getValidImage(url, defaultImage) {
  if (!url || url === '') {
    if (!defaultImage) return url;
    return `static/img/${defaultImage}`;
  }
  return `${API_AVATARS_URL}/${url}`;
}

export function dateParser(dateStr) {
  if (!dateStr) return '';

  const [year, month, day] = dateStr.slice(0, 10).split('-');
  return `${day}.${month}.${year}`;
}
