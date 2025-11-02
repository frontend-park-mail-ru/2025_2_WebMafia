import { apiServise } from '../../data.js';
import { router } from '../../routing.js';
import { player } from '../player/player.js';

export class Header {
  async render() {
    const contentTemplate = Handlebars.templates['header.hbs'];
    const headerHTML = contentTemplate();

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
          localStorage.removeItem('currentTrackId');
          localStorage.removeItem('isPlaying');
          localStorage.removeItem('playTime');
          localStorage.removeItem('volume');
          await player.destroy();
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
