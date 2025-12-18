import { BaseFormModal, BaseModal } from './baseModal.ts';
import { apiServise } from '@/data';
import { initPasswordShowing } from '@/eye';
import { FormSchemas } from '@/utils/validationRules';
import { getValidImage } from '@/utils/parsers';
import { setupMarquees } from '@/utils/marquee';
import { showInfoMessage } from '@/utils/showInfoMessage';

export interface ProfileModalData {
  nickname: string;
  email: string;
  avatar: string | null;
  letter: string;
}

export class ProfileModal extends BaseFormModal<ProfileModalData> {
  private onSaveSuccess: ((data: ProfileModalData) => void) | null = null;

  public open(data: ProfileModalData, onSuccess?: (data: ProfileModalData) => void) {
    this.onSaveSuccess = onSuccess || null;
    this.render(data);
  }

  protected getModalConfig(): BaseModal {
    return {
      modalId: 'editProfileOverlay',
      modalTitle: 'Редактировать профиль',
      formId: 'editProfileForm',
      submitBtnId: 'saveProfileChangesButton',
      submitText: 'Сохранить изменения',
      errorId: 'generalErrorProfile',
      avatarSrc: this.data?.avatar,
      avatarLetter: this.data?.letter || '?',
    };
  }

  protected getFormHtml(): string {
    const template = Handlebars.templates['profileInputs.hbs'];
    return template({
      email: this.data?.email,
      nickname: this.data?.nickname,
    });
  }

  protected getValidationConfig() {
    return FormSchemas.profile('editProfileForm');
  }

  protected afterRenderHook() {
    initPasswordShowing();
  }

  protected hasUnsavedChanges(): boolean {
    if (!this.overlay || !this.data) return false;

    if (this.selectedAvatarFile || (this.isAvatarDeleted && this.data.avatar)) return true;

    const emailInput = this.overlay.querySelector('#email') as HTMLInputElement;
    const loginInput = this.overlay.querySelector('#login') as HTMLInputElement;
    const passInput = this.overlay.querySelector('#password') as HTMLInputElement;

    const currentEmail = emailInput ? emailInput.value : '';
    const currentLogin = loginInput ? loginInput.value : '';
    const currentPass = passInput ? passInput.value : '';

    const originalEmail = this.data.email || '';
    const originalLogin = this.data.nickname || '';

    if (currentEmail !== originalEmail || currentLogin !== originalLogin || currentPass.length > 0) {
      return true;
    }

    return false;
  }

  protected updateAvatarPreview(src: string | null) {
    const container = document.getElementById('avatarContainer');
    if (!container) return;

    if (src) {
      container.innerHTML = `<img src="${src}" class="profile-image" id="avatarPreview" />`;
    } else {
      container.innerHTML = `<div class="default-avatar profile-edit-avatar">${this.data?.letter || ''}</div>`;
    }
  }

  protected async handleSubmit(btn: HTMLButtonElement): Promise<void> {
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const loginInput = document.getElementById('login') as HTMLInputElement;
    const passInput = document.getElementById('password') as HTMLInputElement;

    const email = emailInput.value;
    const login = loginInput.value;
    const password = passInput.value;

    try {
      btn.disabled = true;
      btn.textContent = 'Сохранение...';

      let newAvatarUrl = this.data?.avatar || null;

      if (this.selectedAvatarFile) {
        const response = await apiServise.uploadAvatar(this.selectedAvatarFile);
        newAvatarUrl = getValidImage(response.avatar_url);
      } else if (this.isAvatarDeleted) {
        await apiServise.deleteAvatar();
        newAvatarUrl = null;
      }

      let newLogin = this.data?.nickname || '';
      let newEmail = this.data?.email || '';

      const isInfoChanged =
        email !== this.data?.email || login !== this.data?.nickname || (password && password.length > 0);

      if (isInfoChanged) {
        const response = await apiServise.editUser(login, email, password || undefined);
        newLogin = response.Login;
        newEmail = response.Email;
      }

      if (this.onSaveSuccess) {
        this.onSaveSuccess({
          nickname: newLogin,
          email: newEmail,
          avatar: newAvatarUrl,
          letter: newLogin[0] ? newLogin[0].toUpperCase() : '?',
        });
      }

      setupMarquees();
      this.close(true);
      showInfoMessage('Изменения успешно сохранены!');
    } catch (err: any) {
      console.error('Profile Edit Error:', err);
      btn.disabled = false;
      btn.textContent = 'Сохранить изменения';

      let msg = 'Не удалось сохранить изменения.';
      if (err.message?.includes('conflict')) msg = 'Пользователь с такими данными уже существует.';
      if (err.message?.includes('bad request')) msg = 'Проверьте правильность введенных данных.';

      this.validator?.showMessage(msg);
    }
  }
}

export const profileModal = new ProfileModal();
