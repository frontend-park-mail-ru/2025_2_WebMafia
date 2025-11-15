import { apiServise } from '../../data.js';
import { router } from '../../routing.js';
import { initScrollbar } from '../../scrollbar.js';

export class CreateProblem {
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

    this.addEventListeners();
    initScrollbar();

    return contentTemplateProblem(pageData);
  }

  addEventListeners() {
    const iframeContent = document.getElementById('iframeSupport');
    iframeContent.onload = function () {
      try {
        const iframeDoc = iframeContent.contentWindow.document;
        const responseAll = apiServise.getProblems();
        console.log(responseAll);
        const buttonInIframe = iframeDoc.getElementById('specialButton');
        const title = iframeDoc.getElementById('support-subject');
        const description = iframeDoc.getElementById('support-description');
        const type = iframeDoc.getElementById('support-type');
        buttonInIframe.addEventListener('click', () => {
          const titleVal = title.value;
          const descriptionVal = description.value;
          const typeVal = type.value;
          const response = apiServise.sendProblem(titleVal, descriptionVal);

        });
      } catch (e) {
        console.error('Ошибка доступа к iframe:', e);
      }
    };
  }
}

export const createProblem = new CreateProblem();
