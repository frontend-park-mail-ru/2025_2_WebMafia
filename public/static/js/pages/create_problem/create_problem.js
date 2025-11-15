import { apiServise } from '../../data.js';
import { initScrollbar } from '../../scrollbar';

export class createProblem {
  async render() {
    let pageData = {
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
      artists: [],
      albums: [],
      tracks: [],
    };

    const contentTemplate = Handlebars.templates['create_problem.hbs'];

    try {
      const data = await apiServise.getMainPageData();
      //   pageData.artists = (data.artists || []).map((artist) => ({
      //     id: artist.id,
      //     name: artist.name,
      //     listeners: playsParser(artist.play_count || 0),
      //     image: getValidImage('artists/' + artist.avatar_url, 'default-artist.png'),
      //   }));
    } catch (error) {
      console.error('Failed to load main page data:', error);

      alert('Не удалось загрузить страницу создания проблемы.');
      return;
    }
    document.getElementById('layerOverlay').innerHTML = contentTemplate(pageData);

    initScrollbar();
  }
}
