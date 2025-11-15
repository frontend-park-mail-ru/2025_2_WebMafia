import { apiServise } from '../../data.js';
import { router } from '../../routing.js';
import { getValidImage } from '../../parsers.js';
import { player } from '../player/player.js';

export class Header {
  async render() {
    let pageData = {
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
    };

    const contentTemplate = Handlebars.templates['header.hbs'];
    const headerHTML = contentTemplate(pageData);

    const section = document.getElementById('section');
    if (section && !document.getElementById('header')) {
      section.insertAdjacentHTML('afterbegin', headerHTML);
    }

    if (!pageData.isAuthenticated) return;

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

    document.getElementById('header').outerHTML = contentTemplate(pageData);
    const iframeContent = document.getElementById('iframeContent');
    const contentTemplateProblem = Handlebars.templates['create_problem.hbs'];
    const htmlContentCreate = contentTemplateProblem(pageData);

    const contentTemplateProblemEdit = Handlebars.templates['edit_problem.hbs'];
    const htmlContentEdit = contentTemplateProblemEdit(pageData);

    iframeContent.srcdoc = htmlContentCreate;

    this.addEventListeners();
    this.profileDropdown();
  }

  addEventListeners() {
    const supportOverlay = document.getElementById('supportOverlay');
    const supportButton = document.getElementById('supportBtn');
    if (supportButton && supportOverlay) {
      supportButton.addEventListener('click', (e) => {
        e.preventDefault();
        supportOverlay.classList.add('active');
      });
    }
    if (supportOverlay) {
      supportOverlay.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target === supportOverlay) {
          supportOverlay.classList.remove('active');
        }
      });
    }

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
