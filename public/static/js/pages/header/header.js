import { apiServise } from '../../data.js';
import { router } from '../../routing.js';

export class Header {
  async render() {
    let pageData = {
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
    };

    pageData.letter = pageData.nickname ? pageData.nickname[0] : '';

    const contentTemplate = Handlebars.templates['header.hbs'];
    const headerHTML = contentTemplate(pageData);

    const section = document.getElementById('section');
    if (section && !document.getElementById('header')) {
      section.insertAdjacentHTML('afterbegin', headerHTML);
    }

    if (!pageData.isAuthenticated) return;

    try {
      const data = await apiServise.getProfileData(localStorage.getItem('user_id'));
      pageData.avatar = data.avatar;
      pageData.nickname = data.login;
      pageData.avatar = data.avatar_url;
      pageData.letter = pageData.nickname ? pageData.nickname[0] : '';
    } catch (error) {
      console.error('Failed to load header page data:', error);

      if (error.response && error.response.status === 404) {
        router.navigate('/not-found');
        return;
      }

      if (error.message && error.message.includes('Network')) {
        alert('Проблема с подключением. Попробуйте позже.');
        return;
      }

      alert('Не удалось загрузить информацию о пользователе.');
      return;
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

    document.addEventListener('click', (e) => {
      const isClickInside = profileBtn.contains(e.target) || dropDownMenu.contains(e.target);

      if (!isClickInside) {
        dropDownMenu.classList.remove('show');
      }
    });
  }
}

export const header = new Header();
