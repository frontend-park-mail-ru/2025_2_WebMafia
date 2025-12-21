import { apiServise } from '@/data.ts';
import { player } from '@/components/player/player';

export function likeChange(track_Id, isLiked) {
  const event = new CustomEvent('track:like-changed', {
    detail: {
      id: String(track_Id),
      isLiked: isLiked,
    },
  });
  window.dispatchEvent(event);
}

(function initGlobalLikeListener() {
  window.addEventListener('track:like-changed', (e) => {
    const { id, isLiked } = e.detail;

    const allButtons = document.querySelectorAll(
      `.like-btn[data-track-id="${id}"], .like-btn-track[data-track-id="${id}"]`
    );

    allButtons.forEach((btn) => {
      if (isLiked) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (player && player.currentTrack && String(player.currentTrack.id) === String(id)) {
      player.currentTrack.is_liked = isLiked;
    }
  });
})();

export function likeTrackBtn() {
  const likeBnt = document.querySelectorAll('.like-btn-track');
  likeBnt.forEach((button) => {
    button.addEventListener('click', async () => {
      const trackId = button.dataset.trackId;
      try {
        if (button.classList.contains('active')) {
          await apiServise.unLikeTrack(trackId);
          likeChange(trackId, false);
        } else {
          await apiServise.likeTrack(trackId);
          likeChange(trackId, true);
        }
      } catch (error) {
        console.error(`Failed to update like status for track ${trackId}:`, error);
      }
    });
  });
}
