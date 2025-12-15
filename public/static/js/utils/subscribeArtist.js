import { router } from '@/routing.js';
import { apiServise } from '@/data.js';
import { showInfoMessage } from '@/utils/showInfoMessage';

export function subscribeArtist() {
  const subscribeButton = document.getElementById('artistSubscribeButton');
  if (subscribeButton) {
    subscribeButton.addEventListener('click', async () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      if (!isAuthenticated) {
        router.navigate('/login');
        return;
      }

      const artistId = subscribeButton.dataset.artistId;
      const artistName = subscribeButton.dataset.artistName;
      const isSubscribed = subscribeButton.dataset.isSubscribed === 'true';
      subscribeButton.disabled = true;

      try {
        await apiServise.toggleSubscribeToArtist(artistId, !isSubscribed);

        subscribeButton.dataset.isSubscribed = isSubscribed ? 'false' : 'true';
        if (isSubscribed) {
          subscribeButton.innerText = 'Подписаться';
          showInfoMessage(`Вы отписались от «${artistName || ''}»`);
        } else {
          subscribeButton.innerText = 'Отписаться';
          showInfoMessage(`Вы подписались на «${artistName || ''}»`);
        }
      } catch (error) {
        console.error('Failed to subscribe to artist:', error);
      } finally {
        subscribeButton.disabled = false;
      }
    });
  }
}
