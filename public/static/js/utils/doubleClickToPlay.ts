export const initRowDoubleClick = (
  containerSelector: string,
  rowSelector: string
) => {
  const container = document.querySelector<HTMLElement>(containerSelector);
  if (!container) return;

  container.addEventListener('dblclick', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    
    const row = target.closest(rowSelector);
    if (!row) return;

    if (target.tagName === 'A' || target.closest('a')) return;

    const playBtn = row.querySelector(
      '.play-button-track, .play-popular-track, .play-album-track, .play-button, .play-all-artist-tracks'
    ) as HTMLButtonElement;

    if (playBtn) {
      playBtn.click();

      // Убираем выделение текста
      window.getSelection()?.removeAllRanges();
    }
  });
};