import { router } from '../../routing.js';
<<<<<<< HEAD
import { initScrollbar } from '../../scrollbar.js';
=======
import { apiServise } from "../../data.js";
>>>>>>> hackaton

export class Support {
  async render() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      router.navigate('/login');
      return;
    }

    let pageData = {
      isAuthenticated: true,
<<<<<<< HEAD
      name: 'Музыка не работает',
      date: '15.11.2025',
=======
      open_tickets: [],
      closed_tickets: [],
>>>>>>> hackaton
    };

    try {
      const data = await apiServise.getUserTickets();
      data.tickets.forEach((ticket) => {
        const item = {
          name: ticket.title,
          date: ticket.updated_at,
          type: ticket.status,
        };

        if (item.type) {
          pageData.open_tickets.push(item);
        } else {
          pageData.closed_tickets.push(item);
        }
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
      localStorage.removeItem('isAuthenticated');
      router.navigate('/');
      return;
    }

    const tpl = Handlebars.templates['supportPage.hbs'];
    this.addEventListeners();

    return tpl(pageData);
  }

  addEventListeners() {
    const iframe = document.getElementById('iframeSupport');
    iframe.onload = function () {
      const overlay = parent.document.getElementById('supportOverlay');
      const closeBtn = iframe.contentWindow.document.getElementById('closeSupportButton');
      if (closeBtn && overlay) {
        closeBtn.addEventListener('click', () => {
          overlay.classList.remove('active');
        });
      }
    };
  }
}

export const support = new Support();
