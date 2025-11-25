import { apiServise } from '@/data.js';
import { router } from '@/routing.js';
import { header } from '@/components/header/header.js';
import { sidebar } from '@/components/sidebar/sidebar.js';
import { initScrollbar } from '@/scrollbar.js';
import { slider } from '@/slider.js';
import {
  playsParser,
  durationParser,
  getValidImage,
  totalDurationParser,
  tracksNumParser,
  dateParser,
} from '@/parsers.js';
import { playTrack } from '@/playTrackBtn.js';
import { setPlayButtonsOnAuth } from '@/setPlayButtonsOnAuth.js';
import { playerOnlyOnPlay } from '@/playerOnlyOnplay.js';
import { FormValidator } from '@/validation.js';
import { likeTrackBtn } from '@/utils/likeTrack.js';

export class PlaylistPage {
  constructor() {
    this.playlistData = {};
  }

  async render(id) {
    let pageData = {};

    const contentTemplate = Handlebars.templates['playlist.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);
    document.querySelector('head title').textContent = 'Wave Music';

    try {
      const data = await apiServise.getPlaylistPageData(id);
      this.playlistData = data.playlist;
      if (data.playlist.is_favorite) {
        pageData = {
          favourite: true,
          id: data.playlist.id,
          title: data.playlist.title,
          date: dateParser(data.playlist.created_at),
          cover: 'static/img/liked_tracks.png',
          description: data.playlist.description,
        };
      } else {
        pageData = {
          favourite: null,
          id: data.playlist.id,
          title: data.playlist.title,
          date: dateParser(data.playlist.created_at),
          cover: getValidImage(data.playlist.avatar_url ? data.playlist.avatar_url : '', 'default-playlist.png'),
          description: data.playlist.description,
        };
      }
      let totalDuration = 0;
      pageData.tracks = (data.playlist.tracks || []).map((track) => {
        totalDuration += track.duration_s;
        if (data.playlist.is_favorite) {
          return {
            id: track.id,
            name: track.title,
            album: track.album.title,
            album_id: track.album.id,
            cover: getValidImage('albums/' + track.album.avatar_url, 'default-album.png'),
            artists: track.artists,
            plays: playsParser(track.play_count),
            duration: durationParser(track.duration_s),
            is_liked: true,
          };
        } else {
          return {
            id: track.id,
            name: track.title,
            album: track.album.title,
            album_id: track.album.id,
            cover: getValidImage('albums/' + track.album.avatar_url, 'default-album.png'),
            artists: track.artists,
            plays: playsParser(track.play_count),
            duration: durationParser(track.duration_s),
            is_liked: true,
          };
        }
      });
      pageData.totalDuration = totalDurationParser(totalDuration);
      pageData.tracksNum = tracksNumParser(pageData.tracks.length);
    } catch (error) {
      console.error('Failed to load playlist page data:', error);

      if (error.response && error.response.status === 404) {
        router.navigate('/not-found');
        return;
      }

      if (error.message && error.message.includes('Network')) {
        alert('Проблема с подключением. Попробуйте позже.');
        return;
      }

      alert('Не удалось загрузить страницу плейлиста.');
      return;
    }

    document.getElementById('app').innerHTML = contentTemplate(pageData);
    document.querySelector('head title').textContent = pageData.title;
    playerOnlyOnPlay();
    await Promise.all([header.render(), sidebar.render()]);

    slider.sliderFunction();
    initScrollbar();
    this.addEventListeners(this.playlistData.id);
    setPlayButtonsOnAuth();
    likeTrackBtn();
    playTrack();
  }

  addEventListeners(playlistId) {
    const getDescriptionButton = document.getElementById('getDescription');
    const getDescriptionOverlay = document.getElementById('descriptionOverlay');

    const editPlaylistButton = document.querySelector('.actions-item.edit');
    const editPlaylistOverlay = document.getElementById('editProfileOverlay');
    const closeOverlayButton = document.getElementById('closeOverlayButton');

    if (editPlaylistButton && editPlaylistOverlay) {
      editPlaylistButton.addEventListener('click', (e) => {
        e.preventDefault();
        editPlaylistOverlay.classList.add('active');
      });
    }

    if (closeOverlayButton && editPlaylistOverlay) {
      closeOverlayButton.addEventListener('click', (e) => {
        e.preventDefault();

        editPlaylistOverlay.classList.remove('active');
      });
    }

    if (editPlaylistOverlay) {
      editPlaylistOverlay.addEventListener('click', (e) => {
        if (e.target === editPlaylistOverlay) {
          editPlaylistOverlay.classList.remove('active');
        }
      });
    }

    let selectedAvatarFile = null;
    let deleteAvatar = false;
    const editAvatarButtons = document.getElementById('editPlaylistAvatarButtons');

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

    if (editAvatarButtons) {
      editAvatarButtons.addEventListener('click', (e) => {
        const target = e.target;

        if (target.id === 'setPlaylistAvatarButton') {
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
              updateAvatarContainer('playlistAvatarEditContainer', event.target.result);

              if (!document.getElementById('deletePlaylistAvatarButton')) {
                editAvatarButtons.insertAdjacentHTML(
                  'beforeend',
                  `<button id="deletePlaylistAvatarButton" class="secondary-button save-avatar-button-size">Удалить фото</button>`
                );
              }
            };
            reader.readAsDataURL(file);
          });
        }

        if (target.id === 'deletePlaylistAvatarButton') {
          e.preventDefault();

          selectedAvatarFile = null;
          deleteAvatar = true;

          updateAvatarContainer('playlistAvatarEditContainer', null, null, 'profile-edit-avatar');

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

    const editValidator = new FormValidator('editProfileForm', editValidators, editInformation, '.primary-button');

    editValidator.init();

    const saveButton = document.getElementById('savePlaylistChangesButton');
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
            const response = await apiServise.uploadPlaylistAvatar(selectedAvatarFile, playlistId);
            const newAvatarUrl = getValidImage(response.avatar_url);

            updateAvatarContainer('avatarEditContainer', newAvatarUrl);
            updateAvatarContainer('profileAvatarContainer', newAvatarUrl);

            selectedAvatarFile = null;
          } else if (deleteAvatar) {
            const response = await apiServise.deletePlaylistAvatar(playlistId);
            const newAvatarUrl = getValidImage(response.avatar_url);

            updateAvatarContainer('avatarEditContainer', newAvatarUrl);
            const profileAvatarContainer = document.getElementById('profileAvatarContainer');
            if (profileAvatarContainer) {
              const imgElement = profileAvatarContainer.querySelector('img');
              if (imgElement) {
                imgElement.src = 'static/img/default-playlist.png';
              } else {
                console.error('No img element found inside profileAvatarContainer');
              }
            }

            deleteAvatar = false;
          }

          const newTitle = document.getElementById('title').value;
          const newDescription = document.getElementById('description').value;

          if (newTitle !== this.playlistData.title || newDescription !== this.playlistData.description) {
            await apiServise.updatePlaylist(newTitle, newDescription, playlistId);
            const title = document.querySelector('.album-card-title');
            if (title) {
              title.textContent = newTitle;
            }
            const dscription = document.getElementById('getDescription');
            if (dscription) {
              dscription.textContent = newDescription;
            }
          }
          editValidator.showMessage('Изменения успешно сохранены!', true);
          setTimeout(() => {
            const messageElement = document.getElementById('generalError');
            if (messageElement) {
              messageElement.textContent = '';
              messageElement.classList.remove('show');
              messageElement.style.backgroundColor = '';
            }

            editPlaylistOverlay.classList.remove('active');
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

    if (getDescriptionButton && getDescriptionOverlay) {
      getDescriptionButton.addEventListener('click', (e) => {
        e.preventDefault();
        getDescriptionOverlay.classList.add('active');
      });
    }

    const closeDescriptionButton = document.getElementById('closeDescriptionButton');
    if (closeDescriptionButton && getDescriptionOverlay) {
      closeDescriptionButton.addEventListener('click', (e) => {
        e.preventDefault();
        getDescriptionOverlay.classList.remove('active');
      });
    }

    if (getDescriptionOverlay) {
      getDescriptionOverlay.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target === getDescriptionOverlay) {
          getDescriptionOverlay.classList.remove('active');
        }
      });
    }

    const dotsBtn = document.getElementById('playlistActions');
    const menu = document.getElementById('playlistMenu');

    dotsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      menu.classList.toggle('hidden');

      const rect = dotsBtn.getBoundingClientRect();
      const parentRect = dotsBtn.parentElement.getBoundingClientRect();

      const top = rect.top - parentRect.top - menu.offsetHeight - 6;
      const left = rect.left - parentRect.left - 10;

      menu.style.top = `${top}px`;
      menu.style.left = `${left}px`;
    });

    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !dotsBtn.contains(e.target)) {
        menu.classList.add('hidden');
      }
    });
  }
}
