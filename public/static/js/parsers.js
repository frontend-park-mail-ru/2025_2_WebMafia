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
  if (!url) return `static/img/${defaultImage}`;
  return url.startsWith('http') ? url : `static/img/${url}`;
}
