export function setupMarquees(): void {
  const marquees = document.querySelectorAll<HTMLElement>('.marquee');

  marquees.forEach((marquee) => {
    const inner = marquee.querySelector<HTMLElement>('.marquee-inner');

    if (!inner) return;

    const texts = inner.querySelectorAll<HTMLElement>('.marquee-text');

    if (texts.length === 0) return;
    texts[0].style.paddingRight = '0';

    const singleWidth = texts[0].clientWidth;
    const containerWidth = marquee.clientWidth;

    if (singleWidth <= containerWidth) {
      if (texts.length > 1) {
        inner.removeChild(texts[1]);
      }
      inner.style.animation = 'none';
      inner.style.transform = 'translateX(0)';
    } else {
      if (texts.length < 2) {
        const clone = texts[0].cloneNode(true) as HTMLElement;
        inner.appendChild(clone);
      }

      const speed = 25;
      texts[0].style.paddingRight = '70px';
      const duration = singleWidth / speed;
      inner.style.animation = `scroll-loop ${duration}s linear infinite`;
    }
  });
}