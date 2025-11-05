import { apiServise } from '../../data.js';
import { router } from '../../routing.js';
import { header } from '../header/header.js';
import { sidebar } from '../sidebar/sidebar.js';
import { player } from '../player/player.js';
import { initScrollbar } from '../../scrollbar.js';
import { getValidImage } from '../../parsers.js';
import { playTrack } from '../../playTrackBtn.js';

export class ArtistAlbumsPage {
  async render(artistId) {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      router.navigate('/login');
      return;
    }

    let pageData = {
      isAuthenticated: true,
      albums: [],
      artistName: '',
      nickname: 'Александр Константинов',
      letter: '',
    };

    try {
      const data = await apiServise.getArtistAlbums(artistId);
      console.log(data);
      if (data) {
        pageData.artistName = data.artist.name;
        pageData.albums = data.albums.map((album) => ({
          id: album.id,
          name: album.title,
          cover: getValidImage(`http://217.16.17.173:8099/avatars/albums/${album.avatar_url}`, 'default_album_avatar.png'),
        }));
      }
    } catch (error) {
      console.error('Failed to load main page data:', error.message);
      localStorage.removeItem('isAuthenticated');
      router.navigate('/login');
      return;
    }

    const contentTemplate = Handlebars.templates['artistAlbumsPage.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);

    header.render();
    sidebar.render();
    initScrollbar();
    playTrack();
  }
}
