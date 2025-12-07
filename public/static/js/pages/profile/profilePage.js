import { router } from '@/routing.js';
import { apiServise } from '@/data.js';
import { initPasswordShowing } from '@/eye.js';
import { initScrollbar } from '@/scrollbar.js';
import { durationParser, getValidImage, playsParser } from '@/parsers.js';
import { sidebar } from '@/components/sidebar/sidebar.js';
import { slider } from '@/slider.js';
import { header } from '@/components/header/header.js';
import { setPlayButtonsOnAuth } from '@/setPlayButtonsOnAuth.js';
import { FormValidator } from '@/validation.js';
import { playerOnlyOnPlay } from '@/playerOnlyOnplay.js';
import { playTrack } from '@/playTrackBtn.js';
import { likeTrackBtn } from '@/utils/likeTrack.js';
import { setupMarquees } from '@/marquee.js';
import { createPlaylis } from '@/utils/initCreatePlaylist';

export class ProfilePage {
  async render() {
    let pageData = {
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
      top_artists: [],
      top_tracks: [],
      recent: [],
      profile: {},
    };

    const contentTemplate = Handlebars.templates['profilePage.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);
    document.querySelector('head title').textContent = 'Wave Music';
    if (!pageData.isAuthenticated) {
      await Promise.all([header.render(), sidebar.render()]);
      return;
    }

    try {
      const data = await apiServise.getProfilePageData();
      const profile = await apiServise.getProfileData();
      pageData.profile.avatar = profile.AvatarURL ? getValidImage(profile.AvatarURL) : profile.AvatarURL;
      pageData.profile.nickname = profile.Login;
      pageData.profile.letter = pageData.profile.nickname ? pageData.profile.nickname[0].toUpperCase() : '';
      pageData.profile.email = profile.Email;
      pageData.top_artists = (data.top_artists || []).map((artist) => ({
        id: artist.id,
        name: artist.name,
        listeners: playsParser(artist.play_count) || 0,
        image: getValidImage('artists/' + artist.avatar_url, 'default-artist.png'),
      }));
      pageData.top_tracks = (data.top_tracks || []).map((track) => ({
        id: track.id,
        name: track.title,
        plays: playsParser(track.play_count) || 0,
        album: track.album.title,
        album_id: track.album.id,
        duration: durationParser(track.duration_s),
        cover: getValidImage('albums/' + track.album.avatar_url, 'default-album.png'),
        artists: track.artists,
        is_liked: track.is_liked,
      }));
      pageData.recent = (data.recent || []).map((artist) => ({
        id: artist.id,
        name: artist.name,
        listeners: playsParser(artist.play_count) || 0,
        image: getValidImage('artists/' + artist.avatar_url, 'default-artist.png'),
      }));
    } catch (error) {
      console.error('Failed to load profile page data:', error);
      localStorage.removeItem('isAuthenticated');
      router.navigate('/');
      return;
    }

    document.getElementById('app').innerHTML = contentTemplate(pageData);
    document.querySelector('head title').textContent = pageData.profile.nickname;
    playerOnlyOnPlay();
    await Promise.all([header.render(), sidebar.render()]);
    createPlaylis();
    slider.sliderFunction();
    this.addEventListeners(pageData.profile);
    initPasswordShowing();
    initScrollbar();
    setPlayButtonsOnAuth();
    likeTrackBtn();
    playTrack();
    setupMarquees();
  }

  addEventListeners(profile) {
    const editProfileButton = document.getElementById('editProfileBtn');
    const editProfileOverlay = document.getElementById('editProfileOverlay');

    if (editProfileButton && editProfileOverlay) {
      editProfileButton.addEventListener('click', (e) => {
        e.preventDefault();
        editProfileOverlay.classList.add('active');
      });
    }

    const closeOverlayButton = document.getElementById('closeOverlayButton');
    if (closeOverlayButton && editProfileOverlay) {
      closeOverlayButton.addEventListener('click', (e) => {
        e.preventDefault();

        document.getElementById('email').value = profile.email;
        document.getElementById('login').value = profile.nickname;
        document.getElementById('password').value = '';
        document.getElementById('passwordConfirm').value = '';

        updateAvatarContainer('avatarEditContainer', profile.avatar, profile.letter, 'profile-edit-avatar');

        selectedAvatarFile = null;
        deleteAvatar = false;

        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach((el) => {
          el.textContent = '';
          el.classList.remove('show');
        });

        const infoElements = document.querySelectorAll('.validation-message');
        infoElements.forEach((el) => {
          el.textContent = '';
          el.classList.remove('show');
        });

        const formGroups = document.querySelectorAll('.form-group.error');
        formGroups.forEach((group) => group.classList.remove('error'));

        const messageElement = document.getElementById('generalError');
        if (messageElement) {
          messageElement.textContent = '';
          messageElement.classList.remove('show');
          messageElement.style.backgroundColor = '';
        }
        const deleteAvatarbtn = document.getElementById('deleteAvatarButton');
        if (deleteAvatarbtn) {
          deleteAvatarbtn.remove();
        }

        editProfileOverlay.classList.remove('active');
      });
    }

    if (editProfileOverlay) {
      editProfileOverlay.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target === editProfileOverlay) {
          const modal = editProfileOverlay.querySelector('.edit-profile-window');
          if (!modal) return;

          modal.classList.remove('highlight');
          void modal.offsetWidth;
          modal.classList.add('highlight');

          modal.addEventListener('animationend', function handler() {
            modal.classList.remove('highlight');
            modal.removeEventListener('animationend', handler);
          });
        }
      });
    }

    function updateAvatarContainer(containerId, avatarUrl = null, letter = null, className = '') {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.textContent = '';

      if (avatarUrl) {
        const img = document.createElement('img');
        img.src = avatarUrl;
        img.alt = 'Ваш аватар';
        img.className = 'profile-image';
        img.style.objectFit = 'cover';
        container.appendChild(img);
      } else {
        const avatarDiv = document.createElement('div');
        avatarDiv.className = `default-avatar ${className}`;
        avatarDiv.textContent = letter || '';
        container.appendChild(avatarDiv);
      }
    }

    let selectedAvatarFile = null;
    let deleteAvatar = false;
    const editAvatarButtons = document.getElementById('editAvatarButtons');
    if (editAvatarButtons) {
      editAvatarButtons.addEventListener('click', (e) => {
        const target = e.target;

        if (target.id === 'setAvatarButton') {
          e.preventDefault();

          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.click();

          input.addEventListener('change', () => {
            const file = input.files[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
              alert('Файл слишком большой (максимум 5МБ)');
              return;
            }

            selectedAvatarFile = file;
            deleteAvatar = false;

            const reader = new FileReader();
            reader.onload = (event) => {
              updateAvatarContainer('avatarEditContainer', event.target.result);

              if (!document.getElementById('deleteAvatarButton')) {
                editAvatarButtons.insertAdjacentHTML(
                  'beforeend',
                  `<button id="deleteAvatarButton" class="secondary-button save-avatar-button-size">Удалить фото</button>`
                );
              }
            };
            reader.readAsDataURL(file);
          });
        }

        if (target.id === 'deleteAvatarButton') {
          e.preventDefault();

          selectedAvatarFile = null;
          deleteAvatar = true;

          updateAvatarContainer('avatarEditContainer', null, profile.letter, 'profile-edit-avatar');

          target.remove();
        }
      });
    }

    const editValidators = {
      email: (value) => {
        if (!value) return 'Пожалуйста, заполните это поле';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Некорректный email';
        return null;
      },
      login: (value) => {
        if (!value) return 'Пожалуйста, заполните это поле';
        if (value.length < 5) return 'Минимум 5 символов';
        else if (value.length > 35) return 'Максимум 35 символов';
        return null;
      },
      password: (value) => {
        if (value && value.length < 8) return 'Минимум 8 символов';
        return null;
      },
      passwordConfirm: (value) => {
        const password = document.getElementById('password')?.value;
        if (value !== password) return 'Пароли не совпадают. Пожалуйста, проверьте.';
        return null;
      },
    };

    const editInformation = {
      email: (value) => (!/\S+@\S+\.\S+/.test(value) ? 'Формат: example@mail.com' : null),
      login: (value) => {
        if (value.length < 5) return 'Минимум 5 символов';
        else if (value.length > 35) return 'Максимум 35 символов';
        return null;
      },
      password: (value) => {
        const errors = [];
        const passwordConfirm = document.getElementById('passwordConfirm');
        if (value && value.length < 8) {
          errors.push('Минимум 8 символов');
        }
        if (value !== passwordConfirm.value) {
          errors.push('Пароли не совпадают');
        }
        return errors.length ? errors : null;
      },
      passwordConfirm: (value) => {
        const errors = [];
        const password = document.getElementById('password');
        if (value && value.length < 8) {
          errors.push('Минимум 8 символов');
        }
        if (value !== password.value) {
          errors.push('Пароли не совпадают');
        }
        return errors.length ? errors : null;
      },
    };

    const editValidator = new FormValidator('editProfileForm', editValidators, editInformation, {
      submitButtonSelector: '.general-error',
      messageSelector: '#generalErrorProfile',
    });

    editValidator.init();

    const saveButton = document.getElementById('saveProfileChangesButton');
    if (saveButton) {
      saveButton.addEventListener('click', async (e) => {
        e.preventDefault();

        const isValid = editValidator.validateForm();
        if (!isValid) {
          editValidator.showMessage('Пожалуйста, проверьте подсвеченные поля');
          return;
        }

        try {
          if (selectedAvatarFile) {
            const response = await apiServise.uploadAvatar(selectedAvatarFile);
            const newAvatarUrl = getValidImage(response.avatar_url);

            updateAvatarContainer('avatarProfileContainer', newAvatarUrl);
            updateAvatarContainer('avatarHeaderContainer', newAvatarUrl);

            selectedAvatarFile = null;
          } else if (deleteAvatar) {
            await apiServise.deleteAvatar();

            updateAvatarContainer('avatarProfileContainer', null, profile.letter, 'default-avatar-profile');
            updateAvatarContainer('avatarHeaderContainer', null, profile.letter, 'default-avatar-header');

            deleteAvatar = false;
          }

          const email = document.getElementById('email').value;
          const login = document.getElementById('login').value;
          let password = document.getElementById('password').value;
          if (email !== profile.email || login !== profile.nickname || password) {
            if (!password) password = '';
            const data = await apiServise.editUser(login, email, password);
            profile.nickname = data.Login;
            profile.email = data.Email;
            const newLogin = data.Login;

            const headerUsername = document.querySelector('.header-username');
            if (headerUsername) {
              headerUsername.textContent = newLogin;
            }

            const profileUsername = document.querySelectorAll('.profile-username');
            profileUsername.forEach((username) => (username.textContent = newLogin));
            setupMarquees();

            const newLetter = newLogin[0] ? newLogin[0].toUpperCase() : '?';
            document.querySelectorAll('.default-avatar').forEach((el) => {
              el.textContent = newLetter;
            });
          }

          editValidator.showMessage('Изменения успешно сохранены!', true);

          setTimeout(() => {
            const messageElement = document.getElementById('generalErrorProfile');
            if (messageElement) {
              messageElement.textContent = '';
              messageElement.classList.remove('show');
              messageElement.style.backgroundColor = '';
            }

            editProfileOverlay.classList.remove('active');
          }, 1000);
        } catch (err) {
          console.error('Ошибка при сохранении профиля:', err);
          let msg = 'Не удалось сохранить изменения. Попробуйте еще раз чуть позже.';
          if (err.message === 'resource conflict') msg = 'Пользователь с такими данными уже существует.';
          else if (err.message === 'bad request')
            msg = 'Что-то пошло не так. Пожалуйста, проверьте правильность введенных данных.';
          editValidator.showMessage(msg);
        }
      });
    }
  }
}
