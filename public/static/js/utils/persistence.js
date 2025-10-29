import { player } from '../pages/player/player.js';

export function persistence() {
  window.addEventListener('storage', () => {
    const currentPlayingtrack = localStorage.getItem('isPlaying');
    if (currentPlayingtrack === 'true') {
      player._toggleplayPauseSwitch(true);
      player.audio.play();
    } else {
      player._toggleplayPauseSwitch(false);
      player.audio.pause();
    }
  });
}
