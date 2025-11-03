import { apiServise } from '../../data.js';
import { router } from '../../routing.js';
import { header } from '../header/header.js';
import { sidebar } from '../sidebar/sidebar.js';
import { player } from '../player/player.js';
import { initScrollbar } from '../../scrollbar.js';

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

    const pageData = await apiServise.getArtistTracks(artistId);

    const contentTemplate = Handlebars.templates['artistTracksPage.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);

    header.render();
    sidebar.render();
    player.render();
    initScrollbar();
  }
}