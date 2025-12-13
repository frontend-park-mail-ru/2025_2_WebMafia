import { player } from '@/components/player/player';
import { getValidImage } from '@/utils/parsers.ts';
import { playTrack } from '@/playTrackBtn';
import { setupMarquees } from '@/utils/marquee.ts';

interface TrackData {
  id: string | number;
  title: string;
  album?: { avatar_url: string };
}

interface CardData {
  id: string | number | null;
  name: string;
  img: string;
}

class NowPlayingCardsSlider {
  private prevBtn: HTMLElement | null = null;
  private nextBtn: HTMLElement | null = null;
  private cardElements: NodeListOf<Element> | null = null;

  private isAnimating = false;
  private animationDuration = 500;
  private pendingTrackData: any = null;
  private cardsData: CardData[] = [];

  private boundPlayerSync: (e: CustomEvent) => void;

  constructor() {
    this.boundPlayerSync = (event: CustomEvent) => this.playerSliderDataSync(event.detail);
  }

  public init(): void {
    this.cardElements = document.querySelectorAll('.now-playing-container-card');

    if (!this.cardElements.length) return;

    this.prevBtn = document.querySelector('.current-card-btn.prev');
    this.nextBtn = document.querySelector('.current-card-btn.next');

    this.cardsData = [
      { img: '/static/img/default-album.png', name: '', id: null },
      { img: '/static/img/default-album.png', name: '', id: null },
      { img: '/static/img/default-album.png', name: '', id: null },
    ];

    // @ts-ignore
    player.addEventListener('trackchange', this.boundPlayerSync);

    this.setupGestures();
    this.setupButtons();

    if (player.currentTrack) {
      player.getPrevAndNextTracks();
    }

    this.initializeSliderClasses();
  }

  public destroy(): void {
    // @ts-ignore
    player.removeEventListener('trackchange', this.boundPlayerSync);
  }

  private playerSliderDataSync(data: any): void {
    if (this.isAnimating) {
      this.pendingTrackData = data;
      return;
    }
    this.applyDataToCards(data);
  }

  private applyDataToCards({ prev, current, next }: { prev: TrackData, current: TrackData, next: TrackData }): void {
    const prevCard = document.querySelector('.card-position-prev');
    const nextCard = document.querySelector('.card-position-next');

    const toggle = (el: Element | null, condition: any) => el?.classList.toggle('hidden', !condition);

    toggle(this.nextBtn, next);
    toggle(nextCard, next);
    toggle(this.prevBtn, prev);
    toggle(prevCard, prev);

    this.cardsData = [this.normalizeTrack(prev), this.normalizeTrack(current), this.normalizeTrack(next)];
    this.updateAllCardsUI();
  }

  private normalizeTrack(track?: TrackData): CardData {
    if (!track) {
      return {
        img: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        name: '',
        id: null,
      };
    }
    return {
      name: track.title,
      id: track.id,
      img: getValidImage(`albums/${track.album?.avatar_url}`, 'default-album.png'),
    };
  }

  private updateAllCardsUI(): void {
    const cards = [
      document.querySelector('.card-position-prev'),
      document.querySelector('.card-position-current'),
      document.querySelector('.card-position-next')
    ];

    cards.forEach((card, index) => {
      if (!card) return;
      const img = card.querySelector('img');
      if (img) img.src = this.cardsData[index].img;
      this.updateCardContent(card, index === 1 ? this.cardsData[index] : null);
    });

    playTrack();
  }

  private updateCardContent(card: Element, data: CardData | null): void {
    card.querySelector('.current-card-btn.play')?.remove();
    card.querySelector('.current-card-name')?.remove();

    if (data && data.name && data.id) {
      const playButton = document.createElement('button');
      playButton.className = 'current-card-btn play';
      playButton.dataset.trackId = String(data.id);

      const nameP = document.createElement('p');
      nameP.className = 'marquee current-card-name cards-marquee-limiter';
      nameP.innerHTML = `<div class="marquee-inner"><span class="marquee-text">${data.name}</span></div>`;

      card.appendChild(playButton);
      card.appendChild(nameP);
      setupMarquees();
    }
  }

  private initializeSliderClasses(): void {
    this.cardElements?.forEach((card, i) => {
      card.classList.remove('card-position-prev', 'card-position-current', 'card-position-next');
      if (i === 0) card.classList.add('card-position-prev');
      if (i === 1) card.classList.add('card-position-current');
      if (i === 2) card.classList.add('card-position-next');
    });
    this.updateAllCardsUI();
  }

  private shiftCards(direction: 'next' | 'prev'): void {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const current = document.querySelector('.card-position-current') as HTMLElement;
    const prev = document.querySelector('.card-position-prev') as HTMLElement;
    const next = document.querySelector('.card-position-next') as HTMLElement;

    if (!current || !prev || !next) return;

    [current, prev, next].forEach(c => c.classList.remove('card-position-current', 'card-position-prev', 'card-position-next'));

    if (direction === 'next') {
        current.classList.add('card-position-prev');
        next.classList.add('card-position-current');

        prev.style.transition = 'none';
        prev.classList.add('card-position-next');
        void prev.offsetWidth;
        prev.style.transition = '';
    } else {
        current.classList.add('card-position-next');
        prev.classList.add('card-position-current');

        next.style.transition = 'none';
        next.classList.add('card-position-prev');
        void next.offsetWidth;
        next.style.transition = '';
    }

    setTimeout(() => {
      this.isAnimating = false;
      if (this.pendingTrackData) {
        this.applyDataToCards(this.pendingTrackData);
        this.pendingTrackData = null;
      } else {
        this.updateAllCardsUI();
      }
    }, this.animationDuration);
  }

  private setupButtons(): void {
    this.nextBtn?.addEventListener('click', async () => {
        if (this.isAnimating) return;
        this.shiftCards('next');
        await player.nextTrack();
    });
    this.prevBtn?.addEventListener('click', async () => {
        if (this.isAnimating) return;
        this.shiftCards('prev');
        await player.prevTrack();
    });
  }

  private setupGestures(): void {
    const slider = document.querySelector('.card-slider');
    if (!slider) return;

    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', (e: any) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    slider.addEventListener('touchend', (e: any) => {
      touchEndX = e.changedTouches[0].clientX;
      if (touchEndX - touchStartX > 50 && !this.isAnimating) {
        this.shiftCards('prev');
        player.prevTrack();
      }
      if (touchStartX - touchEndX > 50 && !this.isAnimating) {
        this.shiftCards('next');
        player.nextTrack();
      }
    });
  }
}

export const nowPlayingSlider = new NowPlayingCardsSlider();