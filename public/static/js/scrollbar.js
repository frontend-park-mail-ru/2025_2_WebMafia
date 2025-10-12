export function initScrollbar() {
  const content = document.getElementById('scrollContent');
  const scrollbar = document.getElementById('customScrollbar');

  function updateScrollbar() {
    const scrollHeight = content.scrollHeight;
    const clientHeight = content.clientHeight;
    const scrollTop = content.scrollTop;

    // высота ползунка пропорциональна видимой области
    const scrollbarHeight = (clientHeight / scrollHeight) * clientHeight;
    scrollbar.style.height = `${scrollbarHeight}px`;

    // позиция ползунка
    const top = (scrollTop / scrollHeight) * clientHeight;
    scrollbar.style.top = `${top}px`;
  }

  // обновление ползунка при прокрутке и изменении размера
  content.addEventListener('scroll', updateScrollbar);
  window.addEventListener('resize', updateScrollbar);

  // Начальная инициализация
  updateScrollbar();
}