import { apiServise } from '@/data.ts';
import { router } from '@/routing.ts';
import { scrollbar } from '@/utils/scrollbar';
import { slider } from '@/utils/slider';
import {
  playsParser,
  durationParser,
  getValidImage,
  totalDurationParser,
  tracksNumParser,
  dateParser,
  durationToSec,
} from '@/utils/parsers.ts';
import { playTrack } from '@/playTrackBtn';
import { setPlayButtonsOnAuth } from '@/setPlayButtonsOnAuth';
import { playerOnlyOnPlay } from '@/playerOnlyOnplay';
import { likeTrackBtn } from '@/utils/likeTrack';
import { images } from '@/assets';
import { albumPlaylistButtons } from '@/utils/albumPlaylistButtons';
import { share } from '@/utils/shareBtn';
import { deletePlaylistLogic } from '@/utils/deletePlaylist';
import { playlistModal } from '@/components/modal/playlistModal';
import { showInfoMessage } from '@/utils/showInfoMessage';
import { MappedTrack, PlaylistSuccessData, Track } from '@/models.ts';
import { BasePage } from '@/pages/base/basePage.ts';
import { confirmation } from '@/components/confirmation_modal/confirmationModal.ts';

interface PlaylistPageData {
  isAuthenticated: boolean;
  id: string;
  title: string;
  description?: string;
  image: string | null;
  date: string;
  tracksNum: string;
  totalDuration: string;
  favourite: boolean;
  isCreator: boolean;
  tracks: MappedTrack[];
  track_id: string | null;
  searchValue?: string;
}

export class PlaylistPage extends BasePage {
  private playlistData: Partial<PlaylistSuccessData> = {};
  private favourite = true;
  private totalDurationSec = 0;
  private currentSearchResults: any[] = [];

  private boundPlayerLikeHandler: EventListener | null = null;

  async renderContent(contentContainer: HTMLElement, playlistId: string) {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    if (!isAuthenticated && playlistId === 'LM') {
      router.navigate('/not-found');
      return;
    }

    const contentTemplate = Handlebars.templates['playlist.hbs'];
    contentContainer.innerHTML = contentTemplate({});
    const titleEl = document.querySelector('head title');
    if (titleEl) titleEl.textContent = 'Wave Music';

    try {
      const data = await apiServise.getPlaylistPageData(playlistId, isAuthenticated);
      const firstTrackId = data.tracks && data.tracks.length > 0 ? data.tracks[0].id : null;
      const pageData: PlaylistPageData = {
        isAuthenticated,
        id: playlistId,
        title: 'Понравившиеся треки',
        image: images.likedTracksPath,
        description: 'В этот плейлист попадают треки, которым вы поставили отметку "Нравится"',
        date: 'Создан автоматически',
        favourite: true,
        isCreator: false,
        tracks: [],
        tracksNum: '',
        totalDuration: '',
        track_id: firstTrackId,
      };
      if (playlistId !== 'LM') {
        this.favourite = false;
        pageData.favourite = false;
        pageData.title = data.title;
        pageData.id = data.id;
        pageData.date = dateParser(data.created_at);
        pageData.image = getValidImage(data.avatar_url ? data.avatar_url : '', images.defaultPlaylistPath);
        pageData.description = data.description;
        pageData.isCreator = data.creator_id === localStorage.getItem('uid');
      }
      this.totalDurationSec = 0;
      pageData.tracks = (data.tracks || []).map((track) => {
        this.totalDurationSec += track.duration_s;
        return {
          id: track.id,
          name: track.title,
          album: track.album?.title,
          album_id: track.album?.id,
          cover: getValidImage(`albums/${track.album?.avatar_url}`, images.defaultAlbumPath),
          artists: track.artists,
          plays: playsParser(track.play_count),
          duration: durationParser(track.duration_s),
          duration_s: track.duration_s,
          is_liked: pageData.favourite ? true : track.is_liked,
        };
      });

      this.playlistData.id = pageData.id;
      this.playlistData.title = pageData.title;
      this.playlistData.description = pageData.description;
      this.playlistData.image = pageData.image === images.defaultPlaylistPath ? null : pageData.image;

      pageData.totalDuration = totalDurationParser(this.totalDurationSec);
      pageData.tracksNum = tracksNumParser(pageData.tracks.length);

      contentContainer.innerHTML = contentTemplate(pageData);
      if (pageData.title && titleEl) {
        titleEl.textContent = pageData.title;
      }
    } catch (error: any) {
      console.error('Failed to load playlist page data:', error);

      if (error.response && error.response.status === 404) {
        router.navigate('/not-found');
        return;
      }

      showInfoMessage('Не удалось загрузить страницу плейлиста.');
      return;
    }

    this.initComponents();
  }

