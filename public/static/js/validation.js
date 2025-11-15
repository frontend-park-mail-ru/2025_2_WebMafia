export class FormValidator {
  constructor(formId, validators, information, options = {}) {
    this.form = document.getElementById(formId);
    this.validators = validators;
    this.information = information;
    this.submitButtonSelector = options.submitButtonSelector || '.login-button';
    this.messageSelector = options.messageSelector || '#generalError';
    this.submitButton = this.form?.querySelector(this.submitButtonSelector);
    this.touchedFields = {};
    this.messageElement = document.querySelector(this.messageSelector);
    this.setupMessageElement();
  }

  showMessage(message, isSuccess = false) {
    if (!this.messageElement) return;

    this.messageElement.textContent = message;
    this.messageElement.style.color = isSuccess ? '#27ae60' : '#e74c3c';
    this.messageElement.style.backgroundColor = isSuccess ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)';
    this.messageElement.classList.add('show');
  }

  setupMessageElement() {
    if (!this.messageElement) return;
    this.messageElement.style.textAlign = 'center';
    this.messageElement.style.marginBottom = '15px';
    this.messageElement.style.padding = '10px';
    this.messageElement.style.borderRadius = '5px';
  }

  clearMessage() {
    if (this.messageElement) {
      this.messageElement.textContent = '';
      this.messageElement.classList.remove('show');
    }
  }

  showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    const formGroup = document.getElementById(fieldId)?.closest('.form-group');
    if (errorElement && formGroup) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
      formGroup.classList.add('error');
    }
  }
  hideError(fieldId) {
    const errorElement = document.getElementById(fieldId + 'Error');
    const formGroup = document.getElementById(fieldId)?.closest('.form-group');
    if (errorElement && formGroup) {
      errorElement.classList.remove('show');
      formGroup.classList.remove('error');
    }
  }

  showInfo(fieldId, message) {
    const informationElement = document.getElementById(fieldId + 'Information');
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
      informationElement.textContent = message;
    }

    informationElement.classList.add('show');
  }
  hideInfo(fieldId) {
    const informationElement = document.getElementById(fieldId + 'Information');
    if (informationElement) {
      informationElement.classList.remove('show');
    }
  }

  // Проверка одного поля,
  // Чтоб выводить конкретно у него ошибку появившуюся при вводе
  validateFieldForBlur(input) {
    const value = input.value;
    const error = this.validators[input.name]?.(value);

    if (error) {
      this.showError(input.name, error);
    } else {
      this.hideError(input.name);
    }

    // для учтения несовпадений паролей при изменении изначального пароля
    if (input.name === 'password') {
      const confirmInput = this.form.querySelector('[name="passwordConfirm"]');
      if (confirmInput) {
        const confirmError = this.validators.passwordConfirm?.(confirmInput.value);
        if (confirmError && confirmInput.value) {
          this.showError('passwordConfirm', confirmError);
        } else {
          this.hideError('passwordConfirm');
        }
      }
    }

    return !error;
  }

  validateFieldForInput(input) {
    const value = input.value;
    const info = this.information[input.name]?.(value);
    if (info) this.showInfo(input.name, info);
    else this.hideInfo(input.name);
    return !info;
  }

  // Проверка всей формы для кнопки
  // Теперь не положено передавать всю форму для валидации да и возвращать ничего не надо - только кнопку включать
  validateForm() {
    let isValid = true;

    for (const field of Object.keys(this.validators)) {
      const input = this.form.querySelector(`[name="${field}"]`);
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
    if (!this.form) return;

    // обработчик отправки
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.validateForm()) {
        const formData = new FormData(this.form);
        this.clearMessage();
        this.onSubmit(formData);
      }
    });

    // обработка каждого поля
    // При вводе или переключении проверяем и выводим сообщения валидации только у трогаемых полей
    // Также всегда используем validateForm() чтоб активировать или дезактивировать кнопку submit
    this.form.querySelectorAll('input').forEach((input) => {
      this.touchedFields[input.name] = false;

      ['input', 'click'].forEach((event) =>
        input.addEventListener(event, () => {
          this.hideError(input.name);
          this.touchedFields[input.name] = true;
          this.validateFieldForInput(input);
          this.validateForm();
        })
      );

      input.addEventListener('blur', () => {
        this.hideInfo(input.name);
        if (this.touchedFields[input.name]) {
          this.validateFieldForBlur(input);
        }
        this.validateForm();
      });
    });
  }

  onSubmit(formData) {
    console.log('Form submitted with:', Object.fromEntries(formData));
  }
}
