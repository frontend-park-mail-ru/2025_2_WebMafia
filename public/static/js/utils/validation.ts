export type ValidatorFn = (value: string) => string | null;

export type InfoFn = (value: string) => string | string[] | null;

export interface ValidatorsConfig {
  [fieldName: string]: ValidatorFn;
}

export interface InformationConfig {
  [fieldName: string]: InfoFn;
}

export interface ValidatorOptions {
  submitButtonSelector?: string;
  messageSelector?: string;
}

export class FormValidator {
  private form: HTMLFormElement | null;
  private validators: ValidatorsConfig;
  private information: InformationConfig;
  private submitButton: HTMLButtonElement | null;
  private messageElement: HTMLElement | null;
  private touchedFields: Record<string, boolean>;

  public onSubmit: (formData: FormData) => void;

  constructor(formId: string, validators: ValidatorsConfig, information: InformationConfig, options: ValidatorOptions = {}) {
    this.form = document.getElementById(formId) as HTMLFormElement;
    this.validators = validators;
    this.information = information;
    const submitButtonSelector = options.submitButtonSelector || '.login-button';
    const messageSelector = options.messageSelector || '#generalError';
    this.submitButton = this.form?.querySelector<HTMLButtonElement>(submitButtonSelector);
    this.touchedFields = {};
    this.messageElement = document.querySelector<HTMLElement>(messageSelector);
    this.onSubmit = (formData) => {
      console.log('Form submitted with:', Object.fromEntries(formData));
    };
    this.setupMessageElement();
  }

  public showMessage(message: string, isSuccess: boolean = false): void {
    if (!this.messageElement) return;

    this.messageElement.textContent = message;
    this.messageElement.style.backgroundColor = isSuccess ? '#1b96cd' : '#e74c3c';
    this.messageElement.classList.add('show');
  }

  private setupMessageElement(): void {
    if (!this.messageElement) return;
    this.messageElement.style.textAlign = 'center';
    this.messageElement.style.marginBottom = '15px';
    this.messageElement.style.padding = '10px';
    this.messageElement.style.borderRadius = '5px';
  }

  private clearMessage() {
    if (this.messageElement) {
      this.messageElement.textContent = '';
      this.messageElement.classList.remove('show');
    }
  }

  private showError(fieldId: string, message: string): void {
    const errorElement = document.getElementById(`${fieldId}Error`);
    const formGroup = document.getElementById(fieldId)?.closest('.form-group');
    if (errorElement && formGroup) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
      formGroup.classList.add('error');
    }
  }

  private hideError(fieldId: string): void {
    const errorElement = document.getElementById(`${fieldId}Error`);
    const formGroup = document.getElementById(fieldId)?.closest('.form-group');
    if (errorElement && formGroup) {
      errorElement.classList.remove('show');
      formGroup.classList.remove('error');
    }
  }

  private showInfo(fieldId: string, message: string | string[]): void {
    const informationElement = document.getElementById(`${fieldId}Information`);
    if (!informationElement) return;

    if (Array.isArray(message) && message.length > 1) {
      const ul = document.createElement('ul');
      message.forEach((msg) => {
        const li = document.createElement('li');
        li.textContent = msg;
        ul.appendChild(li);
      });
      informationElement.innerHTML = '';
      informationElement.appendChild(ul);
    } else {
      informationElement.textContent = Array.isArray(message) ? message[0] : message;
    }

    informationElement.classList.add('show');
  }

  private hideInfo(fieldId: string): void {
    const informationElement = document.getElementById(`${fieldId}Information`);
    if (informationElement) {
      informationElement.classList.remove('show');
    }
  }

  // Проверка одного поля,
  // Чтоб выводить конкретно у него ошибку появившуюся при вводе
  private validateFieldForBlur(input: HTMLInputElement | HTMLTextAreaElement): boolean {
    const value = input.value;
    const error = this.validators[input.name]?.(value);

    if (error) {
      this.showError(input.name, error);
    } else {
      this.hideError(input.name);
    }

    // для учтения несовпадений паролей при изменении изначального пароля
    if (input.name === 'password' && this.form) {
      const confirmInput = this.form.querySelector<HTMLInputElement>('[name="passwordConfirm"]');
      if (confirmInput && confirmInput.value) {
        const confirmValidator = this.validators['passwordConfirm'];
        const confirmError = confirmValidator ? confirmValidator(confirmInput.value) : null;
        if (confirmError && confirmInput.value) {
          this.showError('passwordConfirm', confirmError);
        } else {
          this.hideError('passwordConfirm');
        }
      }
    }

    return !error;
  }

  private validateFieldForInput(input: HTMLInputElement | HTMLTextAreaElement): boolean {
    const value = input.value;
    const infoFn = this.information[input.name];
    const info = infoFn ? infoFn(value) : null;

    if (info) {
      this.showInfo(input.name, info);
    }
    else {
      this.hideInfo(input.name);
    }
    return !info;
  }

  // Проверка всей формы для кнопки
  // Теперь не положено передавать всю форму для валидации да и возвращать ничего не надо - только кнопку включать
  public validateForm(): boolean {
    if (!this.form) return false;

    let isValid = true;

    for (const field of Object.keys(this.validators)) {
      const input = this.form.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${field}"]`);
      if (!input) continue;
      const error = this.validators[field](input.value);
      if (error) {
        isValid = false;
        break;
      }
    }

    if (this.submitButton) {
      this.submitButton.disabled = !isValid;
    }

    return isValid;
  }

  init() {
    if (!this.form) {
      console.warn('FormValidator: Form element not found');
      return;
    }

    // обработчик отправки
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.validateForm()) {
        const formData = new FormData(this.form as HTMLFormElement);
        this.clearMessage();
        this.onSubmit(formData);
      }
    });

    // обработка каждого поля
    // При вводе или переключении проверяем и выводим сообщения валидации только у трогаемых полей
    // Также всегда используем validateForm() чтоб активировать или дезактивировать кнопку submit
    const inputs = this.form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea');

    inputs.forEach((input) => {
      const name = input.name;
      this.touchedFields[name] = false;

      ['input', 'click'].forEach((event) =>
        input.addEventListener(event, () => {
          this.hideError(name);
          this.touchedFields[name] = true;
          this.validateFieldForInput(input);
          this.validateForm();
        })
      );

      input.addEventListener('blur', () => {
        this.hideInfo(name);
        if (this.touchedFields[name]) {
          this.validateFieldForBlur(input);
        }
        this.validateForm();
      });
    });
  }
}
