import { apiServise } from '@/data.js';
import { router } from '@/routing.js';
import { FormValidator } from '@/validation.js';

export function createPlaylis() {
  const createPlaylistOverlay = document.getElementById('createPlaylistOverlay');
  const createPlaylistButtons = document.querySelectorAll('.create-playlist-button');
  const sidebarButton = document.querySelector('.sidebar-secondary-button');
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  const allCreateButtons = [...createPlaylistButtons];
  if (sidebarButton) {
    allCreateButtons.push(sidebarButton);
  }
  if (createPlaylistOverlay && allCreateButtons.length > 0) {
    allCreateButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        if (isAuthenticated) {
          createPlaylistOverlay.classList.add('active');
        } else {
          router.navigate('/login');
        }
      });
    });
  }

  let selectedAvatarFile = null;
  const closeOverlayButton = document.getElementById('closeOverlayButtonCreatePlaylist');
  if (closeOverlayButton && createPlaylistOverlay) {
    closeOverlayButton.addEventListener('click', (e) => {
      document.getElementById('title').value = '';
      document.getElementById('description').value = '';

      updateAvatarContainer();

      selectedAvatarFile = null;

      const errorElements = document.querySelectorAll('.error-message');
      errorElements.forEach((el) => {
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

      createPlaylistOverlay.classList.remove('active');
    });
  }

  if (createPlaylistOverlay) {
    createPlaylistOverlay.addEventListener('click', (e) => {
      if (e.target === createPlaylistOverlay) {
        document.getElementById('title').value = '';
        document.getElementById('description').value = '';

        updateAvatarContainer();

        selectedAvatarFile = null;

        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach((el) => {
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
        createPlaylistOverlay.classList.remove('active');
      }
    });
  }

  function updateAvatarContainer(src = null) {
    const img = document.getElementById('playlistAvatar');

    if (src) img.src = src;
    else img.src = 'static/img/default-playlist.png';
  }

  const editAvatarButtons = document.getElementById('editAvatarButtonsPlaylist');
  if (editAvatarButtons) {
    editAvatarButtons.addEventListener('click', (e) => {
      const target = e.target;

      if (target.id === 'setAvatarButtonPlaylist') {
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

          const reader = new FileReader();
          reader.onload = (event) => {
            updateAvatarContainer(event.target.result);

            if (!document.getElementById('deleteAvatarButtonPlaylist')) {
              editAvatarButtons.insertAdjacentHTML(
                'beforeend',
                `<button id="deleteAvatarButtonPlaylist" class="secondary-button save-avatar-button-size">Удалить фото</button>`
              );
            }
          };
          reader.readAsDataURL(file);
        });
      }

      if (target.id === 'deleteAvatarButtonPlaylist') {
        e.preventDefault();
        selectedAvatarFile = null;
        updateAvatarContainer();
        target.remove();
      }
    });
  }

  const createValidators = {
    title: (value) => {
      if (!value) return 'Назовите ваш плейлист';
      return null;
    },
  };

  const createInformation = {
    title: (value) => (value ? null : 'Укажите название плейлиста'),
    description: (value) => {
      return 'Максимум 300 символов';
    },
  };

  const createValidator = new FormValidator(
    'createPlaylistForm',
    createValidators,
    createInformation,
    '.general-error'
  );
  createValidator.init();

  const saveButton = document.getElementById('savePlaylistButton');
  if (saveButton) {
    saveButton.addEventListener('click', async (e) => {
      e.preventDefault();

      const isValid = createValidator.validateForm();
      if (!isValid) {
        createValidator.showMessage('Необходимо указать название плейлиста');
        return;
      }

      try {
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const data = await apiServise.createPlaylist(title, description);

        if (selectedAvatarFile) {
          await apiServise.uploadPlaylistAvatar(selectedAvatarFile, data.id);
        }

        router.navigate(`playlist/${data.id}`);
      } catch (err) {
        console.error('Ошибка при сохранении профиля:', err);
        let msg = 'Не удалось сохранить изменения. Попробуйте еще раз чуть позже.';
        if (err.message === 'bad request')
          msg = 'Что-то пошло не так. Пожалуйста, проверьте правильность введенных данных.';
        createValidator.showMessage(msg);
      }
    });
  }
}
