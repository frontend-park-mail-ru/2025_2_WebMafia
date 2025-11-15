import { player } from '../components/player/player.js';

export function spaceToggle() {
  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
      event.preventDefault();
      if (player && player.audio) {
        const spaceElement = document.activeElement;
        if (spaceElement.tagName === 'INPUT' || spaceElement.tagName === 'TEXTAREA' || spaceElement.isContentEditable) {
          return;
        }
        player.togglePlayPause();
      }
    }
  });
}
