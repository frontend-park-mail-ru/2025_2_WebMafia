import { apiServise } from '@/data';
import { router } from '@/routing';
import { scrollbar } from '@/utils/scrollbar';
import { durationParser, getValidImage, playsParser } from '@/utils/parsers';
import { playTrack } from '@/playTrackBtn';
import { playerOnlyOnPlay } from '@/playerOnlyOnplay';
import { setPlayButtonsOnAuth } from '@/setPlayButtonsOnAuth';
import { likeTrackBtn } from '@/utils/likeTrack';
import { isHttpError, MappedTrack, Track } from '@/models';
import { BasePage } from '@/pages/base/basePage.ts';
import { showInfoMessage } from '@/utils/showInfoMessage.ts';
import { initRowDoubleClick } from '@/utils/doubleClickToPlay';

interface ArtistTracksContext {
  isAuthenticated: boolean;
  artistName: string;
  artistId: string;
  tracks: MappedTrack[];
}

export class ArtistTracksPage extends BasePage {
  async renderContent(contentContainer: HTMLElement, artistId: string) {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    const pageData: ArtistTracksContext = {
      isAuthenticated,
      tracks: [],
      artistName: '',
      artistId: '',
    };

    const contentTemplate = Handlebars.templates['artistTracksPage.hbs'];
    contentContainer.innerHTML = contentTemplate(pageData);
    const titleEl = document.querySelector('head title');
    if (titleEl) titleEl.textContent = 'Wave Music';

    try {
      const data = await apiServise.getArtistTracks(artistId, isAuthenticated);
      if (data) {
        pageData.artistName = data.artist.name;
        pageData.artistId = data.artist.id;
        pageData.tracks = data.tracks.map((track: Track) => ({
          id: track.id,
          name: track.title,
          plays: playsParser(track.play_count || 0),
          album: track.album.title,
          album_id: track.album.id,
          duration: durationParser(track.duration_s),
          cover: getValidImage(`albums/${track.album?.avatar_url}`, 'default-album.png'),
          artists: track.artists,
          is_liked: track.is_liked,
        }));
      }
    } catch (error: unknown) {
      console.error('Failed to load artist tracks page data:', error);

      if (isHttpError(error) && error.response?.status === 404) {
        router.navigate('/not-found');
        return;
      }

      showInfoMessage('Не удалось загрузить страницу треков исполнителя.');
      return;
    }

    contentContainer.innerHTML = contentTemplate(pageData);
    if (pageData.artistName && titleEl) {
      titleEl.textContent = pageData.artistName;
    }

    this.initComponents();
  }

  private initComponents() {
    playerOnlyOnPlay();
    scrollbar.init();

    setPlayButtonsOnAuth();
    likeTrackBtn();
    playTrack();
    initRowDoubleClick('.tracks-table-track-by-artist', '.track-row');
  }
}
