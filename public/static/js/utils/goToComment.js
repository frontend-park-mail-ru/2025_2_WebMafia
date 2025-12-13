import { router } from '@/routing.js';
import { player } from '@/components/player/player.js';

export function goToComments() {
  const trackTitle = document.querySelector('.goToCommentsBtn');
  trackTitle.addEventListener('click', (e) => {
    const id = player.currentTrack.id;
    e.preventDefault();
    router.navigate(`/comments/${id}`);
  });
}
