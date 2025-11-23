import { apiServise } from '@/data.js';

export function likeTrackBtn() {
  const likeBnt = document.querySelectorAll('.like-btn-track');
  likeBnt.forEach((button) => {
    button.addEventListener('click', async (event) => {
      const trackId = button.dataset.trackId;
      try {
        if (button.classList.contains('active')) {
          await apiServise.unLikeTrack(trackId);
          button.classList.remove('active');
        } else {
          await apiServise.likeTrack(trackId);
          button.classList.add('active');
        }
      } catch (error) {
        console.error(`Failed to update like status for track ${trackId}:`, error);
      }
    });
  });
}
