import { apiServise } from '../../data.js';
import { router } from '../../routing.js';

export class Sidebar {
  async render() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    const contentTemplate = Handlebars.templates['sidebar.hbs'];
    const headerHTML = contentTemplate({ isAuthenticated });
    
    const layout = document.getElementById('layout');
    if (section && !document.getElementById('sidebar')){
        section.insertAdjacentHTML('afterbegin', headerHTML)

    }

    this.activePath();
  }

   activePath() {
    document.querySelectorAll('.menuicon.main a').forEach((link) => {
      if (link.getAttribute('href') === window.location.pathname) {
        link.classList.add('active');
      }
    });
  }
}

export const sidebar = new Sidebar;
