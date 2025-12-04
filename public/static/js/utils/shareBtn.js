import { showInfoMessage } from "@/utils/showInfoMessage.js";

export function share() {
  const shareBtn = document.querySelector('.share-button');
  shareBtn.addEventListener('click', () => {
    const url = window.location.href;

    navigator.clipboard.writeText(url)
        .then(() => showInfoMessage("Ссылка скопирована в буфер обмена"))
        .catch(err => {
            console.error("Ошибка копирования:", err);
        });
  })
}