class CustomScrollbar {
  private container!: HTMLElement;
  private track!: HTMLElement;
  private thumb!: HTMLElement;

  private isDragging = false;
  private startY = 0;
  private startScrollTop = 0;
  private rafId: number | null = null;
  private isMobile = false;

  // Для очистки листнеров
  private boundUpdate: () => void;
  private boundOnPointerDown: (e: PointerEvent) => void;
  private boundOnPointerMove: (e: PointerEvent) => void;
  private boundOnPointerUp: () => void;

  constructor() {
    this.boundUpdate = this.update.bind(this);
    this.boundOnPointerDown = this.onPointerDown.bind(this);
    this.boundOnPointerMove = this.onPointerMove.bind(this);
    this.boundOnPointerUp = this.onPointerUp.bind(this);
  }

  public init(id: string = 'scrollContent'): void {
    const scrollContent = document.getElementById(id);
    if (!scrollContent) {
      return;
    }

    this.container = scrollContent;
    this.isMobile = window.innerWidth < 800;

    this.track = document.createElement('div');
    this.track.id = 'customScrollbar';

    this.thumb = document.createElement('div');
    this.thumb.id = 'customScrollbarThumb';

    this.track.appendChild(this.thumb);

    this.container.appendChild(this.track);
    this.setupListeners();
    this.update();
  }

  public destroy(): void {
    this.removeListeners();
    this.track.remove();
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  private update(): void {
    const { scrollHeight, clientHeight, scrollTop } = this.container;
    const contentRect = this.container.getBoundingClientRect();

    if (scrollHeight <= clientHeight) {
      this.track.style.display = 'none';
      return;
    }

    this.track.style.display = 'block';

    this.track.style.top = `${contentRect.top}px`;
    const offset = this.isMobile ? 5 : 10;
    this.track.style.left = `${contentRect.right - offset}px`;
    this.track.style.height = `${clientHeight}px`;

    let thumbHeight = (clientHeight / scrollHeight) * clientHeight;
    thumbHeight = Math.max(thumbHeight, 30);

    const maxThumbTop = clientHeight - thumbHeight;
    const maxScrollTop = scrollHeight - clientHeight;

    const scrollRatio = scrollTop / maxScrollTop;
    const thumbTop = scrollRatio * maxThumbTop;

    this.thumb.style.height = `${thumbHeight}px`;
    this.thumb.style.transform = `translateY(${thumbTop}px)`;
  }

  private setupListeners(): void {
    this.container.addEventListener('scroll', () => {
      // Чтобы прорисовка не была слишком частой
      if (!this.rafId) {
        this.rafId = requestAnimationFrame(() => {
          this.update();
          this.rafId = null;
        });
      }
    });

    window.addEventListener('resize', this.boundUpdate);

    if (this.isMobile) {
      this.container.addEventListener('touchmove', () => this.show());
      this.container.addEventListener('touchend', () => {
        setTimeout(() => this.hide(), 400);
      });
    } else {
      // show/hide on hover
      this.container.addEventListener('pointerenter', () => this.show());
      this.container.addEventListener('pointerleave', () => {
        if (!this.isDragging) {
          this.hide();
        }
      });
    }

    this.thumb.addEventListener('pointerdown', this.boundOnPointerDown);
    document.addEventListener('pointermove', this.boundOnPointerMove);
    document.addEventListener('pointerup', this.boundOnPointerUp);
  }

  private removeListeners(): void {
    window.removeEventListener('resize', this.boundUpdate);
    document.removeEventListener('pointermove', this.boundOnPointerMove);
    document.removeEventListener('pointerup', this.boundOnPointerUp);
  }

  private onPointerDown(e: PointerEvent): void {
    e.preventDefault();
    this.isDragging = true;
    this.startY = e.clientY; // координата мыши
    this.startScrollTop = this.container.scrollTop; // позиция прокручиваемого контента
    document.body.style.userSelect = 'none'; // чтоб не выбирался прокручиваемый контент
    this.thumb.classList.add('dragging'); // для изменения цвета полосы прокрутки
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.isDragging) return;
    const { scrollHeight, clientHeight } = this.container;
    const thumbHeight = this.thumb.offsetHeight;

    const deltaY = e.clientY - this.startY;

    const trackAvailableHeight = clientHeight - thumbHeight;
    const scrollAvailableHeight = scrollHeight - clientHeight;

    const scrollDelta = (deltaY / trackAvailableHeight) * scrollAvailableHeight;

    this.container.scrollTop = this.startScrollTop + scrollDelta;
  }

  private onPointerUp(): void {
    if (!this.isDragging) return;

    this.isDragging = false;
    document.body.style.userSelect = '';

    // чтоб у полоски прокручивания изменился цвет и чтоб она исчезла
    this.thumb.classList.remove('dragging');
  }

  private show(): void {
    this.track.style.opacity = '1';
  }

  private hide(): void {
    this.track.style.opacity = '0';
  }
}

export const scrollbar = new CustomScrollbar();
