import { apiServise } from '@/data';
import { router } from '@/routing';
import { scrollbar } from '@/utils/scrollbar';
import { getValidImage, playsParser, tracksNumParser } from '@/utils/parsers';
import { playTrack } from '@/playTrackBtn';
import { setPlayButtonsOnAuth } from '@/setPlayButtonsOnAuth';
import { playerOnlyOnPlay } from '@/playerOnlyOnplay';
import { images } from '@/assets';
import { showInfoMessage } from '@/utils/showInfoMessage';
import { playlistModal } from '@/components/modal/playlistModal';
import { BasePage } from '@/pages/base/basePage.ts';
import { contextMenu } from './contexMenu.ts';

interface LibraryItem {
  id?: string;
  name: string;
  image: string;
  created_at: Date;
  type: 'Плейлист' | 'Артист' | 'Альбом' | 'Сингл' | 'EP';
  sub: string;
  href: string;
  description?: string;
  default_avatar?: string;
}

interface LibraryPageData {
  isAuthenticated: boolean;
  library: LibraryItem[];
  playlists: LibraryItem[];
  artists: LibraryItem[];
  albums: LibraryItem[];
  showType: boolean;
}

export class LibraryPage extends BasePage {
  private pageData: LibraryPageData | null = null;

  async renderContent(contentContainer: HTMLElement) {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    this.pageData = {
      isAuthenticated,
      library: [],
      playlists: [],
      artists: [],
      albums: [],
      showType: true,
    };

    const contentTemplate = Handlebars.templates['library.hbs'];
    contentContainer.innerHTML = contentTemplate(this.pageData);
    const titleEl = document.querySelector('head title');
    if (titleEl) titleEl.textContent = 'Библиотека';

    if (!isAuthenticated) {
      return;
    }

    try {
      const data = await apiServise.getLibraryPageData();
      const likedItem: LibraryItem = {
        name: 'Понравившиеся треки',
        image: images.likedTracksPath,
        created_at: new Date(),
        sub: tracksNumParser(data.favourite_tracks?.length || 0),
        href: 'playlist/LM',
        type: 'Плейлист',
      };
      this.addItem(likedItem, 'playlists');

      data.artists.forEach((artist: any) => {
        this.addItem(
          {
            id: artist.id,
            name: artist.name,
            image: getValidImage(`artists/${artist.avatar_url}`, images.defaultArtistPath),
            created_at: new Date(artist.created_at),
            type: 'Артист',
            sub: playsParser(artist.play_count || 0),
            href: `artist/${artist.id}`,
          },
          'artists'
        );
      });

      data.albums.forEach((album: any) => {
        this.addItem(
          {
            id: album.id,
            name: album.title,
            image: getValidImage(`albums/${album.avatar_url}`, images.defaultAlbumPath),
            sub: album.artists?.[0]?.name || 'Unknown',
            created_at: new Date(album.created_at),
            type: album.type,
            href: `album/${album.id}`,
          },
          'albums'
        );
      });

      data.playlists.forEach((playlist: any) => {
        if (!playlist.is_favorite) {
          this.addItem(
            {
              id: playlist.id,
              name: playlist.title,
              description: playlist.description,
              image: getValidImage(playlist.avatar_url, images.defaultPlaylistPath),
              created_at: new Date(playlist.created_at),
              sub: tracksNumParser(playlist.tracks?.length || 0),
              type: 'Плейлист',
              href: `playlist/${playlist.id}`,
            },
            'playlists'
          );
        }
      });

      this.pageData?.library.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    } catch (error: any) {
      console.error('Failed to load library page data:', error);

      if (error.response && error.response.status === 404) {
        router.navigate('/not-found');
        return;
      }

      showInfoMessage('Не удалось загрузить страницу библиотеки.');
      return;
    }

    contentContainer.innerHTML = contentTemplate(this.pageData);
    const gridTemplate = Handlebars.templates['libraryGrid.hbs'];
    const gridContainer = contentContainer.querySelector('.grid-layout');
    if (gridContainer) gridContainer.innerHTML = gridTemplate(this.pageData);

    this.initComponents();
  }

  private addItem(item: LibraryItem, categoryKey: 'playlists' | 'artists' | 'albums') {
    if (!this.pageData) return;
    this.pageData.library.push(item);
    this.pageData[categoryKey].push(item);
  }

  private initComponents() {
    playerOnlyOnPlay();
    scrollbar.init();
    playTrack();
    setPlayButtonsOnAuth();

    this.initSearchAndSort();

    contextMenu.init(
      (id: string, type: string, card: HTMLElement) => this.handleItemDeletion(id, type, card),
      (id: string, newData) => this.handleItemUpdate(id, newData)
    );
  }

