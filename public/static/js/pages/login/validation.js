export class FormValidator {
  constructor(formId, validators) {
    this.form = document.getElementById(formId);
    this.validators = validators;
  }

  showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    const inputElement = document.getElementById(fieldId);

    if (errorElement && inputElement) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
      inputElement.parentElement.classList.add('error');
    }
  }

  hideError(fieldId) {
    const errorElement = document.getElementById(fieldId + 'Error');
    const inputElement = document.getElementById(fieldId);

    if (errorElement && inputElement) {
      errorElement.classList.remove('show');
      inputElement.parentElement.classList.remove('error');
    }
  }

  validateForm(formData) {
    let isValid = true;

    Object.keys(this.validators).forEach((field) => {
      const value = formData.get(field);
      const error = this.validators[field](value);

      if (error) {
        this.showError(field, error);
        isValid = false;
      } else {
        this.hideError(field);
      }
    });

    return isValid;
  }

  init() {
    if (!this.form) return;

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(this.form);

      if (this.validateForm(formData)) {
        // Действия при успешной валидации
        this.onSubmit(formData);
      }
    });

    // Реальная-time валидация
    this.form.querySelectorAll('input').forEach((input) => {
      input.addEventListener('blur', () => {
        const value = input.value;
        const error = this.validators[input.name](value);

        if (error) {
          this.showError(input.name, error);
        } else {
          this.hideError(input.name);
        }
      });

      input.addEventListener('input', () => {
        this.hideError(input.name);
      });
    });
  }

  onSubmit(formData) {
    console.log('Form submitted with:', Object.fromEntries(formData));
  }
}
