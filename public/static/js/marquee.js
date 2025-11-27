export function setupMarquees(padding = true) {
  document.querySelectorAll('.marquee').forEach(marquee => {
    const inner = marquee.querySelector('.marquee-inner');
    let texts = inner.querySelectorAll('.marquee-text');

    if (texts.length === 0) return;

    const singleWidth = texts[0].scrollWidth;
    const containerWidth = marquee.clientWidth;

    if (singleWidth - (padding ? 70 : 0) <= containerWidth) {
      if (texts.length > 1) {
        inner.removeChild(texts[1]);
      }
      inner.style.animation = 'none';
      inner.style.transform = 'translateX(0)';
      texts[0].style.padding = '0';
    } else {
      if (texts.length < 2) {
        const clone = texts[0].cloneNode(true);
        inner.appendChild(clone);
      }

      texts[0].style.paddingRight = '70px';
      inner.style.animation = 'scroll-loop 14s linear infinite';
    }
  });
}