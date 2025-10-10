export class Sidebar {
  async render() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    const contentTemplate = Handlebars.templates['sidebar.hbs'];
    const headerHTML = contentTemplate({ isAuthenticated });

    const layout = document.getElementById('layout');
    if (layout && !document.getElementById('sidebar')) {
      layout.insertAdjacentHTML('afterbegin', headerHTML);
    }

    this.activePath();
  }

  activePath() {
    document.querySelectorAll('.menu-item a').forEach((link) => {
      const menuItem = document.querySelector('.menu-item');
      if (link.getAttribute('href') === window.location.pathname) {
        link.classList.add('active');
        menuItem.classList.toggle('active');
      }
    });
  }
}

export const sidebar = new Sidebar();
