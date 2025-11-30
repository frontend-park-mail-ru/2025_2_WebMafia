import { player } from '@/components/player/player.js';
import { apiServise } from './data';

export function playTrack() {
  const playBtn = document.querySelectorAll(
    '.play-button-track, .play-button, .current-card-btn.play, .play-popular-track, .play-album-track, .play-all-artist-tracks, .play-button-album, .play-button-playlist'
  );
  let currentTrackId = player.currentTrack ? player.currentTrack.id : null;
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  playBtn.forEach((button) => {
    if (button.dataset.listenerAdded === 'true') return;
    button.dataset.listenerAdded = 'true';

    button.addEventListener('click', async (event) => {
      const trackId = event.currentTarget.dataset.trackId;
      const current = player.currentTrack;
      const nowPlayingContainer = document.querySelector('.now-playing-container');
      const playerContent = document.querySelector('.player');
      const layout = document.querySelector('.layout');
      if (playerContent) playerContent.classList.remove('none_playing');
      if (nowPlayingContainer) nowPlayingContainer.classList.remove('none_play');
      if (layout && !layout.classList.contains('with_player')) layout.classList.add('with_player');

      const context = {
        type: button.dataset.context || 'all-tracks',
        id: button.dataset.artistId || button.dataset.albumId || button.dataset.playlistId || null,
      };

      if (!current || current.id !== trackId) {
        currentTrackId = trackId;
        try {
          if (isAuthenticated) {
            await player.init();
            await player.loadAndPlayTrackById(trackId, context);
          }
        } catch {
          console.error('No play');
        }
      } else {
        await player.togglePlayPause();
      }
      if (isAuthenticated) {
        updateButtons();
      }
    });
  });
  if (isAuthenticated) {
    if (!player.audio.dataset.syncAttached) {
      player.audio.dataset.syncAttached = 'true';
      player.audio.addEventListener('play', updateButtons);
      player.audio.addEventListener('pause', updateButtons);
      player.audio.addEventListener('ended', updateButtons);
      player.audio.addEventListener('loadeddata', updateButtons);
    }

    if (player.currentTrack) updateButtons();
  }

  function updateButtons() {
    const playerTrackId = player.currentTrack ? player.currentTrack.id : null;

    document
      .querySelectorAll(
        '.play-button-track, .play-button, .current-card-btn.play, .play-popular-track, .play-album-track, .play-all-artist-tracks, .play-button-album, .play-button-playlist'
      )
      .forEach((button) => {
        const buttonTrackId = button.dataset.trackId;
        const isCurrent = playerTrackId && buttonTrackId === playerTrackId;

        if (button.classList.contains('play-button-album')) {
          const albumId = button.dataset.albumId;
          const firstTrackId = button.dataset.firstTrackId;
          const playerContext = player.currentContext || {};

          const isTrackFromThisAlbum =
            playerContext.type === 'album-tracks' && String(playerContext.id) === String(albumId);

          if (isTrackFromThisAlbum) {
            button.dataset.trackId = playerTrackId;
          } else {
            if (firstTrackId) {
              button.dataset.trackId = firstTrackId;
            }
          }
        }
        if (button.classList.contains('play-button-playlist')) {
          const playlistId = button.dataset.playlistId;
          const firstTrackId = button.dataset.firstTrackId;
          const playerContext = player.currentContext || {};
          (async () => {
            try {
              const isTrackFromThisPlaylist =
                playerContext.type === 'playlist-tracks' && String(playerContext.id) === String(playlistId);

              if (isTrackFromThisPlaylist) {
                button.dataset.trackId = playerTrackId;
              } else {
                if (firstTrackId) {
                  button.dataset.trackId = firstTrackId;
                }
              }
            } catch (error) {
              console.log(error);
            }
          })();
        }

        button.classList.toggle('is-active', isCurrent);
        if (isCurrent) {
          button.classList.toggle('paused', !player.audio.paused);
        } else {
          button.classList.remove('paused', 'is-active');
        }
      });
    document.querySelectorAll('.card-tracks, .track-row, .album-row').forEach((card) => {
      const buttons =
        card.querySelector('.play-button-track') ||
        card.querySelector('.play-button') ||
        card.querySelector('.play-popular-track') ||
        card.querySelector('.play-album-track') ||
        card.querySelector('.play-all-artist-tracks') ||
        card.querySelector('.play-button-album') ||
        card.querySelector('.play-button-playlist');
      const trackId = buttons ? buttons.dataset.trackId : null;
      card.classList.toggle('active', trackId === playerTrackId);
    });
  }
}
