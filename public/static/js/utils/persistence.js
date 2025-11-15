import { player } from '../components/player/player.js';

export function persistence() {
  window.addEventListener('storage', () => {
    const currentPlayingtrack = localStorage.getItem('isPlaying');
    if (currentPlayingtrack === 'true') {
      player.togglePlayPauseSwitch(true);
      player.audio.play();
    } else {
      player.togglePlayPauseSwitch(false);
      player.audio.pause();
    }
  });
}
