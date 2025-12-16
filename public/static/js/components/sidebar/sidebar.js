import { images } from '@/assets';
import { playlistModal } from '@/components/playlist_modal/initPlaylistModal.js';
import { apiServise } from '@/data.js';
import { getValidImage, playsParser, tracksNumParser } from '@/parsers.js';
import { initScrollbar } from '@/scrollbar.js';

export class Sidebar {
  async render() {
    let pageData = {
      playlistImage: images.defaultPlaylistPath,
      library: [],
      playlists: [],
      artists: [],
      albums: [],
      showType: true,
    };
    const contentTemplate = Handlebars.templates['sidebar.hbs'];
    const sidebarHTML = contentTemplate();

    const layout = document.getElementById('layout');
    if (layout && !document.getElementById('sidebar')) {
      layout.insertAdjacentHTML('afterbegin', sidebarHTML);
    }

    if (localStorage.getItem('isAuthenticated') === 'true') {
      const data = await apiServise.getLibraryPageData();
      const item = {
        name: 'Избранное',
        image: images.likedTracksPath,
        created_at: new Date(),
        sub: tracksNumParser(data.favourite_tracks.length),
        href: 'playlist/LM',
        type: 'Плейлист',
      };
      pageData.library.push(item);
      pageData.playlists.push(item);
      data.artists.forEach((artist) => {
        const item = {
          id: artist.id,
          name: artist.name,
          image: getValidImage('artists/' + artist.avatar_url, images.defaultArtistPath),
          created_at: new Date(artist.created_at),
          type: 'Артист',
          sub: playsParser(artist.play_count || 0),
          href: 'artist/' + artist.id,
        };
        pageData.library.push(item);
        pageData.artists.push(item);
      });
      data.albums.forEach((album) => {
        const item = {
          id: album.id,
          name: album.title,
          image: getValidImage('albums/' + album.avatar_url, images.defaultAlbumPath),
          sub: album.artists ? album.artists[0].name : 'Unknown Artist',
          created_at: new Date(album.created_at),
          type: album.type,
          href: 'album/' + album.id,
        };
        pageData.library.push(item);
        pageData.albums.push(item);
      });
      data.playlists.forEach((playlist) => {
        if (!playlist.is_favorite) {
          const item = {
            id: playlist.id,
            name: playlist.title,
            description: playlist.description,
            default_avatar: 'default-playlist.png',
            image: getValidImage(playlist.avatar_url, images.defaultPlaylistPath),
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
    } else {
      console.log('failed to load lib Data');
    }

    document.getElementById('sidebar').outerHTML = contentTemplate(pageData);

    initScrollbar();
    this.activePath();
    this.createPlaylistButton();
  }

  activePath() {
    document.querySelectorAll('.menu-item').forEach((link) => {
      if (link.getAttribute('href') === window.location.pathname) link.classList.add('active');
      else link.classList.remove('active');
    });
  }

  createPlaylistButton() {
    const createButton = document.getElementById('sidebarCreatePlaylistButton');
    createButton.addEventListener('click', (e) => {
      e.preventDefault();
      playlistModal.openCreate();
    });
  }
}

export const sidebar = new Sidebar();
