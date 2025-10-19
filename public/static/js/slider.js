export class Slider {
  async sliderFunction() {
    document.querySelectorAll('.slider').forEach((slider) => {
      const slidebar = slider.querySelector('.cards');
      const leftBtn = slider.querySelector('.slide-btn.left');
      const rightBtn = slider.querySelector('.slide-btn.right');
      if (!slidebar || !leftBtn || !rightBtn) return;
      const scrollAmount = 352;
      const updateScrollBarVisibility = () => {
        const scrollBar = slidebar.scrollWidth > slidebar.clientWidth;
        slider.classList.toggle('can-scroll', scrollBar);
      };
      rightBtn.addEventListener('click', () => {
        slidebar.scrollLeft += scrollAmount;
        updateScrollBarVisibility();
      });
      leftBtn.addEventListener('click', () => {
        slidebar.scrollLeft -= scrollAmount;
        updateScrollBarVisibility();
      });
      updateScrollBarVisibility();

      window.addEventListener('resize', updateScrollBarVisibility);
    });
  }
}

export const slider = new Slider();
