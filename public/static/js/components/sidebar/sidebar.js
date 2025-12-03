export class Sidebar {
  async render() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    let pageData = {
      isAuthenticated: isAuthenticated,
    };

    const contentTemplate = Handlebars.templates['sidebar.hbs'];
    const headerHTML = contentTemplate();

    const layout = document.getElementById('layout');
    if (layout && !document.getElementById('sidebar')) {
      layout.insertAdjacentHTML('afterbegin', headerHTML);
    }

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
