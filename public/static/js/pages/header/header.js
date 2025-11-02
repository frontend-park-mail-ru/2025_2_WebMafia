import { apiServise } from '../../data.js';
import { router } from '../../routing.js';

export class Header {
  async render() {
    let pageData = {
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
      nickname: 'Александр Константинов',
      letter: '',
    };

    pageData.letter = pageData.nickname ? pageData.nickname[0] : '';

    const contentTemplate = Handlebars.templates['header.hbs'];
    const headerHTML = contentTemplate(pageData);

    const section = document.getElementById('section');
    if (section && !document.getElementById('header')) {
      section.insertAdjacentHTML('afterbegin', headerHTML);
    }
    this.addEventListeners();
    this.profileDropdown();
  }

  addEventListeners() {
    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
      logoutButton.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          await apiServise.logoutUser();
        } catch (error) {
          console.error('Logout request failed:', error.message);
        } finally {
          localStorage.removeItem('isAuthenticated');
          router.navigate('/login');
        }
      });
    }
  }

  profileDropdown() {
    const profileBtn = document.querySelector('.profile-btn');
    const dropDownMenu = document.querySelector('.dropdown-menu');

    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropDownMenu.classList.toggle('show');
    });

    profileBtn.addEventListener('click', (e) => {
      if (!profileBtn.contains(e.target) && !dropDownMenu.contains(e.target)) {
        dropDownMenu.classList.remove('show');
      }
    });
  }
}

export const header = new Header();
