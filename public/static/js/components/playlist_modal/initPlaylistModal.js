import { apiServise } from '@/data.js';
import { router } from '@/routing.js';
import { FormValidator } from '@/validation.js';
import { images } from '@/assets.js';
import { getValidImage } from '@/parsers.js';
import { confirmation } from '@/components/confirmation_modal/confirmationModal.js';

class PlaylistModalService {
  constructor() {
    this.mode = 'create';
    this.playlistData = null;
    this.onSuccessCallback = null;
    this.overlay = null;
    this.selectedAvatarFile = null;
    this.isAvatarDeleted = false;
    this.validator = null;
    this.warnedAboutChanges = false;
  }

  openCreate() {
    this.mode = 'create';
    this.playlistData = null;
    this.onSuccessCallback = null;
    this.render();
  }

  openEdit(data, onSuccess) {
    this.mode = 'edit';
    this.playlistData = data;
    this.onSuccessCallback = onSuccess;
    this.render();
  }

  render() {
    if (document.querySelector('.modal-overlay')) {
      document.querySelector('.modal-overlay').remove();
    }

    if (localStorage.getItem('isAuthenticated') !== 'true') {
      confirmation.showConfirm({
        title: 'Создать плейлист',
        description: `Создание плейлистов доступном в вашем <b>Wave Music</b> аккаунте`,
        confirmText: 'Войти',
        cancelText: 'Закрыть',
        onConfirm: () => {
          router.navigate('/login');
        },
      });
      return;
    }

    const template = Handlebars.templates['playlistModal.hbs'];

    const templateData = {
      isEdit: this.mode === 'edit',
      modalTitle: this.mode === 'create' ? 'Создать плейлист' : 'Редактировать плейлист',
      submitText: this.mode === 'create' ? 'Создать' : 'Сохранить',
      playlistImage:
        this.mode === 'edit' && this.playlistData.image ? this.playlistData.image : images.defaultPlaylistPath,
      title: this.mode === 'edit' ? this.playlistData.title : '',
      description: this.mode === 'edit' ? this.playlistData.description : '',
    };

    const div = document.createElement('div');
    div.innerHTML = template(templateData);
    this.overlay = div.firstElementChild;

    document.body.appendChild(this.overlay);

    if (this.mode === 'edit' && this.playlistData.image) this.addDeleteAvatarButton();

    requestAnimationFrame(() => {
      this.overlay.classList.add('active');
    });

    this.bindEvents();
  }

