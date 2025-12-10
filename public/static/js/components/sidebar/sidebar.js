import { images } from '@/assets';
import { playlistModal } from "@/components/playlist_modal/initPlaylistModal.js";

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
    this.createPlaylistButton();
  }

  activePath() {
    document.querySelectorAll('.menu-item').forEach((link) => {
      if (link.getAttribute('href') === window.location.pathname) link.classList.add('active');
      else link.classList.remove('active');
    });
  }

  createPlaylistButton() {
    const createButton = document.getElementById('sidebarCreatePlaylistButton');
    createButton.addEventListener('click', (e) => {
        e.preventDefault();
        playlistModal.openCreate();
    });
  }
}

export const sidebar = new Sidebar();
