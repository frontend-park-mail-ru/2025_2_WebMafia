import { apiServise } from '@/data.ts';
import { router } from '@/routing.ts';
import { confirmation } from '@/components/confirmation_modal/confirmationModal.ts';
import { showInfoMessage } from '@/utils/showInfoMessage';

export function initSubscribeButton(buttonIdOrElement: string | HTMLElement = 'artistSubscribeButton'): void {
  let btn: HTMLButtonElement | null = null;

  if (typeof buttonIdOrElement === 'string') {
    btn = document.getElementById(buttonIdOrElement) as HTMLButtonElement;
  } else {
    btn = buttonIdOrElement as HTMLButtonElement;
  }

  if (!btn) return;

  btn.addEventListener('click', async (e) => {
    e.preventDefault();

    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    if (!isAuthenticated) {
      confirmation.showConfirm({
        title: 'Оформить подписку',
        description: `Подписки на исполнителей доступны в вашем <b>Wave Music</b> аккаунте`,
        confirmText: 'Войти',
        cancelText: 'Закрыть',
        onConfirm: () => {
          router.navigate('/login');
        }
      });
      return;
    }

    const artistId = btn.dataset.artistId;
    const artistName = btn.dataset.artistName || 'Артист';
    const isSubscribed = btn.dataset.isSubscribed === 'true';

    if (!artistId) {
        console.error('Artist ID is missing on subscribe button');
        return;
    }

    try {
      btn.disabled = true;

      await apiServise.toggleSubscribeToArtist(artistId, !isSubscribed);

      const newState = !isSubscribed;
      btn.dataset.isSubscribed = String(newState);

      if (newState) {
        btn.innerText = 'Отписаться';
        showInfoMessage(`Вы подписались на «${artistName}»`);
      } else {
        btn.innerText = 'Подписаться';
        showInfoMessage(`Вы отписались от «${artistName}»`);
      }

    } catch (error) {
      console.error('Failed to subscribe/unsubscribe:', error);
      showInfoMessage('Не удалось изменить подписку');
    } finally {
      btn.disabled = false;
    }
  });
}
