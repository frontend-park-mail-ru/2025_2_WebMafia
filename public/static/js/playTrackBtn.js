import { player } from './pages/player/player.js';

export function playTrack() {
  const playBtn = document.querySelectorAll('.play-button-track, .play-button, .current-card-btn.play, .play-popular-track');
  let currentTrackId = player.currentTrack ? player.currentTrack.id : null;

  playBtn.forEach((button) => {
    if (button.dataset.listenerAdded === 'true') return;
    button.dataset.listenerAdded = 'true';

    button.addEventListener('click', async (event) => {
      const trackId = event.currentTarget.dataset.trackId;
      const current = player.currentTrack;

      if (!current || current.id !== trackId) {
        currentTrackId = trackId;
        await player.loadAndPlayTrackById(trackId);
      } else {
        player.togglePlayPause();
      }

      updateButtons();
    });
  });

  if (!player.audio.dataset.syncAttached) {
    player.audio.dataset.syncAttached = 'true';
    player.audio.addEventListener('play', updateButtons);
    player.audio.addEventListener('pause', updateButtons);
    player.audio.addEventListener('ended', updateButtons);
    player.audio.addEventListener('loadeddata', updateButtons);
  }

  if (player.currentTrack) updateButtons();

  function updateButtons() {
    const playerTrackId = player.currentTrack ? player.currentTrack.id : null;

    document.querySelectorAll('.play-button-track, .play-button, .current-card-btn.play, .play-popular-track').forEach((button) => {
      const buttonTrackId = button.dataset.trackId;
      const isCurrent = playerTrackId && buttonTrackId === playerTrackId;

      button.classList.toggle('is-active', isCurrent);
      if (isCurrent) {
        button.classList.toggle('paused', !player.audio.paused);
      } else {
        button.classList.remove('paused', 'is-active');
      }
    });
    document.querySelectorAll('.card, .card-tracks, track-row').forEach((card) => {
      const buttons = card.querySelector('.play-button-track') || card.querySelector('.play-button') || card.querySelector('.play-popular-track');
      const trackId = buttons ? buttons.dataset.trackId : null;
      card.classList.toggle('active', trackId === playerTrackId);
    });
  }
}
