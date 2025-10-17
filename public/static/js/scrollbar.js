export const initScrollbar = () => {
  const scrollContent = document.getElementById('scrollContent');
  if (!scrollContent) {
    return;
  }

  const scrollbarTrack = document.createElement('div');
  scrollbarTrack.id = 'customScrollbar';

  const scrollbarThumb = document.createElement('div');
  scrollbarThumb.id = 'customScrollbarThumb';

  scrollbarTrack.appendChild(scrollbarThumb);
  scrollContent.appendChild(scrollbarTrack);

  const updateThumb = () => {
    const contentRect = scrollContent.getBoundingClientRect();
    const scrollableHeight = scrollContent.scrollHeight;
    const visibleHeight = scrollContent.clientHeight;

    // if content is not scrollable, hide the scrollbar
    if (scrollableHeight <= visibleHeight) {
      scrollbarTrack.style.display = 'none';
      return;
    }
    scrollbarTrack.style.display = 'block';

    // position the track next to the scrollable content
    scrollbarTrack.style.top = `${contentRect.top}px`;
    scrollbarTrack.style.left = `${contentRect.right - 10}px`; // 10px is the width
    scrollbarTrack.style.height = `${contentRect.height}px`;

    // calculate thumb height and position
    const thumbHeight = Math.max((visibleHeight / scrollableHeight) * visibleHeight, 40);
    const scrollTop = scrollContent.scrollTop;
    const thumbTop = (scrollTop / scrollableHeight) * visibleHeight;

    scrollbarThumb.style.height = `${thumbHeight}px`;
    scrollbarThumb.style.top = `${thumbTop}px`;
  };

  // show/hide on hover
  scrollContent.addEventListener('pointerenter', () => {
    scrollbarTrack.style.opacity = '1';
  });
  scrollContent.addEventListener('pointerleave', () => {
    if (!isDragging) {
      scrollbarTrack.style.opacity = '0';
    }
  });

  scrollContent.addEventListener('scroll', updateThumb);
  window.addEventListener('resize', updateThumb);

  updateThumb();

  // Добавил возможность перетаскивать скроллбар мышкой
  let isDragging = false;
  let startY = 0;
  let startScrollTop = 0;

  scrollbarThumb.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    isDragging = true;
    startY = e.clientY; // координата мыши
    startScrollTop = scrollContent.scrollTop; // позиция прокручиваемого контента
    document.body.style.userSelect = 'none'; // чтоб не выбирался прокручиваемый контент
    scrollbarThumb.classList.add('dragging'); // для изменения цвета полосы прокрутки
  });

  // скроллю с теми же пропорциями, что и в updateThumb()
  document.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const rect = scrollContent.getBoundingClientRect();
    const scrollableHeight = scrollContent.scrollHeight - scrollContent.clientHeight;
    const trackHeight = rect.height - scrollbarThumb.offsetHeight;

    const deltaY = e.clientY - startY;
    const scrollDelta = (deltaY / trackHeight) * scrollableHeight;
    scrollContent.scrollTop = startScrollTop + scrollDelta;
  });

  document.addEventListener('pointerup', () => {
    if (isDragging) {
      isDragging = false;
      document.body.style.userSelect = '';

      // чтоб у полоски прокручивания изменился цвет и чтоб она исчезла
      scrollbarThumb.classList.remove('dragging');
    }
  });
};
