import { router } from '@/routing.js';

export function goToComments() {
  const trackTitle = document.querySelector('.track-title');
  const id = localStorage.getItem('currentTrackId');
  if (trackTitle) {
    trackTitle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      router.navigate(`/comments/${id}`);
    });
  }
}
