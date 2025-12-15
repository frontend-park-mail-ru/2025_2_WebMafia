import { apiServise } from '@/data.js';
import { confirmation } from '@/components/confirmation_modal/confirmationModal.js';
import { showInfoMessage } from '@/utils/showInfoMessage.js';

export const deletePlaylistLogic = (id, name, onSuccess) => {
  confirmation.showConfirm({
    title: 'Вы точно хотите удалить плейлист?',
    description: `Плейлист «${name || ''}» будет удалён`,
    formatingText: 'безвозвратно',
    confirmText: 'Удалить',
    cancelText: 'Отмена',
    onConfirm: async () => {
      try {
        await apiServise.deletePlaylist(id);
        if (onSuccess) onSuccess();
        showInfoMessage('Плейлист удалён');
      } catch (error) {
        console.error('Ошибка при удалении плейлиста:', error);
        showInfoMessage('Не удалось удалить плейлист');
      }
    },
  });
};
