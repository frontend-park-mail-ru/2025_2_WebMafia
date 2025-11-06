import { apiServise } from '../../data.js';
import { router } from '../../routing.js';
import { header } from '../header/header.js';
import { sidebar } from '../sidebar/sidebar.js';
import { initScrollbar } from '../../scrollbar.js';
import { getValidImage } from '../../parsers.js';
import { playTrack } from '../../playTrackBtn.js';
import { setPlayButtonsOnAuth } from '../../setPlayButtonsOnAuth.js';

export class ArtistAlbumsPage {
  async render(artistId) {
    let pageData = {
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
      albums: [],
    };

    const contentTemplate = Handlebars.templates['artistAlbumsPage.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);

    try {
      const data = await apiServise.getArtistAlbums(artistId);
      pageData.artistName = data.artist ? data.artist.name : 'Unknown Artist';
      if (data) {
        data.albums.forEach((album) => {
          const item = {
            id: album.id,
            name: album.title,
            cover: getValidImage('albums/' + album.avatar_url, 'default-album.png'),
            year: album.release_date ? album.release_date.slice(0, 4) : '',
            type: album.type,
          };

          if (album.type && album.type === 'Альбом') {
            pageData.albums.push(item);
          }
        });
      }
    } catch (error) {
      console.error('Failed to load artist albums page data:', error);

      if (error.response && error.response.status === 404) {
        router.navigate('/not-found');
        return;
      }

      if (error.message && error.message.includes('Network')) {
        alert('Проблема с подключением. Попробуйте позже.');
        return;
      }

      alert('Не удалось загрузить страницу альбомов исполнителя.');
      return;
    }

    document.getElementById('app').innerHTML = contentTemplate(pageData);

    await Promise.all([header.render(), sidebar.render()]);

    initScrollbar();
    playTrack();
    setPlayButtonsOnAuth();
  }
}
