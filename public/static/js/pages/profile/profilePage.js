import { router } from '../../routing.js';
import { apiServise } from '../../data.js';
import { initPasswordShowing } from '../../eye.js';
import { initScrollbar } from '../../scrollbar.js';
import { player } from '../player/player.js';
import { header } from '../header/header.js';

export class ProfilePage {
  async render() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      router.navigate('/login');
      return;
    }

    this.pageData = {
      isAuthenticated: true,
      top_artists: [],
      top_tracks: [],
      recent_tracks: [],
      password: '',
      nickname: '',
      id: 'mock-user-123',
      login: 'Александр Константинов',
      email: 'mock.user@example.com',
      avatar: 'static/img/default_artist_avatar.png', // Начальный аватар-заглушка
    };

    if (this.pageData.avatar === '') {
      this.pageData.avatar === 'static/img/default_artist_avatar.png';
    }

    // try {
    //   const data = await apiServise.getUserData();
    //   console.log(data);
    // } catch (error) {
    //   console.error('Failed to load main page data:', error);

    //   if (error.response && error.response.status === 404) {
    //     router.navigate('/not-found');
    //     return;
    //   }

    //   if (error.message && error.message.includes('Network')) {
    //     alert('Проблема с подключением. Попробуйте позже.');
    //     return;
    //   }

    //   alert('Не удалось загрузить главную страницу.');
    //   return;
    // }

    /*try {
      const data = await apiServise.getProfilePageData();
      pageData.artists = (data.artists || []).map((artist) => ({
        id: artist.artist_id,
        name: artist.name,
        image: `static/img/${artist.avatar_url || 'default-artist.png'}`,
      }));
      pageData.tracks = (data.tracks || []).map((track) => ({
        id: track.track_id,
        name: track.title,
        image: `static/img/${track.album.avatar_url || 'default-album.png'}`,
        artists: track.artists,
      }));
      pageData.recently = (data.recently || []).map((track) => ({
        id: track.track_id,
        name: track.title,
        image: `static/img/${track.album.avatar_url || 'default-album.png'}`,
        artists: track.artists,
      }));
    } catch (error) {
      console.error('Failed to load main page data:', error.message);
      localStorage.removeItem('isAuthenticated');
      router.navigate('/login');
      return;
    }*/

    const contentTemplate = Handlebars.templates['profilePage.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(this.pageData);

    header.render();
    this.addEventListeners();
    initPasswordShowing();
    initScrollbar();
  }

  addEventListeners() {
    const editProfileButton = document.getElementById('editProfileBtn');
    const editProfileOverlay = document.getElementById('editProfileOverlay');
    const closeEditButton = document.getElementById('closeEditButton');

    if (editProfileButton && editProfileOverlay) {
      editProfileButton.addEventListener('click', (e) => {
        e.preventDefault();
        editProfileOverlay.classList.add('active');
      });
    }

    if (closeEditButton && editProfileOverlay) {
      closeEditButton.addEventListener('click', (e) => {
        e.preventDefault();
        editProfileOverlay.classList.remove('active');
      });
    }

    if (editProfileOverlay) {
      editProfileOverlay.addEventListener('click', (e) => {
        if (e.target === editProfileOverlay) {
          e.preventDefault();
          editProfileOverlay.classList.remove('active');
        }
      });
    }

    const setAvatarButton = document.getElementById('setAvatarButton');
    const avatarInput = document.getElementById('avatarInput');
    // const avatarPreviewInModal = document.querySelector('.edit-avatar-placement img');
    // const defaultAvatarInModal = document.querySelector('.edit-avatar-placement .default-avatar');
    const saveProfileChangesButton = document.getElementById('saveProfileChangesButton');
    const deleteAvatar = document.getElementById('deleteAvatarButton');

    // 1. Открываем диалог выбора файла по клику на кнопку "Выбрать фото"
    if (setAvatarButton) {
      setAvatarButton.addEventListener('click', (e) => {
        e.preventDefault();
        avatarInput.click();
      });
    }

    if (avatarInput) {
      avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const avatarPreviewInModal = document.querySelector('.edit-avatar-placement img');
            if (avatarPreviewInModal) avatarPreviewInModal.src = event.target.result;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (saveProfileChangesButton) {
      saveProfileChangesButton.addEventListener('click', (e) => {
        e.preventDefault();
        const file = avatarInput.files[0];
        const generalError = document.getElementById('generalError');
        generalError.textContent = '';

        if (!file) {
          generalError.textContent = 'Пожалуйста, выберите файл.';
          return;
        }

        saveProfileChangesButton.disabled = true;
        saveProfileChangesButton.textContent = 'Сохранение...';

        // --- ИМИТАЦИЯ ЗАГРУЗКИ ---
        // Мы используем setTimeout, чтобы создать искусственную задержку,
        // как будто файл действительно куда-то загружается.
        setTimeout(() => {
          // 1. Создаем временную локальную ссылку на выбранный файл.
          // Эта ссылка будет работать до закрытия вкладки.
          const newAvatarUrl = URL.createObjectURL(file);

          this.pageData.avatar = newAvatarUrl;

          const mainProfileAvatar = document.querySelector('.profile-avatar img');
          const avatarPreviewInModal = document.querySelector('.edit-avatar-placement img');
          const avatarHeader = document.querySelector('.profile-avatar-header img');

          if (mainProfileAvatar) mainProfileAvatar.src = newAvatarUrl;
          if (avatarPreviewInModal) avatarPreviewInModal.src = newAvatarUrl;
          if (avatarHeader) avatarHeader.src = newAvatarUrl;

          saveProfileChangesButton.disabled = false;
          saveProfileChangesButton.textContent = 'Сохранить изменения';
          avatarInput.value = '';

          if (editProfileOverlay) {
            editProfileOverlay.classList.remove('active');
          }
        }, 1000);
      });
    }

    if (deleteAvatar) {
      deleteAvatar.addEventListener('click', (e) => {
        e.preventDefault();
        this.pageData.avatar = 'static/img/default_artist_avatar.png';
        const avatarPreviewInModal = document.querySelector('.edit-avatar-placement img');
        if (avatarPreviewInModal) avatarPreviewInModal.src = 'static/img/default_artist_avatar.png';
        saveProfileChangesButton.addEventListener('click', (e) => {
          e.preventDefault();
          saveProfileChangesButton.disabled = true;
          saveProfileChangesButton.textContent = 'Сохранение...';
          setTimeout(() => {
            const mainProfileAvatar = document.querySelector('.profile-avatar img');
            const avatarHeader = document.querySelector('.profile-avatar-header img');

            if (mainProfileAvatar) mainProfileAvatar.src = 'static/img/default_artist_avatar.png';
            if (avatarHeader) avatarHeader.src = 'static/img/default_artist_avatar.png';

            saveProfileChangesButton.disabled = false;
            saveProfileChangesButton.textContent = 'Сохранить изменения';
            avatarInput.value = ''; // Сбрасываем инпут

            if (editProfileOverlay) {
              editProfileOverlay.classList.remove('active');
            }
          }, 1000);
        });

        if (avatarInput) {
          avatarInput.value = '';
        }
      });
    }
  }
}
