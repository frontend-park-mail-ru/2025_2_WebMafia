import { apiServise } from '@/data';
import { router } from '@/routing';
import { scrollbar } from '@/utils/scrollbar';
import { slider } from '@/utils/slider';
import { playsParser, durationParser, getValidImage, totalDurationParser, tracksNumParser } from '@/utils/parsers';
import { playTrack } from '@/playTrackBtn';
import { setPlayButtonsOnAuth } from '@/setPlayButtonsOnAuth';
import { playerOnlyOnPlay } from '@/playerOnlyOnplay';
import { likeTrackBtn } from '@/utils/likeTrack';
import { albumPlaylistButtons } from "@/utils/albumPlaylistButtons";
import { share } from "@/utils/shareBtn";
import { showInfoMessage } from "@/utils/showInfoMessage";
import { BasePage } from "@/pages/base/basePage.ts";
import { images } from "@/assets";
import {confirmation} from "@/components/confirmation_modal/confirmationModal.ts";
import { MappedTrack, Track } from "@/models.ts";

interface AlbumPageData {
  isAuthenticated: boolean;
  id?: string;
  title?: string;
  type?: string;
  is_liked?: boolean;
  year?: string;
  cover?: string;
  artist?: {
    id: string;
    name: string;
    avatar: string;
  };
  description?: string;
  track_id?: string | boolean;
  totalDuration?: string;
  tracksNum?: string;
  tracks: MappedTrack[];
}

export class AlbumPage extends BasePage {
  protected async renderContent(contentContainer: HTMLElement, albumId: string) {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    let pageData: AlbumPageData = {
      isAuthenticated: isAuthenticated,
      tracks: [],
    };

    const contentTemplate = Handlebars.templates['album.hbs'];
    contentContainer.innerHTML = contentTemplate(pageData);
    const titleEl = document.querySelector('head title');
    if (titleEl) titleEl.textContent = 'Wave Music';

    try {
      const data = await apiServise.getAlbumPageData(albumId, isAuthenticated);
      if (!data.album || !data.album.id) {
        router.navigate('/not-found');
        return;
      }

      const firstTrackId = data.tracks && data.tracks.length > 0 ? data.tracks[0].id : false;
      const mainArtist = data.album.artists && data.album.artists[0];

      pageData.id = data.album.id;
      pageData.title = data.album.title;
      pageData.type = data.album.type;
      pageData.is_liked = data.album.is_liked;
      pageData.year = data.album.release_date ? data.album.release_date.slice(0, 4) : '';
      pageData.cover = getValidImage(`albums/${data.album.avatar_url}`, images.defaultAlbumPath);
      pageData.description = data.album.description;
      pageData.track_id = firstTrackId;

      if (mainArtist) {
        pageData.artist = {
          id: mainArtist.id,
          name: mainArtist.name,
          avatar: getValidImage(`artists/${mainArtist.avatar_url}`, images.defaultArtistPath),
        };
      }

      let totalDuration = 0;
      pageData.tracks = (data.tracks || []).map((track: Track) => {
        totalDuration += track.duration_s;
        return {
          id: track.id,
          name: track.title,
          plays: playsParser(track.play_count),
          duration: durationParser(track.duration_s),
          is_liked: track.is_liked,
        };
      });
      pageData.totalDuration = totalDurationParser(totalDuration);
      pageData.tracksNum = tracksNumParser(pageData.tracks.length);
    } catch (error: any) {
      console.error('Failed to load album page data:', error);

      if (error.response && error.response.status === 404) {
        router.navigate('/not-found');
        return;
      }

      showInfoMessage('Не удалось загрузить страницу альбома.');
      return;
    }

    contentContainer.innerHTML = contentTemplate(pageData);
    if (pageData.title && titleEl) {
      titleEl.textContent = pageData.title;
    }

    this.initComponents();
  }

  private initComponents() {
    playerOnlyOnPlay();
    slider.init();
    scrollbar.init();

    this.initLikeButton();
    setPlayButtonsOnAuth();
    likeTrackBtn();
    playTrack();
    albumPlaylistButtons();
    share();
  }

  private initLikeButton() {
    const likeButton = document.getElementById('albumLikeButton') as HTMLButtonElement;
    if (!likeButton) return;
    likeButton.addEventListener('click', async () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      if (!isAuthenticated) {
        confirmation.showConfirm({
          title: 'Понравился альбом?',
          description: `Добавление альбома в библиотеку доступно в твоём <b>Wave Music</b> аккаунте`,
          confirmText: 'Войти',
          cancelText: 'Закрыть',
          onConfirm: () => {
            router.navigate('/login')
          }
        });
        return;
      }

      const albumId = likeButton.dataset.albumId;
      const albumName = likeButton.dataset.albumName || 'Альбом';
      const albumCover = likeButton.dataset.albumCover || images.defaultAlbumPath;
      const albumType = likeButton.dataset.albumType || 'Альбом';
      const likeIcon = likeButton.querySelector('.actions-item-svg');
      const likeText = likeButton.querySelector('.actions-item-text');

      if (!albumId || !likeIcon || !likeText) return;

      const wasLiked = likeIcon.classList.contains('active');
      const newLikedState = !wasLiked;

      const renderState = (isLiked: boolean) => {
        if (isLiked) {
          likeIcon.classList.add('active');
          likeText.textContent = 'Удалить из библиотеки';
        } else {
          likeIcon.classList.remove('active');
          likeText.textContent = 'Добавить в библиотеку';
        }
      };

      renderState(newLikedState);
      likeButton.disabled = true;

      try {
        await apiServise.toggleAlbumLike(albumId, newLikedState);

        if (newLikedState) {
          window.dispatchEvent(new CustomEvent('sidebar:create', {
            detail: {
              id: albumId,
              name: albumName,
              image: albumCover,
              type: albumType,
            }
          }));
          showInfoMessage(`Альбом «${albumName}» добавлен в библиотеку`);
        } else {
          window.dispatchEvent(new CustomEvent(`sidebar:remove`, { detail: { id: albumId } }));
          showInfoMessage(`Альбом «${albumName}» удалён из библиотеки`);
        }

      } catch (error) {
        console.error('Failed to like album:', error);
        renderState(wasLiked);
        showInfoMessage('Не удалось добавить альбом в библиотеку');
      } finally {
        likeButton.disabled = false;
      }
    });
  }
}
