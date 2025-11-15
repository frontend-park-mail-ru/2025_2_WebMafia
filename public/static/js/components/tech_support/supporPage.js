import { router } from '../../routing.js';
import { apiServise } from "../../data.js";

export class Support {
  async render() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      router.navigate('/login');
      return;
    }

    let pageData = {
      isAuthenticated: true,
      open_tickets: [],
      closed_tickets: [],
    };

    function timestampParser(timestamp) {
      const normalized = timestamp.replace(' ', 'T');

      const date = new Date(normalized);
      if (isNaN(date.getTime())) return '';

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return `${day}.${month}.${year}`;
    }

    try {
      const data = await apiServise.getUserTickets();
      data.forEach((ticket) => {
        const item = {
          name: ticket.title,
          date: timestampParser(ticket.updated_at),
          type: ticket.status,
        };

        if (item.type === 'Открыто') {
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
