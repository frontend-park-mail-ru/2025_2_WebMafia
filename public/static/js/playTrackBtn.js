import { player } from './pages/player/player.js';

export function playTrack() {
  const playBtn = document.querySelectorAll('.play-button-track, .play-button, .current-card-btn.play');
  let currentTrackId = null;
  playBtn.forEach((button) => {
    button.addEventListener('click', (event) => {
      const trackId = event.currentTarget.dataset.trackId;
      if (currentTrackId !== trackId) {
        currentTrackId = trackId;
        player.loadAndPlayTrackById(trackId);
        player.audio.addEventListener('playing', updateButtons, { once: true });
      } else {
        player.togglePlayPause();
      }
      updateButtons();
    });
  });
  player.audio.addEventListener('canplay', () => {
    updateButtons();
  });
  player.audio.addEventListener('play', updateButtons);
  player.audio.addEventListener('pause', updateButtons);
  if (player.currentTrack) {
    updateButtons();
  }
  function updateButtons() {
    const playerTrackId = player.currentTrack.id;
    playBtn.forEach((button) => {
      const buttonTrackId = button.dataset.trackId;
      if (buttonTrackId === playerTrackId) {
        button.classList.add('is-active');
        if (player.audio.paused) {
          button.classList.remove('paused');
        } else {
          button.classList.add('paused');
        }
      } else {
        button.classList.remove('is-active');
        button.classList.remove('paused');
      }
    });
  }
}
