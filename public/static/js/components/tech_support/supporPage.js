import { router } from '../../routing.js';
import { initScrollbar } from "../../scrollbar.js";

export class Support {
  async render() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      router.navigate('/login');
      return;
    }

    let pageData = {
      isAuthenticated: true,
      name: "Музыка не работает",
      date: "15.11.2025",
    };

    const tpl = Handlebars.templates['supportPage.hbs'];
    this.addEventListeners();

    return tpl(pageData);
  }

  addEventListeners() {
    const iframe = document.getElementById('iframeSupport');
    iframe.onload = function() {
      const overlay = parent.document.getElementById('supportOverlay');
      const closeBtn = iframe.contentWindow.document.getElementById('closeSupportButton');
      if (closeBtn && overlay) {
        closeBtn.addEventListener('click', () => {
          overlay.classList.remove('active');
        });
      }
    }
  }
}

export const support = new Support();
