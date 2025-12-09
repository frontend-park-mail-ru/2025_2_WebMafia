import { images } from '@/assets';

export class Sidebar {
  async render() {
    let pageData = {
      playlistImage: images.defaultPlaylistPath,
    };
    const contentTemplate = Handlebars.templates['sidebar.hbs'];
    const sidebarHTML = contentTemplate();

    const layout = document.getElementById('layout');
    if (layout && !document.getElementById('sidebar')) {
      layout.insertAdjacentHTML('afterbegin', sidebarHTML);
    }
    document.getElementById('sidebar').outerHTML = contentTemplate(pageData);

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
