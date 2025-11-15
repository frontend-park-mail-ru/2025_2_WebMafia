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

    try {
      const data = await apiServise.getMainPageData();
    } catch (error) {
      console.error('Failed to load main page data:', error);

      alert('Не удалось загрузить страницу создания проблемы.');
      return;
    }

    initScrollbar();
  }
}
