import { setupMarquees } from '@/utils/marquee';
import { player } from '@/components/player/player.js';
import { getValidImage } from '@/utils/parsers';

export function sliderColorChange() {
  const timeRegulator = document.querySelector('.remote-slider-comments');
  timeRegulator.addEventListener('input', function () {
    const sliderElement = timeRegulator;
    const value = sliderElement.value;
    sliderElement.style.setProperty('--progress', value + '%');
    const duration_ms = player.currentTrack.duration_s;
    const newTime = (value / 100) * duration_ms;
    player.audio.currentTime = newTime;
  });
}

export function updateCurrentTimeAndSlider() {
  const currentTime = player.audio.currentTime;
  const pagePlayBtn = document.querySelector('.play-button-album.comments');
  const pageTrackId = pagePlayBtn ? pagePlayBtn.dataset.trackId : null;
  if (player.currentTrack) {
    const duration_ms = player.currentTrack.duration_s;

    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const percent = (currentTime / duration_ms) * 100;

    if (pageTrackId && String(pageTrackId) === String(player.currentTrack.id)) {
      const commentSlider = document.querySelector('.remote-slider-comments');
      const commentTime = document.querySelector('.track-time-comments.current');

      if (commentSlider) {
        commentSlider.value = percent;
        commentSlider.style.setProperty('--progress', percent + '%');
      }
      if (commentTime) {
        commentTime.textContent = formattedTime;
      }
    }
  }

  if (player.canSaveTime) {
    player.canSaveTime = false;
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated) {
      localStorage.setItem('playTime', currentTime.toFixed(1));
    }

    setTimeout(() => {
      player.canSaveTime = true;
    }, 1000);
  }
}

export function loadTrackInfo(track) {
  const titlePlacements = document.querySelectorAll('.track-title');
  titlePlacements.forEach((titlePlacement) => {
    titlePlacement.textContent = track.title;
    titlePlacement.parentNode.parentNode.href = `/album/${track.album?.id}`;
  });
  const artist = track.artists?.[0];
  const artistPlacement = document.querySelector('.track-artist');
  if (artistPlacement) {
    artistPlacement.textContent = artist?.name;
    artistPlacement.href = `/artist/${artist?.id}`;
  }
  setupMarquees();

  const durationInSeconds = track.duration_s;
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;
  const durationFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const trackTimeTotal = document.querySelector('.track-time-comments.total');
  if (trackTimeTotal) {
    trackTimeTotal.textContent = durationFormatted;
  }

  const trackImage = document.querySelector('.track-cover-player');
  if (trackImage) {
    trackImage.src = getValidImage('albums/' + track?.album?.avatar_url, 'default-album.png');
  }
}
