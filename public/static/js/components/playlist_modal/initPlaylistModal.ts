import { apiServise } from '@/data';
import { router } from '@/routing';
import { FormValidator } from '@/utils/validation';
import { images } from "@/assets";
import { getValidImage } from '@/utils/parsers';
import { confirmation } from "@/components/confirmation_modal/confirmationModal.ts";
import { FormSchemas } from "@/utils/validationRules.ts";

interface PlaylistData {
  id: string;
  title: string;
  description: string;
  image?: string | null;
}

type SuccessCallback = (data: PlaylistData) => void;
type ModalMode = 'create' | 'edit';

class PlaylistModalService {
  private mode: ModalMode = 'create';
  private playlistData: PlaylistData | null = null;
  private onSuccessCallback: SuccessCallback | null = null;

  private overlay: HTMLElement | null = null;
  private selectedAvatarFile: File | null = null;
  private isAvatarDeleted = false;
  private validator: FormValidator | null = null;
  private warnedAboutChanges = false;

  private handleEsc: ((e: KeyboardEvent) => void) | null = null;

  openCreate() {
    this.mode = 'create';
    this.playlistData = null;
    this.onSuccessCallback = null;
    this.render();
  }

  openEdit(data: PlaylistData, onSuccess: SuccessCallback) {
    this.mode = 'edit';
    this.playlistData = data;
    this.onSuccessCallback = onSuccess;
    this.render();
  }

  private render() {
    const existingOverlay = document.querySelector('.modal-overlay');
    if (existingOverlay) existingOverlay.remove();

    if (localStorage.getItem('isAuthenticated') !== 'true') {
      confirmation.showConfirm({
        title: 'Создать плейлист',
        description: `Создание плейлистов доступном в вашем <b>Wave Music</b> аккаунте`,
        confirmText: 'Войти',
        cancelText: 'Закрыть',
        onConfirm: () => {
          router.navigate('/login')
        }
      });
      return;
    }

    const template = Handlebars.templates['playlistModal.hbs'];

    const templateData = {
      isEdit: this.mode === 'edit',
      modalTitle: this.mode === 'create' ? 'Создать плейлист' : 'Редактировать плейлист',
      submitText: this.mode === 'create' ? 'Создать' : 'Сохранить',
      playlistImage: (this.mode === 'edit' && this.playlistData?.image)
        ? this.playlistData.image
        : images.defaultPlaylistPath,
      title: this.mode === 'edit' ? this.playlistData?.title : '',
      description: this.mode === 'edit' ? this.playlistData?.description : ''
    };

    const div = document.createElement('div');
    div.innerHTML = template(templateData);
    this.overlay = div.firstElementChild as HTMLElement;

    document.body.appendChild(this.overlay);

    if (this.mode === 'edit' && this.playlistData?.image) {
      this.addDeleteAvatarButton();
    }

    requestAnimationFrame(() => {
      this.overlay?.classList.add('active');
    });

    this.bindEvents();
  }

