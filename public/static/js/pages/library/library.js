import { apiServise } from '../../data.js';
import { router } from '../../routing.js';
import { header } from '../header/header.js';
import { sidebar } from '../sidebar/sidebar.js';
import { initScrollbar } from '../../scrollbar.js';
import {getValidImage, playsParser, tracksNumParser} from '../../parsers.js';
import { playTrack } from '../../playTrackBtn.js';
import { setPlayButtonsOnAuth } from '../../setPlayButtonsOnAuth.js';

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
    };

    const contentTemplate = Handlebars.templates['library.hbs'];
    document.getElementById('app').innerHTML = contentTemplate();
    document.querySelector('head title').textContent = 'Библиотека';

    try {
      const data = await apiServise.getLibraryPageData();
      pageData.artists = data.artists;
      pageData.albums = data.albums;
      pageData.playlists = data.playlists.slice(0, -1);
      const liked_tracks = data.playlists[data.playlists.length - 1];
      pageData.liked_tracks = {
        sub: tracksNumParser(liked_tracks.tracks.length),
        href: 'playlist/' + liked_tracks.id,
      };
      pageData.artists.forEach((artist) => {
        pageData.library.push({
          name: artist.name,
          default_avatar: 'default-artist.png',
          image: getValidImage('artists/' + artist.avatar_url, 'default-artist.png'),
          created_at: new Date(artist.created_at),
          type: 'Артист',
          sub: playsParser(artist.play_count),
          href: 'artist/' + artist.id,
        });
      });
      pageData.albums.forEach((album) => {
        pageData.library.push({
          name: album.title,
          default_avatar: 'default-album.png',
          image: getValidImage('albums/' + album.avatar_url, 'default-album.png'),
          sub: album.artists ? album.artists[0].name : 'Unknown Artist',
          created_at: new Date(album.created_at),
          type: album.type,
          href: 'album/' + album.id,
        });
      });
      pageData.playlists.forEach((playlist) => {
        pageData.library.push({
          name: playlist.title,
          default_avatar: 'default-album.png',
          image: getValidImage('playlists/' + playlist.avatar_url, 'default-album.png'),
          created_at: new Date(playlist.created_at),
          sub: tracksNumParser(playlist.tracks.length),
          type: 'Плейлист',
          href: 'playlist/' + playlist.id,
        });
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

    await Promise.all([header.render(), sidebar.render()]);

    initScrollbar();
    playTrack();
    setPlayButtonsOnAuth();
  }
}
