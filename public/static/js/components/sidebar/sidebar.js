import { getStaticImagePath } from '../../utils/getStaticImages.js';

export class Sidebar {
  async render() {
    const contentTemplate = Handlebars.templates['sidebar.hbs'];
    const headerHTML = contentTemplate();

    const layout = document.getElementById('layout');
    if (layout && !document.getElementById('sidebar')) {
      layout.insertAdjacentHTML('afterbegin', headerHTML);
    }
    getStaticImagePath();
    this.activePath();
  }

  activePath() {
    document.querySelectorAll('.menu-item').forEach((link) => {
      if (link.getAttribute('href') === window.location.pathname) link.classList.add('active');
      else link.classList.remove('active');
    });
  }
}

export const sidebar = new Sidebar();
