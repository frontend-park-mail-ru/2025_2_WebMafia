import { BasePage } from '@/pages/base/basePage.ts';
import { scrollbar } from '@/utils/scrollbar';
import { apiServise } from '@/data';
import { router } from '@/routing';
import { slider } from '@/utils/slider';
import { durationParser, getValidImage, playsParser } from '@/utils/parsers';
import { playTrack } from '@/playTrackBtn';
import { setPlayButtonsOnAuth } from '@/setPlayButtonsOnAuth';
import { playerOnlyOnPlay } from '@/playerOnlyOnplay';
import { likeTrackBtn } from '@/utils/likeTrack';
import { images } from '@/assets';
import { showInfoMessage } from '@/utils/showInfoMessage';
import { Album, Artist, Track } from '@/models.ts';

interface SearchItem {
  id: string;
  name: string;
  image: string;
  href: string;
  type?: string;
  listeners?: string;
  artist?: string;
  artist_id?: string;
  album_id?: string;
  duration?: string;
  is_liked?: boolean;
}

interface SearchPageContext {
  isAuthenticated: boolean;
  titleName: string;
  best_result: SearchItem | null;
  artists: SearchItem[];
  albums: SearchItem[];
  tracks: SearchItem[];
  hasResults?: boolean;
}

export class SearchPage extends BasePage {
  private clickHandlers: Array<{ el: Element; fn: EventListener }> = [];

  protected async renderContent(container: HTMLElement, query: string): Promise<void> {
    const decodedName = decodeURIComponent(query);
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    const template = Handlebars.templates['search_page.hbs'];
    container.innerHTML = template({
      isAuthenticated,
      titleName: decodedName,
      best_result: null,
      artists: [],
      albums: [],
      tracks: [],
    });

    document.querySelector('head title')!.textContent = `Поиск ${decodedName}`;

    this.updateHeaderInput(decodedName);

    try {
      const [trackData, albumData, artistData] = await Promise.all([
        apiServise.searchTrack(decodedName, isAuthenticated),
        apiServise.searchAlbum(decodedName),
        apiServise.searchArtist(decodedName),
      ]);

      const artists: SearchItem[] = (artistData || []).map((artist: Artist) => ({
        id: artist.id,
        name: artist.name,
        listeners: playsParser(artist.play_count || 0),
        image: getValidImage(`artists/${artist.avatar_url}`, images.defaultArtistPath),
        type: 'Артист',
        href: `/artist/${artist.id}`,
      }));

      const albums: SearchItem[] = (albumData || []).map((album: Album) => ({
        id: album.id,
        name: album.title,
        image: getValidImage(`albums/${album.avatar_url}`, images.defaultAlbumPath),
        artist: album.artists?.[0]?.name || 'Unknown Artist',
        artist_id: album.artists?.[0]?.id,
        type: album.type,
        href: `/album/${album.id}`,
      }));

      const tracks: SearchItem[] = (trackData || []).map((track: Track) => ({
        id: track.id,
        name: track.title,
        album_id: track.album?.id,
        duration: durationParser(track.duration_s),
        image: getValidImage(`albums/${track.album?.avatar_url}`, images.defaultAlbumPath),
        artist: track.artists?.[0]?.name || 'Unknown Artist',
        artist_id: track.album?.artists?.[0]?.id,
        type: 'Трек',
        is_liked: track.is_liked,
        href: `/album/${track.album?.id}`,
      }));

      let bestResult: SearchItem | null = null;
      if (artists.length > 0) bestResult = artists[0];
      else if (albums.length > 0) bestResult = albums[0];
      else if (tracks.length > 0) bestResult = tracks[0];

      const pageData: SearchPageContext = {
        isAuthenticated,
        titleName: decodedName,
        best_result: bestResult,
        artists,
        albums,
        tracks,
        hasResults: !!bestResult,
      };

      container.innerHTML = template(pageData);

      this.afterRender();
    } catch (error) {
      console.error('Search page error:', error);
      showInfoMessage('Ошибка при поиске');
    }
  }

  private afterRender() {
    playerOnlyOnPlay();
    slider.init();
    scrollbar.init();
    this.addCardListeners();
    setPlayButtonsOnAuth();
    likeTrackBtn();
    playTrack();
  }

  private updateHeaderInput(value: string) {
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = value;
    }
  }

  private addCardListeners() {
    const cards = document.querySelectorAll('.click-event-card');

    cards.forEach((card) => {
      const link = (card as HTMLElement).dataset.href;
      if (!link) return;

      const handler = (e: Event) => {
        const target = e.target as HTMLElement;
        if (!target.closest('a') && !target.closest('button')) {
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
    this.updateHeaderInput('');
  }
}
