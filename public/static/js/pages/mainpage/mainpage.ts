import { apiServise } from '@/data.js';
import { router } from '@/routing.js';
import { scrollbar } from '@/utils/scrollbar';
import { slider } from '@/utils/slider';
import { nowPlayingSlider } from "@/pages/mainpage/nowPlayingSlider";
import { playTrack } from '@/playTrackBtn.js';
import { getValidImage, playsParser } from '@/utils/parsers.ts';
import { setPlayButtonsOnAuth } from '@/setPlayButtonsOnAuth.js';
import { playerOnlyOnPlay } from '@/playerOnlyOnplay.js';
import { BasePage } from "@/pages/base/basePage.ts";
import { showInfoMessage } from "@/utils/showInfoMessage";
import { Artist, Album, Track } from '@/models';

interface MainPageData {
  isAuthenticated: boolean;
  artists: Array<{ id: string; name: string; listeners: string; image: string }>;
  albums: Array<{ id: string; name: string; image: string; artist: string; type?: string }>;
  tracks: Array<{ id: string; name: string; image: string; album_id?: string; artists?: Artist[] }>;
}

export class MainPage extends BasePage {
  //Тож для ремувивентлистнеров
  private clickHandlers: Array<{ el: Element, fn: EventListener }> = [];

  protected async renderContent(contentContainer: HTMLElement): Promise<void> {
    let pageData: MainPageData = {
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
      artists: [],
      albums: [],
      tracks: [],
    };
    if (!pageData.isAuthenticated) {
      localStorage.clear();
    }

    const contentTemplate = Handlebars.templates['MainPage.hbs'];
    contentContainer.innerHTML = contentTemplate(pageData);
    const titleEl = document.querySelector('head title');
    if (titleEl) titleEl.textContent = 'Wave Music';

    try {
      const data = await apiServise.getMainPageData();
      pageData.artists = (data.artists || []).map((artist: Artist) => ({
        id: artist.id,
        name: artist.name,
        listeners: playsParser(artist.play_count || 0),
        image: getValidImage(`artists/${artist.avatar_url}`, 'default-artist.png'),
      }));
      pageData.albums = (data.albums || []).map((album: Album) => ({
        id: album.id,
        name: album.title,
        image: getValidImage(`albums/${album.avatar_url}`, 'default-album.png'),
        artist: album.artists?.[0]?.name || 'Unknown Artist',
        artist_id: album.artists?.[0].id,
        type: album.type,
      }));
      pageData.tracks = (data.tracks || []).map((track: Track) => ({
        id: track.id,
        name: track.title,
        image: getValidImage(`albums/${track.album?.avatar_url}`, 'default-album.png'),
        artists: track.artists,
        album_id: track.album?.id,
      }));
    } catch (error: any) {
      console.error('Failed to load main page data:', error);

      if (error.response?.status === 404) {
        router.navigate('/not-found');
        return;
      }

      showInfoMessage('Не удалось загрузить главную страницу');
      return;
    }
    contentContainer.innerHTML = contentTemplate(pageData);

    this.initComponents();
  }

  private initComponents(): void {
    playerOnlyOnPlay();

    slider.init();
    scrollbar.init();
    nowPlayingSlider.init();

    this.setupNavigationLinks();
    setPlayButtonsOnAuth();
    playTrack();
  }

  private setupNavigationLinks(): void {
    const cards = document.querySelectorAll('.click-event-card');
    cards.forEach((card) => {
      const link = (card as HTMLElement).dataset.href;
      if (!link) return;

      const handler = (e: Event) => {
        if (!(e.target as HTMLElement).closest('a')) {
          router.navigate(link);
        }
      };

      card.addEventListener('click', handler);
      this.clickHandlers.push({ el: card, fn: handler });
    });
  }

  public destroy(): void {
    this.clickHandlers.forEach(({ el, fn }) => el.removeEventListener('click', fn));
    this.clickHandlers = [];

    nowPlayingSlider.destroy();
    scrollbar.destroy();
  }
}
