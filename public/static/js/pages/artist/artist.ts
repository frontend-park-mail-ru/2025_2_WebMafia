import { router } from '@/routing';
import { scrollbar } from '@/utils/scrollbar';
import { apiServise } from '@/data.js';
import { durationParser, getValidImage, playsParser } from '@/utils/parsers';
import { slider } from '@/utils/slider';
import { playTrack } from '@/playTrackBtn.js';
import { setPlayButtonsOnAuth } from '@/setPlayButtonsOnAuth.js';
import { playerOnlyOnPlay } from '@/playerOnlyOnplay.js';
import { likeTrackBtn } from '@/utils/likeTrack.js';
import { share } from "@/utils/shareBtn.js";
import { showInfoMessage } from "@/utils/showInfoMessage";
import { BasePage } from "@/pages/base/basePage.ts";
import { confirmation } from "@/components/confirmation_modal/confirmationModal.js";

interface ArtistPageData {
  isAuthenticated: boolean;
  id?: string;
  name?: string;
  artist_header?: string;
  description?: string;
  isSubscribed?: boolean;
  listeners?: string;
  similar_artists: any[];
  popular_tracks: any[];
  albums: any[];
  singls: any[];
}

export class ArtistPage extends BasePage {
  async renderContent(contentContainer: HTMLElement, artistId: string) {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    let pageData: ArtistPageData = {
      isAuthenticated: isAuthenticated,
      albums: [],
      popular_tracks: [],
      singls: [],
      similar_artists: [],
    };

    const contentTemplate = Handlebars.templates['artistPage.hbs'];
    contentContainer.innerHTML = contentTemplate(pageData);
    const titleEl = document.querySelector('head title');
    if (titleEl) titleEl.textContent = 'Wave Music';

    try {
      const data = await apiServise.getArtistPageData(artistId, pageData.isAuthenticated);
      if (!data.artist) router.navigate('/not-found');
      pageData.id = data.artist.id;
      pageData.name = data.artist.name;
      pageData.artist_header = getValidImage(`artists/${data.artist.header_url}`, 'default-artist.png');
      pageData.description = data.artist.description;
      pageData.isSubscribed = data.artist.isSubscribed;
      pageData.listeners = playsParser(data.artist.play_count || 0);
      pageData.similar_artists = (data.similar_artists || []).map((artist: any) => ({
        id: artist.id,
        name: artist.name,
        listeners: playsParser(artist.play_count || 0),
        image: getValidImage(`artists/${artist.avatar_url}`, 'default-artist.png'),
      }));
      pageData.popular_tracks = (data.popular_tracks || []).map((track: any) => ({
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
      data.albums.forEach((album: any) => {
        const item = {
          id: album.id,
          name: album.title,
          cover: getValidImage(`albums/${album.avatar_url}`, 'default-album.png'),
          year: album.release_date ? album.release_date.slice(0, 4) : '',
          type: album.type,
        };

        if (album.type && (album.type === 'Сингл' || album.type === 'EP')) {
          pageData.singls.push(item);
        } else {
          pageData.albums.push(item);
        }
      });
    } catch (error: any) {
      console.error('Failed to load artist page data:', error);

      if (error.response && error.response.status === 404) {
        router.navigate('/not-found');
        return;
      }

      showInfoMessage('Не удалось загрузить страницу артиста');
      return;
    }

    contentContainer.innerHTML = contentTemplate(pageData);
    if (pageData.name && titleEl) {
      titleEl.textContent = pageData.name;
    }

    this.initComponents();
  }

  private initComponents(): void {
    playerOnlyOnPlay();

    slider.init();
    scrollbar.init();

    this.initDescriptionToggle();
    this.initSubscribeButton();
    setPlayButtonsOnAuth();
    likeTrackBtn();
    playTrack();
    share();
  }

  private initDescriptionToggle() {
    const showInfoBtn = document.getElementById('showArtistDescription');
    const container = document.querySelector('.artist-container') as HTMLElement;

    if (!showInfoBtn || !container) return;
    showInfoBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const wrapper = container.querySelector('.artist-description') as HTMLElement;
      if (!wrapper) return;
      const height = window.innerWidth < 560 ? 350 : 450;

      if (container.classList.contains('expanded')) {
        wrapper.style.maxHeight = '35px';
        container.style.minHeight = `${height}px`;
        setTimeout(() => {
          wrapper.style.removeProperty('-webkit-line-clamp');
          wrapper.style.setProperty('-webkit-line-clamp', '2');
          wrapper.style.removeProperty('white-space');
        }, 600);
      } else {
        wrapper.style.setProperty('-webkit-line-clamp', 'unset');
        wrapper.style.maxHeight = `${wrapper.scrollHeight + 52}px`;
        container.style.minHeight = `${height + wrapper.scrollHeight - 35}px`;
      }

      container.classList.toggle('expanded');
    });
  }

  private initSubscribeButton() {
    const subscribeButton = document.getElementById('artistSubscribeButton') as HTMLButtonElement;
    if (!subscribeButton) return;
    subscribeButton.addEventListener('click', async () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      if (!isAuthenticated) {
        confirmation.showConfirm({
          title: 'Оформить подписку',
          description: `Подписки на исполнителей доступны в вашем <b>Wave Music</b> аккаунте`,
          confirmText: 'Войти',
          cancelText: 'Закрыть',
          onConfirm: () => {
            router.navigate('/login')
          }
        });
        return;
      }

      const artistId = subscribeButton.dataset.artistId;
      const artistName = subscribeButton.dataset.artistName;
      const isSubscribed = subscribeButton.dataset.isSubscribed === 'true';
      if (!artistId) return;
      subscribeButton.disabled = true;

      try {
        await apiServise.toggleSubscribeToArtist(artistId, !isSubscribed);

        subscribeButton.dataset.isSubscribed = isSubscribed ? 'false' : 'true';
        if (isSubscribed) {
          subscribeButton.innerText = 'Подписаться';
          showInfoMessage(`Вы отписались от «${artistName || ''}»`);
        }
        else {
          subscribeButton.innerText = 'Отписаться';
          showInfoMessage(`Вы подписались на «${artistName || ''}»`);
        }
      } catch (error) {
        console.error('Failed to subscribe to artist:', error);
      } finally {
        subscribeButton.disabled = false;
      }
    });
  }
}