  private handleItemDeletion(id: string, typeInCard: string, cardElement: HTMLElement) {
    cardElement.remove();

    if (!this.pageData) return;

    let categoryKey: keyof LibraryPageData = 'albums';
    if (typeInCard === 'Плейлист') categoryKey = 'playlists';
    else if (typeInCard === 'Артист') categoryKey = 'artists';

    const libIndex = this.pageData.library.findIndex((item) => item.id === id);
    if (libIndex !== -1) {
      this.pageData.library.splice(libIndex, 1);
    }

    const categoryArray = this.pageData[categoryKey] as LibraryItem[];
    const catIndex = categoryArray.findIndex((item) => item.id === id);
    if (catIndex !== -1) {
      categoryArray.splice(catIndex, 1);
    }

    if (categoryArray.length === 0) {
      const sortButton = document.querySelector(`.sort-buttons button[data-name="${categoryKey}"]`);
      if (sortButton) {
        if (sortButton.classList.contains('primary-button')) {
          const disableSortBtn = document.getElementById('disableSort');
          if (disableSortBtn) disableSortBtn.click();
        }
        sortButton.remove();
      }
    }
  }

  private handleItemUpdate(id: string, newData: { title: string; description: string; image: string | null }) {
    if (!this.pageData) return;
    const item = this.pageData.playlists.find((p) => p.id === id);
    if (item) {
      item.name = newData.title;
      item.description = newData.description;
      if (newData.image) item.image = newData.image;
    }
  }

  private initSearchAndSort() {
    const searchToggle = document.getElementById('librarySearchToggle');
    const createPlaylistButtons = document.querySelectorAll('.create-playlist-button');
    const libraryHeaderContainer = document.querySelector('.library-header-container');
    const titleName = document.querySelector('.title-name');
    const createPlaylistToggle = document.querySelector('.create-playlist-toggle');
    const rightSearchContainer = document.querySelector('.library-search-container');
    const closeButton = rightSearchContainer?.querySelector('.input-close-button');
    const originalParent = rightSearchContainer?.parentElement;

    createPlaylistButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        playlistModal.open({ isEdit: false });
      });
    });

    if (searchToggle && rightSearchContainer && libraryHeaderContainer) {
      searchToggle.addEventListener('click', (e) => {
        e.preventDefault();
        titleName?.classList.add('hidden');
        searchToggle.classList.add('hidden');
        createPlaylistToggle?.classList.add('hidden');

        libraryHeaderContainer.appendChild(rightSearchContainer);
        rightSearchContainer.classList.remove('active');
        requestAnimationFrame(() => rightSearchContainer.classList.add('active'));

        const input = rightSearchContainer.querySelector('#librarySearchInput') as HTMLElement;
        setTimeout(() => input?.focus(), 200);
      });
    }

    if (closeButton && rightSearchContainer && originalParent) {
      closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        rightSearchContainer.classList.remove('active');
        titleName?.classList.remove('hidden');
        searchToggle?.classList.remove('hidden');
        createPlaylistToggle?.classList.remove('hidden');
        setTimeout(() => originalParent.appendChild(rightSearchContainer), 200);
      });
    }

    const container = document.querySelector('.sort-buttons');
    const buttons = container?.querySelectorAll('button');
    const disableSort = document.getElementById('disableSort');
    const gridTemplate = Handlebars.templates['libraryGrid.hbs'];
    const gridContainer = document.querySelector('.grid-layout');

    if (buttons && disableSort && gridContainer && this.pageData) {
      buttons.forEach((button) => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const isActivating = button.classList.contains('secondary-button');

          if (button.id === 'disableSort') {
            buttons.forEach((b) => {
              b.style.display = '';
              b.classList.remove('primary-button');
              b.classList.add('secondary-button');
            });
            button.style.display = 'none';
            gridContainer.innerHTML = gridTemplate(this.pageData);
          } else if (isActivating) {
            button.classList.remove('secondary-button');
            button.classList.add('primary-button');
            disableSort.style.display = 'flex';

            buttons.forEach((b) => {
              if (b !== button && b.id !== 'disableSort') b.style.display = 'none';
            });

            const dataName = button.dataset.name as keyof LibraryPageData;
            const filteredData = {
              library: this.pageData![dataName] || [],
              showType: false,
            };
            gridContainer.innerHTML = gridTemplate(filteredData);
          }
        });
      });
    }
  }

  public destroy() {
    contextMenu.destroy();
    this.pageData = null;
  }
}
