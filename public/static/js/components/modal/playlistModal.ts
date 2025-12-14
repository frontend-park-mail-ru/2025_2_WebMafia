import { BaseFormModal, BaseModal } from './baseModal';
import { apiServise } from '@/data';
import { router } from '@/routing';
import { images } from '@/assets';
import { FormSchemas } from '@/utils/validationRules';
import { getValidImage } from '@/utils/parsers';

export interface PlaylistModalData {
  id?: string;
  title?: string;
  description?: string;
  image?: string;
  isEdit: boolean;
}

export interface PlaylistSuccessData {
  id: string;
  title: string;
  description: string;
  image: string | null;
}

export class PlaylistModal extends BaseFormModal<PlaylistModalData> {
  private onSuccessCallback: ((data: PlaylistSuccessData) => void) | null = null;

  public open(data: PlaylistModalData, onSuccess?: (data: PlaylistSuccessData) => void) {
    this.onSuccessCallback = onSuccess || null;
    this.render(data);
  }

  protected getModalConfig(): BaseModal {
    const isEdit = this.data?.isEdit;
    return {
      modalId: 'playlistOverlay',
      modalTitle: isEdit ? 'Редактировать плейлист' : 'Создать плейлист',
      formId: 'createPlaylistForm',
      submitBtnId: 'submitPlaylistOverlay',
      submitText: isEdit ? 'Сохранить' : 'Создать',
      errorId: 'generalError',
      avatarSrc: (isEdit && this.data?.image) ? this.data.image : images.defaultPlaylistPath,
      avatarLetter: ''
    };
  }

  protected getFormHtml(): string {
    const template = Handlebars.templates['playlistInputs.hbs'];
    return template({
      title: this.data?.title || '',
      description: this.data?.description || ''
    });
  }

  protected getValidationConfig() {
    return FormSchemas.playlist();
  }

  protected hasUnsavedChanges(): boolean {
    if (!this.overlay || !this.data) return false;

    if (this.selectedAvatarFile || this.isAvatarDeleted) return true;

    const titleInput = this.overlay.querySelector('#title') as HTMLInputElement;
    const descInput = this.overlay.querySelector('#description') as HTMLInputElement;

    const currentTitle = titleInput ? titleInput.value.trim() : '';
    const currentDesc = descInput ? descInput.value.trim() : '';

    if (this.data.isEdit) {
      return currentTitle.length > 0 || currentDesc.length > 0;
    } else {
      const originalTitle = this.data.title || '';
      const originalDesc = this.data.description || '';

      return currentTitle !== originalTitle || currentDesc !== originalDesc;
    }
  }

  protected async handleSubmit(btn: HTMLButtonElement): Promise<void> {
    const titleInput = document.getElementById('title') as HTMLInputElement;
    const descInput = document.getElementById('description') as HTMLInputElement;

    const title = titleInput.value.trim();
    const description = descInput.value.trim();

    try {
      btn.disabled = true;
      btn.textContent = 'Загрузка...';

      if (this.data?.isEdit && this.data.id) {
        await this.handleEdit(this.data.id, title, description);
      } else {
        await this.handleCreate(title, description);
      }

    } catch (err: any) {
      console.error('Playlist Modal Error:', err);
      btn.disabled = false;
      btn.textContent = this.data?.isEdit ? 'Сохранить' : 'Создать';

      let msg = 'Произошла ошибка. Попробуйте позже';
      if (err.message?.includes('bad request')) msg = 'Проверьте правильность данных';

      this.validator?.showMessage(msg);
    }
  }

  private async handleCreate(title: string, description: string) {
    const response = await apiServise.createPlaylist(title, description);

    if (this.selectedAvatarFile) {
      await apiServise.uploadPlaylistAvatar(this.selectedAvatarFile, response.id);
    }

    this.close(true);
    router.navigate(`/playlist/${response.id}`);
  }

  private async handleEdit(id: string, title: string, description: string) {
    let newAvatarUrl = this.data?.image || null;

    if (this.selectedAvatarFile) {
      const response = await apiServise.uploadPlaylistAvatar(this.selectedAvatarFile, id);
      newAvatarUrl = getValidImage(response.avatar_url);
    } else if (this.isAvatarDeleted) {
      await apiServise.deletePlaylistAvatar(id);
      newAvatarUrl = null;
    }

    if (title !== this.data?.title || description !== this.data?.description) {
      await apiServise.updatePlaylist(title, description, id);
    }

    if (this.onSuccessCallback) {
      this.onSuccessCallback({
        id,
        title,
        description,
        image: newAvatarUrl
      });
    }

    this.close(true);
  }
}

export const playlistModal = new PlaylistModal();
