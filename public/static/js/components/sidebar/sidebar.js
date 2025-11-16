export class Sidebar {
  async render() {
    const contentTemplate = Handlebars.templates['sidebar.hbs'];
    const headerHTML = contentTemplate();

    const layout = document.getElementById('layout');
    if (layout && !document.getElementById('sidebar')) {
      layout.insertAdjacentHTML('afterbegin', headerHTML);
    }

    this.activePath();
  }

  activePath() {
    document.querySelectorAll('.menu-item a').forEach((link) => {
      const menuItem = link.closest('.menu-item');
      if (link.getAttribute('href') === window.location.pathname) {
        link.classList.add('active');
        menuItem.classList.add('active');
      } else {
        link.classList.remove('active');
        menuItem.classList.remove('active');
      }
    });
  }
}

export const sidebar = new Sidebar();
