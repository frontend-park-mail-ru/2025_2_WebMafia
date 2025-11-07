import { API_AVATARS_URL } from './data.js';

export function playsParser(plays) {
  if (plays > 1_000_000_000) {
    const value = plays / 1_000_000_000;
    plays = (value < 10 ? value.toFixed(1) : value.toFixed(0)).replace('.', ',') + ' млрд';
  } else if (plays > 1_000_000) {
    const value = plays / 1_000_000;
    plays = (value < 10 ? value.toFixed(1) : value.toFixed(0)).replace('.', ',') + ' млн';
  } else if (plays > 1_000) {
    const value = plays / 1_000;
    plays = (value < 10 ? value.toFixed(1) : value.toFixed(0)).replace('.', ',') + ' тыс';
  }

  return plays;
}

export function durationParser(duration) {
  const duration_m = Math.floor(duration / 60);
  const duration_s = duration - duration_m * 60;
  return duration_s < 10 ? `${duration_m}:0${duration_s}` : `${duration_m}:${duration_s}`;
}

export function getValidImage(url, defaultImage) {
  if (!url) {
    if (!defaultImage) return url;
    return `static/img/${defaultImage}`;
  }
  return `${API_AVATARS_URL}/${url}`;
}

export function totalDurationParser(duration) {
  let duration_h = Math.floor(duration / 3600);
  let duration_m = Math.floor((duration % 3600) / 60);
  let duration_s = duration % 60;

  const pluralize = (value, one, few, many) => {
    const mod10 = value % 10;
    if (mod10 === 1) return one;
    if (mod10 >= 2 && mod10 <= 4) return few;
    return many;
  };

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
  if (!count || count <= 0) return '';

  const pluralize = (value, one, few, many) => {
    const mod10 = value % 10;
    const mod100 = value % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
    return many;
  };

  return `${count} ${pluralize(count, 'трек', 'трека', 'треков')}`;
}
