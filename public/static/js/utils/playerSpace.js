import { player } from '../pages/player/player.js';

export function spaceToggle() {
  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.key === ' ') {
      const activeEl = document.activeElement;
      const isTyping = activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable;
      if (isTyping) {
        return;
      } else {
        event.preventDefault();

        if (player && player.audio) {
          const spaceElement = document.activeElement;
          if (spaceElement.tagName === 'INPUT' || spaceElement.tagName === 'TEXTAREA' || spaceElement.isContentEditable) {
            return;
          }
          player.togglePlayPause();
        }
      }
    }
  });
}
