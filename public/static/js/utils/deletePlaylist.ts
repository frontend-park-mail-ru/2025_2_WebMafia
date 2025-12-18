import { apiServise } from '@/data';
import { confirmation } from '@/components/confirmation_modal/confirmationModal.ts';
import { showInfoMessage } from '@/utils/showInfoMessage';

export const deletePlaylistLogic = (id: string, name: string, onSuccess?: () => void) => {
  confirmation.showConfirm({
    title: 'Ты точно хочешь удалить плейлист?',
    description: `Плейлист <b>«${name || ''}»</b> будет удалён <b>безвозвратно</b>`,
    confirmText: 'Удалить',
    cancelText: 'Отмена',
    onConfirm: async () => {
      try {
        await apiServise.deletePlaylist(id);
        if (onSuccess) onSuccess();
        // @ts-ignore
        window.dispatchEvent(new CustomEvent(`sidebar:remove`, { id }));
        showInfoMessage('Плейлист удалён');
      } catch (error) {
        console.error('Ошибка при удалении плейлиста:', error);
        showInfoMessage('Не удалось удалить плейлист');
      }
    },
  });
};
