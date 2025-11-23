import { router } from '@/routing.js';

export function setPlayButtonsOnAuth() {
  const playbtn = document.querySelectorAll('.play-button-track, .play-button, .current-card-btn.play, .play-popular-track, .play-album-track, .play-all-artist-tracks');
  playbtn.forEach((button) => {
    button.addEventListener('click', (event) => {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      if (!isAuthenticated) {
        event.preventDefault();
        event.stopPropagation();
        router.navigate('/login');
      } else {
        // this.nowPlayingCardSlider();
        // playTrack();
      }
    });
  });
}