  private initComponents() {
    playerOnlyOnPlay();
    slider.init();
    scrollbar.init();

    setPlayButtonsOnAuth();
    likeTrackBtn();
    playTrack();
    albumPlaylistButtons();
    share();

    this.addEventListeners();
  }

  private addEventListeners() {
    if (this.favourite) {
      this.initFavoriteLogic();
      return;
    }

    this.initEditButton();
    this.initDeleteButton();
    this.initSearchTracks();
    this.initDeleteTrackButton();
  }

  private initFavoriteLogic() {
    this.boundPlayerLikeHandler = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { id, isLiked } = customEvent.detail;
      if (!isLiked) {
        this.removeTrackRow(id);
      }
    };

    window.addEventListener('player-like-changed', this.boundPlayerLikeHandler);

    const container = document.getElementById('addedTracksTable');
    container?.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.like-btn-track');
      if (!btn) return;
      const id = (btn as HTMLElement).dataset.trackId;
      if (!id) return;
      const row = btn.closest('.album-row');
      row?.remove();
      this.renumberTracks();
    });
  }

  private initEditButton() {
    const editPlaylistButton = document.getElementById('editPlaylistButton');
    if (!editPlaylistButton) return;

    editPlaylistButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (!this.playlistData.id) return;

      const tracksCount = document.querySelectorAll('#addedTracksTable .album-row').length;

      playlistModal.open(
        {
          isEdit: true,
          id: this.playlistData.id,
          title: this.playlistData.title,
          description: this.playlistData.description,
          image: this.playlistData.image || undefined,
          hasTracks: tracksCount > 0,
          autoGenerate: false,
        },
        (newData: PlaylistSuccessData) => {
          this.updatePlaylistUI(newData);
        }
      );
    });
  }

  private updatePlaylistUI(newData: PlaylistSuccessData) {
    this.playlistData = newData;

    const avatarContainer = document.querySelector('#playlistAvatarContainer img') as HTMLImageElement;
    avatarContainer.src = newData.image ? newData.image : images.defaultPlaylistPath;

    const title = document.querySelector('.album-card-title');
    if (title) title.textContent = newData.title;

    const description = document.getElementById('getDescription');
    const allDescription = document.getElementById('allDescription');
    if (description) {
      if (newData.description.trim() === '') {
        description.remove();
      } else {
        description.textContent = newData.description;
        if (allDescription) allDescription.textContent = newData.description;
      }
    } else if (newData.description.trim() !== '') {
      const container = document.querySelector('.album-card') as HTMLElement;
      const buttons = container.querySelector('.album-buttons') as HTMLElement;

      const newDescEl = document.createElement('div');
      newDescEl.className = 'card-sub album-description';
      newDescEl.id = 'getDescription';
      newDescEl.textContent = newData.description;
      if (allDescription) allDescription.textContent = newData.description;

      container.insertBefore(newDescEl, buttons);

      const getDescriptionOverlay = document.getElementById('descriptionOverlay');
      if (getDescriptionOverlay) {
        newDescEl.addEventListener('click', (e) => {
          e.preventDefault();
          getDescriptionOverlay.classList.add('active');
        });
      }
    }

    showInfoMessage('Изменения успешно сохранены!');
  }

  private initDeleteButton() {
    const deletePlaylistButton = document.getElementById('deletePlaylistButton');
    if (!deletePlaylistButton) return;

    deletePlaylistButton.addEventListener('click', (e) => {
      e.preventDefault();
      deletePlaylistLogic(this.playlistData.id || '', this.playlistData.title || '', () => {
        router.navigate('/library');
      });
    });
  }

  private initSearchTracks() {
    const searchTracks = document.getElementById('searchTracks') as HTMLInputElement;
    const searchedTracksContainer = document.getElementById('searchedTracksContainer');
    if (!searchedTracksContainer || !searchTracks) return;

    let timeout: any;
    searchTracks.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        const val = (e.target as HTMLInputElement).value.trim();
        if (!val) {
          searchedTracksContainer.innerHTML = '';
          return;
        }
        const tracks = await apiServise.searchTrack(val, true);
        this.renderSearchResults(tracks, searchedTracksContainer);
      }, 400);
    });

    searchedTracksContainer.addEventListener('click', async (e) => {
      const btn = (e.target as HTMLElement).closest('.add-track-size');
      if (!btn) return;
      e.stopPropagation();

      const trackId = (btn as HTMLElement).dataset.trackId;
      const track = this.currentSearchResults.find((t) => t.id === trackId);

      if (track && this.playlistData.id) {
        await apiServise.addTrackToPlaylist(trackId!, this.playlistData.id);
        this.addTrackToTable(track);
      }
    });
  }

  private renderSearchResults(tracks: Track[], searchedTracksContainer: HTMLElement) {
    this.currentSearchResults = tracks;

    const tracksTemplate = Handlebars.templates['searchedTracks.hbs'];
    let pageData = {
      searched_tracks: tracks.map((track) => ({
        id: track.id,
        name: track.title,
        album: track.album.title,
        album_id: track.album.id,
        cover: getValidImage('albums/' + track.album.avatar_url, images.defaultPlaylistPath),
        artists: track.artists,
        plays: playsParser(track.play_count),
        duration: durationParser(track.duration_s),
        is_liked: track.is_liked,
      })),
    };

    searchedTracksContainer.innerHTML = tracksTemplate(pageData);
    playTrack();
  }

  private addTrackToTable(track: Track) {
    const table = document.getElementById('addedTracksTable');
    if (!table) return;

    const num = table.querySelectorAll('.album-row').length + 1;

    const trackData = {
      id: track.id,
      name: track.title,
      num: num,
      cover: getValidImage(`albums/${track.album?.avatar_url}`, images.defaultAlbumPath),
      duration: durationParser(track.duration_s),
      album: track.album?.title,
      artists: track.artists,
      is_liked: track.is_liked,
    };

    const rowHtml = Handlebars.templates['trackRow.hbs'](trackData);
    table.insertAdjacentHTML('beforeend', rowHtml);

    this.totalDurationSec += track.duration_s;
    this.updateStats(num);

    if (num === 1) {
      const searchTitle = document.querySelector('.playlist-search-title');
      searchTitle?.insertAdjacentHTML('beforebegin', '<div class="header-divider" id="playlistTracksDivider"></div>');
      const descriptionTemplate = Handlebars.templates['generateDescription.hbs'];
      const confirmTemplate = Handlebars.templates['generateConfirm.hbs'];
      confirmation.showConfirm({
        title: 'Первый трек добавлен!',
        description: descriptionTemplate({}),
        confirmText: confirmTemplate({}),
        cancelText: 'Позже',
        onConfirm: () => {
          if (!this.playlistData.id) return;

          playlistModal.open(
            {
              isEdit: true,
              id: this.playlistData.id,
              title: this.playlistData.title,
              description: this.playlistData.description,
              image: this.playlistData.image || undefined,
              hasTracks: true,
              autoGenerate: true,
            },
            (newData: PlaylistSuccessData) => {
              this.updatePlaylistUI(newData);
            }
          );
        },
      });
    }

    likeTrackBtn();
    playTrack();
  }

  private initDeleteTrackButton() {
    const table = document.getElementById('addedTracksTable');
    if (!table) return;

    table.addEventListener('click', async (e) => {
      const btn = (e.target as HTMLElement).closest('.delete-btn-track');
      if (!btn) return;
      e.stopPropagation();

      const row = btn.closest('.album-row');
      const trackId = (btn as HTMLElement).dataset.trackId;

      if (row && trackId && this.playlistData.id) {
        await apiServise.deleteTrackFromPlaylist(trackId, this.playlistData.id);

        this.totalDurationSec -= durationToSec(row.querySelector('.track-duration')?.textContent || '');

        row.remove();
        this.renumberTracks();
      }
    });
  }

  private renumberTracks() {
    const rows = document.querySelectorAll('#addedTracksTable .playlist-track-number');
    rows.forEach((el, index) => {
      el.textContent = String(index + 1);
    });
    this.updateStats(rows.length);

    if (rows.length === 0) {
      document.getElementById('playlistTracksDivider')?.remove();
    }
  }

  private updateStats(count: number) {
    const numEl = document.getElementById('tracksNum');
    const durEl = document.getElementById('totalDuration');

    if (numEl) numEl.textContent = tracksNumParser(count);
    if (durEl) durEl.textContent = totalDurationParser(this.totalDurationSec);
  }

  private removeTrackRow(id: string) {
    const row = document.querySelector(`.album-row .like-btn-track[data-track-id="${id}"]`)?.closest('.album-row');
    if (row) {
      row.remove();
      this.renumberTracks();
    }
  }

  public destroy(): void {
    if (this.boundPlayerLikeHandler) {
      window.removeEventListener('player-like-changed', this.boundPlayerLikeHandler);
      this.boundPlayerLikeHandler = null;
    }
    this.playlistData = {};
  }
}
