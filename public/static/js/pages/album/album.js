import { apiServise } from '@/data.js';
import { router } from '@/routing.js';
import { header } from '@/components/header/header.js';
import { sidebar } from '@/components/sidebar/sidebar.js';
import { initScrollbar } from '@/scrollbar.js';
import { slider } from '@/slider.js';
import { playsParser, durationParser, getValidImage, totalDurationParser, tracksNumParser } from '@/parsers.js';
import { playTrack } from '@/playTrackBtn.js';
import { setPlayButtonsOnAuth } from '@/setPlayButtonsOnAuth.js';
import { playerOnlyOnPlay } from '@/playerOnlyOnplay.js';
import { likeTrackBtn } from '@/utils/likeTrack.js';
import { albumPlaylistButtons } from "@/utils/albumPlaylistButtons.js";
import { share } from "@/utils/shareBtn.js";
import { showInfoMessage } from "@/utils/showInfoMessage.js";

export class AlbumPage {
  async render(id) {
    let pageData = {
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
    };

    const contentTemplate = Handlebars.templates['album.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);
    document.querySelector('head title').textContent = 'Wave Music';

    try {
      const data = await apiServise.getAlbumPageData(id, pageData.isAuthenticated);
      const firstTrackId = data.tracks.length > 0 ? data.tracks[0].id : false;
      pageData = {
        id: data.album.id,
        title: data.album.title,
        type: data.album.type,
        is_liked: data.album.is_liked,
        year: data.album.release_date ? data.album.release_date.slice(0, 4) : '',
        cover: getValidImage('albums/' + data.album.avatar_url, 'default-album.png'),
        artist: {
          id: data.album.artists[0].id,
          name: data.album.artists[0].name,
          avatar: getValidImage('artists/' + data.album.artists[0].avatar_url, 'default-album.png'),
        },
        description: data.album.description,
        track_id: firstTrackId,
      };
      let totalDuration = 0;
      pageData.tracks = (data.tracks || []).map((track) => {
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
    } catch (error) {
      console.error('Failed to load album page data:', error);

      if (error.response && error.response.status === 404) {
        router.navigate('/not-found');
        return;
      }

      if (error.message && error.message.includes('Network')) {
        alert('Проблема с подключением. Попробуйте позже.');
        return;
      }

      alert('Не удалось загрузить страницу альбома.');
      return;
    }

    document.getElementById('app').innerHTML = contentTemplate(pageData);
    document.querySelector('head title').textContent = pageData.title;
    playerOnlyOnPlay();
    await Promise.all([header.render(), sidebar.render()]);
    slider.sliderFunction();
    initScrollbar();
    this.albumLikeButton();
    setPlayButtonsOnAuth();
    likeTrackBtn();
    playTrack();
    albumPlaylistButtons();
    share();
  }

  albumLikeButton() {
    const likeButton = document.getElementById('albumLikeButton');
    if (likeButton) {
      likeButton.addEventListener('click', async () => {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        if (!isAuthenticated) {
            router.navigate('/login');
            return;
        }

        const albumId = likeButton.dataset.albumId;
        const albumName = likeButton.dataset.albumName || 'Альбом';
        const likeIcon = likeButton.querySelector('.actions-item-svg');
        const likeText = likeButton.querySelector('.actions-item-text');

        const wasLiked = likeIcon.classList.contains('active');
        const newLikedState = !wasLiked;

        const renderState = (isLiked) => {
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
            showInfoMessage(`Альбом «${albumName}» добавлен в библиотеку`);
          } else {
            showInfoMessage(`Альбом «${albumName}» удалён из библиотеки`);
          }

        } catch (error) {
          console.error('Failed to like album:', error);
          renderState(wasLiked);
          showInfoMessage('Ошибка при обновлении библиотеки. Попробуйте позже.');
        } finally {
          likeButton.disabled = false;
        }
      });
    }
  }
}
