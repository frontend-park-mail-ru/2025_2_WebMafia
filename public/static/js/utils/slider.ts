class Slider {
  private scrollAmount = 352;

  init() {
    const sliders = document.querySelectorAll<HTMLElement>('.slider');

    sliders.forEach((slider) => {
      this.setupSlider(slider);
    });
  }

  setupSlider(slider: HTMLElement): void {
    const slidebar = slider.querySelector<HTMLElement>('.cards');
    const leftBtn = slider.querySelector<HTMLElement>('.slide-btn.left');
    const rightBtn = slider.querySelector<HTMLElement>('.slide-btn.right');
    if (!slidebar || !leftBtn || !rightBtn) return;
    const updateScrollBarVisibility = () => {
      const scrollBar = slidebar.scrollWidth > slidebar.clientWidth;
      slider.classList.toggle('can-scroll', scrollBar);
    };
    rightBtn.addEventListener('click', () => {
      slidebar.scrollBy({ left: this.scrollAmount, behavior: 'smooth' });
    });
    leftBtn.addEventListener('click', () => {
      slidebar.scrollBy({ left: -this.scrollAmount, behavior: 'smooth' });
    });
    updateScrollBarVisibility();

    const resizeObserver = new ResizeObserver(() => {
      updateScrollBarVisibility();
    });

    resizeObserver.observe(slidebar);
  }
}

export const slider = new Slider();
