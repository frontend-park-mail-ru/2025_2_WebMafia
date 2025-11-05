import { apiServise } from '../../data.js';
import { router } from '../../routing.js';
import { header } from '../header/header.js';
import { sidebar } from '../sidebar/sidebar.js';
import { player } from '../player/player.js';
import { initScrollbar } from '../../scrollbar.js';
import { getValidImage } from '../../parsers.js';

export class ArtistTracksPage {
  async render(artistId) {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      router.navigate('/login');
      return;
    }

    Handlebars.registerHelper('numeration', function (value) {
      return parseInt(value) + 1;
    });

    let pageData = {
      isAuthenticated: true,
      tracks: [],
      artistName: '',
      nickname: 'Александр Константинов',
      letter: '',
    };

    try {
      const data = await apiServise.getArtistTracks(artistId);
      console.log(data, 'data');
      if (data) {
        pageData.artistName = data.artist.name;
        pageData.tracks = data.tracks.map((track) => ({
          id: track.id,
          name: track.title,
          plays: track.plays || 0,
          duration: track.duration_s,
          cover: getValidImage(`http://217.16.17.173:8099/avatars/albums/${track.album.avatar_url}`, 'default_album_avatar.png'),
        }));
      }
    } catch (error) {
      console.error('Failed to load main page data:', error.message);
      localStorage.removeItem('isAuthenticated');
      router.navigate('/login');
      return;
    }

    const contentTemplate = Handlebars.templates['artistTracksPage.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);

    header.render();
    sidebar.render();
    player.render();
    initScrollbar();
  }
}
