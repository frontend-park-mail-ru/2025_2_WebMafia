import { router } from '../../routing.js';
import { apiServise } from '../../data.js';
import { initPasswordShowing } from '../../eye.js';
import { initScrollbar } from '../../scrollbar.js';
import { durationParser, getValidImage, playsParser } from '../../parsers.js';
import { sidebar } from '../sidebar/sidebar.js';
import { slider } from '../../slider.js';
import { player } from '../player/player.js';
import { header } from '../header/header.js';

export class ProfilePage {
  async render() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      router.navigate('/login');
      return;
    }

    let pageData = {
      isAuthenticated: true,
      top_artists: [],
      top_tracks: [],
      recent: [],
    };

    const contentTemplate = Handlebars.templates['profilePage.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);

    header.render();
    this.addEventListeners();
    initPasswordShowing();
    initScrollbar();
  }

  addEventListeners() {
    const editProfileButton = document.getElementById('editProfileBtn');
    const editProfileOverlay = document.getElementById('editProfileOverlay');

    if (editProfileButton && editProfileOverlay) {
      editProfileButton.addEventListener('click', (e) => {
        e.preventDefault();
        editProfileOverlay.classList.add('active');
      });
    }

    const closeEditButton = document.getElementById('closeEditButton');
    if (closeEditButton && editProfileOverlay) {
      closeEditButton.addEventListener('click', (e) => {
        e.preventDefault();
        editProfileOverlay.classList.remove('active');
      });
    }

    if (editProfileOverlay) {
      editProfileOverlay.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target === editProfileOverlay) {
          editProfileOverlay.classList.remove('active');
        }
      });
    }

    const setAvatarButton = document.getElementById('setAvatarButton');
    if (setAvatarButton) {
      setAvatarButton.addEventListener('click', async (e) => {
        e.preventDefault();

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.click();

        input.addEventListener('change', async () => {
          const file = input.files[0];
          if (!file) return;

          if (file.size > 5 * 1024 * 1024) {
            alert('Файл слишком большой (максимум 5МБ)');
            return;
          }

          try {
            const response = await apiServise.uploadAvatar(file);
            const newAvatarUrl = getValidImage(response.avatar_url);

            const avatarContainers = document.querySelectorAll('.user-avatar');

            avatarContainers.forEach((container) => {
              const existingImg = container.querySelector('img');
              if (existingImg) {
                existingImg.src = newAvatarUrl;
              } else {
                container.innerHTML = `<img src="${newAvatarUrl}" alt="Ваш аватар" class="profile-image" />`;
              }
            });
          } catch (err) {
            console.error('Ошибка загрузки аватара:', err);
            alert('Не удалось загрузить аватар.');
          }
        });
      });
    }
  }
}
