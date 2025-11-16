import { apiServise } from '../../data.js';
import { router } from '../../routing.js';
import { header } from '../header/header.js';
import { sidebar } from '../sidebar/sidebar.js';
import { initScrollbar } from '../../scrollbar.js';
import {getValidImage, playsParser, tracksNumParser} from '../../parsers.js';
import { playTrack } from '../../playTrackBtn.js';
import { setPlayButtonsOnAuth } from '../../setPlayButtonsOnAuth.js';
import { playerOnlyOnPlay } from '../../playerOnlyOnplay.js';

export class LibraryPage {
  async render() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      router.navigate('/login');
      return;
    }

    let pageData = {
      isAuthenticated: true,
      library: [],
      playlists: [],
      artists: [],
      albums: [],
      showType: true,
    };

    const contentTemplate = Handlebars.templates['library.hbs'];
    document.getElementById('app').innerHTML = contentTemplate();
    const gridTemplate = Handlebars.templates['libraryGrid.hbs'];
    document.querySelector('.grid-layout').innerHTML = gridTemplate();
    document.querySelector('head title').textContent = 'Библиотека';

    try {
      const data = await apiServise.getLibraryPageData();
      const tracks = data.tracks;
      const item = {
        name: 'Понравившиеся треки',
        image: 'static/img/liked_tracks.png',
        created_at: new Date(),
        sub: tracksNumParser(tracks.tracks.length),
        href: 'playlist/' + tracks.id,
        type: 'Плейлист',
      };
      pageData.library.push(item);
      pageData.playlists.push(item);
      data.artists.forEach((artist) => {
        const item = {
          name: artist.name,
          default_avatar: 'default-artist.png',
          image: getValidImage('artists/' + artist.avatar_url, 'default-artist.png'),
          created_at: new Date(artist.created_at),
          type: 'Артист',
          sub: playsParser(artist.play_count),
          href: 'artist/' + artist.id,
        }
        pageData.library.push(item);
        pageData.artists.push(item);
      });
      data.albums.forEach((album) => {
        const item = {
          name: album.title,
          default_avatar: 'default-album.png',
          image: getValidImage('albums/' + album.avatar_url, 'default-album.png'),
          sub: album.artists ? album.artists[0].name : 'Unknown Artist',
          created_at: new Date(album.created_at),
          type: album.type,
          href: 'album/' + album.id,
        }
        pageData.library.push(item);
        pageData.albums.push(item);
      });
      data.playlists.forEach((playlist) => {
        const item = {
          name: playlist.title,
          default_avatar: 'default-album.png',
          image: getValidImage('playlists/' + playlist.avatar_url, 'default-album.png'),
          created_at: new Date(playlist.created_at),
          sub: tracksNumParser(playlist.tracks.length),
          type: 'Плейлист',
          href: 'playlist/' + playlist.id,
        }
        pageData.library.push(item);
        pageData.playlists.push(item);
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

    initScrollbar();
    playTrack();
    setPlayButtonsOnAuth();
    this.addEventListeners(pageData);
  }

  addEventListeners(data) {
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
