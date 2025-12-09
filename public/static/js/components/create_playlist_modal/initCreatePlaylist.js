import { apiServise } from '@/data.js';
import { router } from '@/routing.js';
import { FormValidator } from '@/validation.js';
import { images } from "@/assets.js";

class CreatePlaylistService {
  show() {
    const div = document.createElement('div');
    const template = Handlebars.templates['createPlaylistModal.hbs'];
    div.innerHTML = template({playlistImage: images.defaultPlaylistPath});
    const overlay = div.firstElementChild;
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });

    let selectedAvatarFile = null;

    const closeBtn = overlay.querySelector('.close-button');
    const submitBtn = overlay.querySelector('#submitCreatePlaylist');

    const avatarButtonsContainer = overlay.querySelector('#avatarButtonsContainer');
    const avatarPreview = overlay.querySelector('#playlistAvatar');
    const setAvatarBtn = overlay.querySelector('#setAvatarBtn');
    const titleInput = overlay.querySelector('#title');
    const descInput = overlay.querySelector('#description');

    const close = () => {
      overlay.classList.remove('active');
      document.removeEventListener('keydown', handleEsc);
      setTimeout(() => {
        overlay.remove();
      }, 300);
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        close();
      }
    };
    document.addEventListener('keydown', handleEsc);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    closeBtn.addEventListener('click', close);

    const validator = this._initValidator();

    const addDeleteButton = () => {
      if (overlay.querySelector('#deleteAvatarBtn')) return;

      const btn = document.createElement('button');
      btn.id = 'deleteAvatarBtn';
      btn.className = 'secondary-button save-avatar-button-size';
      btn.textContent = 'Удалить фото';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        selectedAvatarFile = null;
        avatarPreview.src = images.defaultPlaylistPath;
        btn.remove();
      });

      avatarButtonsContainer.appendChild(btn);
    };

    setAvatarBtn.onclick = (e) => {
      e.preventDefault();

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = () => {
        const file = input.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
          alert('Файл слишком большой (максимум 5МБ)');
          return;
        }

        selectedAvatarFile = file;

        const reader = new FileReader();
        reader.onload = (event) => {
          avatarPreview.src = event.target.result;
          addDeleteButton();
        };
        reader.readAsDataURL(file);
      };
      input.click();
    };

    submitBtn.onclick = async (e) => {
      e.preventDefault();

      if (!validator.validateForm()) {
        validator.showMessage('Необходимо заполнить название плейлиста');
        return;
      }

      try {
        submitBtn.disabled = true;

        const title = titleInput.value;
        const description = descInput.value;

        const data = await apiServise.createPlaylist(title, description);

        if (selectedAvatarFile) {
          await apiServise.uploadPlaylistAvatar(selectedAvatarFile, data.id);
        }

        close();
        router.navigate(`playlist/${data.id}`);

      } catch (err) {
        console.error('Ошибка создания:', err);
        submitBtn.disabled = false;

        let msg = 'Произошла ошибка. Попробуйте позже';
        if (err.message === 'bad request') {
          msg = 'Проверьте правильность введенных данных.';
        }
        validator.showMessage(msg);
      }
    };
  }

  _initValidator() {
    const validators = {
      title: (value) => value ? null : 'Назовите ваш плейлист',
    };
    const infoMessages = {
      title: (value) => value ? null : 'Укажите название плейлиста',
      description: () => 'Максимум 300 символов',
    };

    const v = new FormValidator(
      'createPlaylistForm',
      validators,
      infoMessages,
      '.general-error'
    );
    v.init();
    return v;
  }
}

export const createPlaylistModal = new CreatePlaylistService();