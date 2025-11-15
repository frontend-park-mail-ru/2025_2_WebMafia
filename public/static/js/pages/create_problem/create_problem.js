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
    const contentTemplateProblem = Handlebars.templates['create_problem.hbs'];

    const iframeContent = document.getElementById('iframeContent');

    const htmlContentCreate = contentTemplateProblem(pageData);

    iframeContent.srcdoc = htmlContentCreate;

    iframeContent.onload = function () {
      try {
        const iframeDoc = iframeContent.contentWindow.document;
        const buttonInIframe = iframeDoc.getElementById('specialButton');
        console.log('Кнопка найдена!', buttonInIframe);
        buttonInIframe.addEventListener('click', () => {
          console.log('ashdjkdaskjahads');
        });
      } catch (e) {
        console.error('Ошибка доступа к iframe:', e);
      }
    };
    initScrollbar();
  }
}
