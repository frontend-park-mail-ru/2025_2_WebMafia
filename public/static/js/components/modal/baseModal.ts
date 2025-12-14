import { FormValidator, ValidatorsConfig, InformationConfig } from '@/utils/validation';
import { images } from '@/assets';

export interface BaseModal {
  modalId: string;
  modalTitle: string;
  formId: string;
  submitBtnId: string;
  submitText: string;
  errorId: string;
  avatarSrc?: string | null;
  avatarLetter?: string;
}

export abstract class BaseFormModal<TData> {
  protected overlay: HTMLElement | null = null;
  protected data: TData | null = null;

  protected selectedAvatarFile: File | null = null;
  protected isAvatarDeleted = false;
  protected validator: FormValidator | null = null;
  protected warnedAboutChanges = false;

  protected abstract getModalConfig(): BaseModal;
  protected abstract getFormHtml(): string;
  protected abstract handleSubmit(btn: HTMLButtonElement): Promise<void>;
  protected abstract getValidationConfig(): { validators: ValidatorsConfig, info: InformationConfig };
  protected abstract hasUnsavedChanges(): boolean;

  protected afterRenderHook(): void {}

  public render(data: TData) {
    this.data = data;
    const existing = document.querySelector('.overlay');
    if (existing) existing.remove();

    const config = this.getModalConfig();
    const layoutTemplate = Handlebars.templates['modal.hbs'];

    const html = layoutTemplate({
      ...config,
      formContent: this.getFormHtml()
    });

    this.createDOM(html);
    if (config.avatarSrc && config.avatarSrc !== images.defaultPlaylistPath) {
      this.renderDeleteAvatarBtn();
    }
    this.initValidator(config);
    this.bindCommonEvents();

    this.afterRenderHook();

    requestAnimationFrame(() => this.overlay?.classList.add('active'));
  }

  private createDOM(html: string) {
    const div = document.createElement('div');
    div.innerHTML = html;
    this.overlay = div.firstElementChild as HTMLElement;
    document.body.appendChild(this.overlay);
  }

  private bindCommonEvents() {
    if (!this.overlay) return;

    const closeBtn = this.overlay.querySelector('.close-button') as HTMLButtonElement;
    closeBtn.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    const setAvatarBtn = document.getElementById('setAvatarBtn') as HTMLButtonElement;
    setAvatarBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = () => {
             if (input.files?.[0]) this.handleFileSelect(input.files[0]);
        };
        input.click();
    });

    const config = this.getModalConfig();
    const submitBtn = document.getElementById(config.submitBtnId) as HTMLButtonElement;
    submitBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (this.validator && !this.validator.validateForm()) return;
      await this.handleSubmit(submitBtn);
    });
  }

  private handleFileSelect(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      alert('Файл слишком большой');
      return;
    }
    this.selectedAvatarFile = file;
    this.isAvatarDeleted = false;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.updateAvatarPreview(e.target?.result as string);
      this.renderDeleteAvatarBtn();
    };
    reader.readAsDataURL(file);
  }

  protected updateAvatarPreview(src: string | null) {
    const container = document.getElementById('avatarContainer');
    if (!container) return;

    if (src) {
      container.innerHTML = `<img src="${src}" class="profile-image" id="avatarPreview" />`;
    } else {
      const config = this.getModalConfig();
      container.innerHTML = `<div class="default-avatar profile-edit-avatar">${config.avatarLetter || ''}</div>`;
    }
  }

  protected renderDeleteAvatarBtn() {
    const container = document.getElementById('avatarButtonsContainer');
    if (!container || document.getElementById('deleteAvatarBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'deleteAvatarBtn';
    btn.className = 'secondary-button save-avatar-button-size';
    btn.textContent = 'Удалить фото';
    btn.onclick = (e) => {
      e.preventDefault();
      this.selectedAvatarFile = null;
      this.isAvatarDeleted = true;
      this.updateAvatarPreview(null);
      btn.remove();
    };
    container.appendChild(btn);
  }

  private initValidator(config: BaseModal) {
    const { validators, info } = this.getValidationConfig();
    this.validator = new FormValidator(config.formId, validators, info, {
      messageSelector: `#${config.errorId}`
    });
    this.validator.init();
  }

  public close(force = false) {
    if (!this.overlay) return;

    if (!force) {
      if (this.hasUnsavedChanges() && !this.warnedAboutChanges) {
        const btnText = this.getModalConfig().submitText;
        this.validator?.showMessage(`Чтобы не потерять изменения, нажми кнопку «${btnText}»`, true);

        this.warnedAboutChanges = true;
        return;
      }
    }

    this.overlay.classList.remove('active');

    this.warnedAboutChanges = false;

    const elToRemove = this.overlay;
    this.overlay = null;
    setTimeout(() => elToRemove.remove(), 300);
  }
}