  private bindEvents() {
    if (!this.overlay) return;
    this.selectedAvatarFile = null;
    this.isAvatarDeleted = false;
    this.warnedAboutChanges = false;

    const closeBtn = this.overlay.querySelector('.close-button') as HTMLButtonElement;
    const submitBtn = this.overlay.querySelector('#submitPlaylistOverlay') as HTMLButtonElement;
    const setAvatarBtn = this.overlay.querySelector('#setAvatarBtn') as HTMLButtonElement;

    closeBtn.addEventListener('click', () => this.close());

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    this.handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.close();
      }
    };
    document.addEventListener('keydown', this.handleEsc);

    this.validator = this.initValidator();

    setAvatarBtn.onclick = (e) => {
      e.preventDefault();

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = () => {
        if (input.files && input.files[0]) {
          this.handleFileSelect(input.files[0]);
        }
      };
      input.click();
    };

    submitBtn.onclick = async (e) => {
      e.preventDefault();
      if (this.validator && !this.validator.validateForm()) {
        this.validator.showMessage('Необходимо заполнить название плейлиста');
        return;
      }
      await this.handleSubmit(submitBtn);
    };
  }

  private handleFileSelect(file: File) {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Файл слишком большой (максимум 5МБ)');
      return;
    }

    this.selectedAvatarFile = file;
    this.isAvatarDeleted = false;

    const reader = new FileReader();
    reader.onload = (event) => {
      const avatarPreview = this.overlay?.querySelector('#playlistAvatar') as HTMLImageElement;
      if (avatarPreview && event.target?.result) {
        avatarPreview.src = event.target.result as string;
        this.addDeleteAvatarButton();
      }
    };
    reader.readAsDataURL(file);
  }

  private addDeleteAvatarButton() {
    if (!this.overlay)
      return;

    const container = this.overlay.querySelector('#avatarButtonsContainer');
    const avatarPreview = this.overlay.querySelector('#playlistAvatar') as HTMLImageElement;

    if (!container || container.querySelector('#deleteAvatarBtn')) return;

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

  private async handleSubmit(submitBtn: HTMLButtonElement) {
    if (!this.overlay || !this.validator) return;

    const titleInput = this.overlay.querySelector('#title') as HTMLInputElement;
    const descInput = this.overlay.querySelector('#description') as HTMLInputElement;

    try {
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
      }

      else {
        if (!this.playlistData) return;

        let newAvatarUrl = this.playlistData.image;

        if (this.selectedAvatarFile) {
          const response = await apiServise.uploadPlaylistAvatar(this.selectedAvatarFile, this.playlistData.id);
          newAvatarUrl = getValidImage(response.avatar_url);
        }
        else if (this.isAvatarDeleted) {
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
            image: newAvatarUrl
          });
        }
        this.close(true);
      }

    } catch (err: any) {
      console.error('Ошибка:', err);
      submitBtn.disabled = false;
      submitBtn.textContent = this.mode === 'create' ? 'Создать' : 'Сохранить';

      let msg = 'Произошла ошибка. Попробуйте позже';
      if (err.message === 'bad request') msg = 'Проверьте правильность данных';
      this.validator.showMessage(msg);
    }
  }

  private initValidator() {
    const { validators, info } = FormSchemas.playlist();

    const v = new FormValidator(
      'createPlaylistForm',
      validators,
      info,
      {
        messageSelector: '.general-error',
        submitButtonSelector: '#submitPlaylistOverlay'
      }
    );
    v.init();
    return v;
  }

  private hasUnsavedChanges() {
    if (!this.overlay) return false;

    const titleInput = this.overlay.querySelector('#title') as HTMLInputElement;
    const descInput = this.overlay.querySelector('#description') as HTMLInputElement;

    const currentTitle = titleInput ? titleInput.value.trim() : '';
    const currentDesc = descInput ? descInput.value.trim() : '';

    if (this.selectedAvatarFile || this.isAvatarDeleted) return true;

    if (this.mode === 'create') {
      return currentTitle.length > 0 || currentDesc.length > 0;
    } else {
      const originalTitle = this.playlistData?.title || '';
      const originalDesc = this.playlistData?.description || '';

      return currentTitle !== originalTitle || currentDesc !== originalDesc;
    }
  }

  private close(force = false) {
    if (!this.overlay) return;

    if (!force) {
      if (this.hasUnsavedChanges() && !this.warnedAboutChanges && this.validator) {
        this.validator.showMessage(`Чтобы не потерять изменения, нажми кнопку «${this.mode === 'create' ? 'Создать' : 'Сохранить'}»`, true);
        this.warnedAboutChanges = true;
        return;
      }
    }

    if (this.handleEsc) {
      document.removeEventListener('keydown', this.handleEsc);
      this.handleEsc = null;
    }

    this.overlay.classList.remove('active');
    const overlayToRemove = this.overlay;
    this.overlay = null;

    setTimeout(() => {
      overlayToRemove.remove();
    }, 300);
  }
}

export const playlistModal = new PlaylistModalService();
