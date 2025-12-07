import { apiServise } from '@/data.js';
import { router } from '@/routing.js';
import { header } from '@/components/header/header.js';
import { sidebar } from '@/components/sidebar/sidebar.js';
import { initScrollbar } from '@/scrollbar.js';
import { getValidImage, playsParser, tracksNumParser } from '@/parsers.js';
import { playTrack } from '@/playTrackBtn.js';
import { setPlayButtonsOnAuth } from '@/setPlayButtonsOnAuth.js';
import { playerOnlyOnPlay } from '@/playerOnlyOnplay.js';
import { FormValidator } from '@/validation.js';
import { createPlaylis } from '@/utils/initCreatePlaylist';

export class LibraryPage {
  async render() {
    let pageData = {
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
      library: [],
      playlists: [],
      artists: [],
      albums: [],
      showType: true,
    };

    const contentTemplate = Handlebars.templates['library.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);

    if (!pageData.isAuthenticated) {
      await Promise.all([header.render(), sidebar.render()]);
      return;
    }

    const gridTemplate = Handlebars.templates['libraryGrid.hbs'];
    document.querySelector('head title').textContent = 'Wave Music';

    try {
      const data = await apiServise.getLibraryPageData();
      const item = {
        name: 'Понравившиеся треки',
        image: 'static/img/liked_tracks.png',
        created_at: new Date(),
        sub: data.favourite.tracks ? tracksNumParser(data.favourite.tracks.length) : '0 треков',
        href: 'playlist/' + data.favourite.id,
        type: 'Плейлист',
      };
      pageData.library.push(item);
      pageData.playlists.push(item);
      // data.artists.forEach((artist) => {
      //   const item = {
      //     name: artist.name,
      //     default_avatar: 'default-artist.png',
      //     image: getValidImage('artists/' + artist.avatar_url, 'default-artist.png'),
      //     created_at: new Date(artist.created_at),
      //     type: 'Артист',
      //     sub: playsParser(artist.play_count),
      //     href: 'artist/' + artist.id,
      //   };
      //   pageData.library.push(item);
      //   pageData.artists.push(item);
      // });
      // data.albums.forEach((album) => {
      //   const item = {
      //     name: album.title,
      //     default_avatar: 'default-album.png',
      //     image: getValidImage('albums/' + album.avatar_url, 'default-album.png'),
      //     sub: album.artists ? album.artists[0].name : 'Unknown Artist',
      //     created_at: new Date(album.created_at),
      //     type: album.type,
      //     href: 'album/' + album.id,
      //   };
      //   pageData.library.push(item);
      //   pageData.albums.push(item);
      // });
      data.playlists.forEach((playlist) => {
        if (!playlist.is_favorite) {
          const item = {
            name: playlist.title,
            default_avatar: 'default-playlist.png',
            image: getValidImage(playlist.avatar_url, 'default-album.png'),
            created_at: new Date(playlist.created_at),
            sub: playlist.tracks ? tracksNumParser(playlist.tracks.length) : '0 треков',
            type: 'Плейлист',
            href: 'playlist/' + playlist.id,
          };
          pageData.library.push(item);
          pageData.playlists.push(item);
        }
      });
      pageData.library.sort((a, b) => b.created_at - a.created_at);
    } catch (error) {
      console.error('Failed to load library page data:', error);

      if (error.response && error.response.status === 404) {
        router.navigate('/not-found');
        return;
      }

      if (error.message && error.message.includes('Network')) {
        alert('Проблема с подключением. Попробуйте позже.');
        return;
      }

      alert('Не удалось загрузить страницу библиотеки.');
      return;
    }

    document.getElementById('app').innerHTML = contentTemplate(pageData);
    document.querySelector('.grid-layout').innerHTML = gridTemplate(pageData);
    playerOnlyOnPlay();

    await Promise.all([header.render(), sidebar.render()]);

    createPlaylis();

    initScrollbar();
    playTrack();
    setPlayButtonsOnAuth();
    this.addEventListeners(pageData);
  }

  addEventListeners(data) {
    const searchToggle = document.getElementById('librarySearchToggle');
    const libraryHeaderContainer = document.querySelector('.library-header-container');
    const titleName = document.querySelector('.title-name');
    const createPlaylistToggle = document.querySelector('.create-playlist-toggle');
    const rightSearchContainer = document.querySelector('.library-search-container');
    const closeButton = rightSearchContainer.querySelector('.input-close-button');
    const originalParent = rightSearchContainer.parentElement;

    searchToggle.addEventListener('click', (e) => {
      e.preventDefault();

      titleName.classList.add('hidden');
      searchToggle.classList.add('hidden');
      createPlaylistToggle.classList.add('hidden');

      libraryHeaderContainer.appendChild(rightSearchContainer);

      rightSearchContainer.classList.remove('active');
      requestAnimationFrame(() => {
        rightSearchContainer.classList.add('active');
      });

      const input = rightSearchContainer.querySelector('#librarySearchInput');
      setTimeout(() => input.focus(), 200);
    });

    closeButton.addEventListener('click', (e) => {
      e.preventDefault();

      rightSearchContainer.classList.remove('active');

      titleName.classList.remove('hidden');
      searchToggle.classList.remove('hidden');
      createPlaylistToggle.classList.remove('hidden');

      setTimeout(() => originalParent.appendChild(rightSearchContainer), 200);
    });

    const container = document.querySelector('.sort-buttons');
    const buttons = container.querySelectorAll('button');
    const disableSort = document.getElementById('disableSort');
    const gridTemplate = Handlebars.templates['libraryGrid.hbs'];

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

          document.querySelector('.grid-layout').innerHTML = gridTemplate(data);
        } else if (isActivating) {
          button.classList.remove('secondary-button');
          button.classList.add('primary-button');

          disableSort.style.display = 'flex';

          buttons.forEach((b) => {
            if (b !== button && b.id !== 'disableSort') b.style.display = 'none';
          });

          const dataName = button.dataset.name;
          const pageData = {
            library: data[dataName] || [],
            showType: false,
          };

          document.querySelector('.grid-layout').innerHTML = gridTemplate(pageData);
        } else {
          buttons.forEach((b) => {
            b.style.display = '';
            b.classList.remove('primary-button');
            b.classList.add('secondary-button');
          });

          disableSort.style.display = 'none';

          document.querySelector('.grid-layout').innerHTML = gridTemplate(data);
        }
      });
    });
  }
}
