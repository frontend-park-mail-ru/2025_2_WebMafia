import { playlistModal } from "@/components/modal/playlistModal.ts";

class Sidebar {
  private container!: HTMLElement;

  public async render() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    if (sidebar.innerHTML.trim() !== '') {
      this.activePath();
      return;
    }

    this.container = sidebar;

    const contentTemplate = Handlebars.templates['sidebar.hbs'];
    this.container.innerHTML = contentTemplate({});

    this.activePath();
    this.addMenuListeners();
    this.createPlaylistButton();
  }

  private activePath() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.menu-item').forEach((link) => {
      const href = link.getAttribute('href');
      if (href === currentPath) {
        link.classList.add('active');
      }
      else {
        link.classList.remove('active');
      }
    });
  }

  private addMenuListeners() {
    this.container.addEventListener('click', (e) => {
      const link = (e.target as HTMLElement).closest('.menu-item');
      if (!link) return;
      document.querySelectorAll('.menu-item').forEach((item) => {
        item.classList.remove('active');
      });
      link.classList.add('active');
    });
  }

  private createPlaylistButton() {
    const createButton = document.getElementById('sidebarCreatePlaylistButton');
    if (!createButton) return;
    createButton.addEventListener('click', (e) => {
        e.preventDefault();
        playlistModal.open({ isEdit: false });
    });
  }
}

export const sidebar = new Sidebar();
