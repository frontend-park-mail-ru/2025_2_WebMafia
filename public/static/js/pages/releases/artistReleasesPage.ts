import { apiServise } from '@/data.ts';
import { router } from '@/routing.ts';
import { scrollbar } from '@/utils/scrollbar';
import { getValidImage } from '@/utils/parsers.ts';
import { playTrack } from '@/playTrackBtn.js';
import { setPlayButtonsOnAuth } from '@/setPlayButtonsOnAuth.js';
import { playerOnlyOnPlay } from '@/playerOnlyOnplay.js';
import { BasePage } from "@/pages/base/basePage.ts";
import { showInfoMessage } from "@/utils/showInfoMessage.ts";

interface ArtistReleasesPageData {
  id?: string;
  name?: string;
  releaseTypeTitle: string;
  isSingles: boolean;
  albums: Array<{ id: string; name: string; cover: string; year: string; type?: string }>;
}

export class ArtistReleasesPage extends BasePage {
  private isSinglesPage(): boolean {
    return window.location.pathname.endsWith('/singles');
  }

  async renderContent(contentContainer: HTMLElement, artistId: string) {
    const isSingles = this.isSinglesPage();
    let pageData: ArtistReleasesPageData = {
      releaseTypeTitle: isSingles ? 'Синглы и EP' : 'Альбомы',
      isSingles: isSingles,
      albums: [],
    };

    const contentTemplate = Handlebars.templates['artistReleasesPage.hbs'];
    contentContainer.innerHTML = contentTemplate(pageData);
    const titleEl = document.querySelector('head title');
    if (titleEl) titleEl.textContent = 'Wave Music';

    try {
      const data = await apiServise.getArtistAlbums(artistId);
      if (!data.artist) {
        router.navigate('/not-found');
        return;
      }
      pageData.name = data.artist.name;
      pageData.id = data.artist.id;
      pageData.albums = data.albums
        .filter(album => {
          if (isSingles) {
            return album.type === 'Сингл' || album.type === 'EP';
          }
          return album.type === 'Альбом';
        })
        .map(album => ({
          id: album.id,
          name: album.title,
          cover: getValidImage(`albums/${album.avatar_url}`, 'default-album.png'),
          year: album.release_date?.slice(0, 4) ?? '',
          type: album.type,
        }));
    } catch (error: any) {
      console.error('Failed to load artist albums page data:', error);

      if (error.response && error.response.status === 404) {
        router.navigate('/not-found');
        return;
      }

      showInfoMessage('Не удалось загрузить страницу альбомов исполнителя');
      return;
    }

    contentContainer.innerHTML = contentTemplate(pageData);
    if (pageData.name && titleEl) {
      titleEl.textContent = pageData.name;
    }

    this.initComponents();
  }

  private initComponents() {
    scrollbar.init();
    playTrack();
    setPlayButtonsOnAuth();
    playerOnlyOnPlay();
  }
}
