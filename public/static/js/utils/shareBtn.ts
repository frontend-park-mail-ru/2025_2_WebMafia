import { showInfoMessage } from '@/utils/showInfoMessage';

export function copyToClipboard(text: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => showInfoMessage('Ссылка скопирована в буфер обмена'))
    .catch((err) => {
      console.error('Ошибка копирования:', err);
      showInfoMessage('Не удалось скопировать ссылку');
    });
}

export function share() {
  const shareBtn = document.getElementById('shareButton');
  if (!shareBtn) return;
  shareBtn.addEventListener('click', () => {
    const url = window.location.href;
    copyToClipboard(url);
  });
}