  bindEvents() {
    this.selectedAvatarFile = null;
    this.isAvatarDeleted = false;
    this.warnedAboutChanges = false;

    const closeBtn = this.overlay.querySelector('.close-button');
    const submitBtn = this.overlay.querySelector('#submitPlaylistOverlay');
    const setAvatarBtn = this.overlay.querySelector('#setAvatarBtn');

    closeBtn.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', handleEsc);
        this.close();
      }
    };
    document.addEventListener('keydown', handleEsc);

    this.validator = this.initValidator();

    setAvatarBtn.onclick = (e) => {
      e.preventDefault();

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = () => this.handleFileSelect(input.files[0]);
      input.click();
    };

    submitBtn.onclick = async (e) => {
      e.preventDefault();
      if (!this.validator.validateForm()) {
        this.validator.showMessage('Необходимо заполнить название плейлиста');
        return;
      }
      await this.handleSubmit(submitBtn, this.validator);
    };
  }

  handleFileSelect(file) {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Файл слишком большой (максимум 5МБ)');
      return;
    }

    this.selectedAvatarFile = file;
    this.isAvatarDeleted = false;

    const reader = new FileReader();
    reader.onload = (event) => {
      const avatarPreview = this.overlay.querySelector('#playlistAvatar');
      avatarPreview.src = event.target.result;
      this.addDeleteAvatarButton();
    };
    reader.readAsDataURL(file);
  }

  addDeleteAvatarButton() {
    const container = this.overlay.querySelector('#avatarButtonsContainer');
    const avatarPreview = this.overlay.querySelector('#playlistAvatar');

    if (container.querySelector('#deleteAvatarBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'deleteAvatarBtn';
    btn.className = 'secondary-button save-avatar-button-size';
    btn.textContent = 'Удалить фото';

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      this.selectedAvatarFile = null;
      this.isAvatarDeleted = true;
      avatarPreview.src = images.defaultPlaylistPath;
      btn.remove();
    });

    container.appendChild(btn);
  }

  async handleSubmit(submitBtn) {
    const titleInput = this.overlay.querySelector('#title');
    const descInput = this.overlay.querySelector('#description');

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Загрузка...';

      const title = titleInput.value;
      const description = descInput.value;

      if (this.mode === 'create') {
        const data = await apiServise.createPlaylist(title, description);

        if (this.selectedAvatarFile) {
          await apiServise.uploadPlaylistAvatar(this.selectedAvatarFile, data.id);
        }

        this.close(true);
        router.navigate(`playlist/${data.id}`);
      } else {
        let newAvatarUrl = this.playlistData.image;

        if (this.selectedAvatarFile) {
          const response = await apiServise.uploadPlaylistAvatar(this.selectedAvatarFile, this.playlistData.id);
          newAvatarUrl = getValidImage(response.avatar_url);
        } else if (this.isAvatarDeleted) {
          await apiServise.deletePlaylistAvatar(this.playlistData.id);
          newAvatarUrl = null;
        }

        if (title !== this.playlistData.title || description !== this.playlistData.description) {
          await apiServise.updatePlaylist(title, description, this.playlistData.id);
        }

        if (this.onSuccessCallback) {
          this.onSuccessCallback({
            id: this.playlistData.id,
            title: title,
            description: description,
            image: newAvatarUrl,
          });
        }
        this.close(true);
      }
    } catch (err) {
      console.error('Ошибка:', err);
      submitBtn.disabled = false;
      submitBtn.textContent = this.mode === 'create' ? 'Создать' : 'Сохранить';

      let msg = 'Произошла ошибка. Попробуйте позже';
      if (err.message === 'bad request') msg = 'Проверьте правильность данных.';
      this.validator.showMessage(msg);
    }
  }

  initValidator() {
    const validators = {
      title: (value) => (value ? null : 'Назовите ваш плейлист'),
    };
    const infoMessages = {
      title: (value) => (value ? null : 'Укажите название плейлиста'),
      description: () => 'Максимум 300 символов',
    };

    const v = new FormValidator('createPlaylistForm', validators, infoMessages, '.general-error');
    v.init();
    return v;
  }

  hasUnsavedChanges() {
    const titleInput = this.overlay.querySelector('#title');
    const descInput = this.overlay.querySelector('#description');

    const currentTitle = titleInput ? titleInput.value.trim() : '';
    const currentDesc = descInput ? descInput.value.trim() : '';

    if (this.selectedAvatarFile || this.isAvatarDeleted) return true;

    if (this.mode === 'create') {
      return currentTitle.length > 0 || currentDesc.length > 0;
    } else {
      const originalTitle = this.playlistData.title || '';
      const originalDesc = this.playlistData.description || '';

      return currentTitle !== originalTitle || currentDesc !== originalDesc;
    }
  }

  close(force = false) {
    if (!this.overlay) return;

    if (!force) {
      if (this.hasUnsavedChanges() && !this.warnedAboutChanges) {
        this.validator.showMessage(
          `Чтобы не потерять изменения, нажми кнопку «${this.mode === 'create' ? 'Создать' : 'Сохранить'}»`,
          true
        );
        this.warnedAboutChanges = true;
        return;
      }
    }

    this.overlay.classList.remove('active');
    setTimeout(() => {
      if (this.overlay) {
        this.overlay.remove();
        this.overlay = null;
      }
    }, 300);
  }
}

export const playlistModal = new PlaylistModalService();
