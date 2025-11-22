import { apiServise } from '../../data.js';
import { router } from '../../routing.js';
import { getValidImage } from '../../parsers.js';
import { player } from '../player/player.js';

export class Header {
  async render() {
    let pageData = {
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
    };

    // if (!pageData.isAuthenticated) return;
    if (pageData.isAuthenticated) {
      try {
        const data = await apiServise.getProfileData();
        pageData.avatar = data.AvatarURL ? getValidImage(data.AvatarURL) : data.AvatarURL;
        pageData.nickname = data.Login;
        pageData.letter = pageData.nickname ? pageData.nickname[0].toUpperCase() : '';
      } catch (error) {
        console.error('Failed to load user data:', error);
        localStorage.removeItem('isAuthenticated');
        router.navigate('/');
        return;
      }
    }

    const contentTemplate = Handlebars.templates['header.hbs'];
    const headerHTML = contentTemplate(pageData);

    const section = document.getElementById('section');
    const headerElement = document.getElementById('header');
    if (headerElement) {
      headerElement.outerHTML = contentTemplate(pageData);
    } else {
      if (section && !document.getElementById('header')) {
        section.insertAdjacentHTML('afterbegin', headerHTML);
      }
    }

    // document.getElementById('header').outerHTML = contentTemplate(pageData);

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
          localStorage.removeItem('playerContext');
          player.destroy();
          router.navigate('/');
        }
      });
    }
    const searchWindow = document.getElementById('searchInput');
    if (searchWindow) {
      searchWindow.addEventListener('keydown', async (e) => {
        if (e.code === 'Enter' || e.key === 'Enter') {
          e.preventDefault();
          const searchVal = searchWindow.value;
          if (searchVal === '') return;
          router.navigate(`/search/${searchVal}`);
        }
      });
    }

    const searchToggle = document.getElementById('searchToggle');
    const searchContainer = document.getElementById('header-search-container');
    const searchInput = document.getElementById('searchInput');
    const inputCloseButton = document.querySelector('.input-close-button');
    const headLeft = document.querySelector('.head-left');

    searchToggle.addEventListener('click', (e) => {
      e.preventDefault();

      setTimeout(() => {
        searchToggle.classList.add('hidden');
        headLeft.style.visibility = 'hidden';
        searchContainer.classList.add('active');
      }, 100)

      setTimeout(() => searchInput.focus(), 200);
    });

    inputCloseButton.addEventListener('click', (e) => {
      e.preventDefault();

      searchContainer.classList.remove('active');
      searchToggle.classList.remove('hidden');
      headLeft.style.visibility = 'visible';
    });
  }

  profileDropdown() {
    const profileBtn = document.querySelector('.profile-btn');
    const dropDownMenu = document.querySelector('.dropdown-menu');

    if (profileBtn && dropDownMenu) {
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
}

export const header = new Header();
