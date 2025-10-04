export class FormValidator {
    constructor(formId, validators) {
        this.form = document.getElementById(formId);
        this.validators = validators;
        this.submitButton = this.form?.querySelector(".login-button");
        this.touchedFields = {};
    }

    showError(fieldId, message) {
        this.hideInfo(fieldId);
        const errorElement = document.getElementById(fieldId + 'Error');
        const formGroup = document.getElementById(fieldId).closest('.form-group');

        if (errorElement && formGroup) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            formGroup.classList.add('error');
        }
    }
    showInfo(fieldId, message) {
        this.hideError(fieldId);
        const informationElement = document.getElementById(fieldId + 'Information');

        if (informationElement) {
            informationElement.textContent = message;
            informationElement.classList.add('show');
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
    hideInfo(fieldId) {
        const informationElement = document.getElementById(fieldId + 'Information');

        if (informationElement) {
            informationElement.classList.remove('show');
        }
    }

    // Проверка одного поля,
    // Чтоб выводить конкретно у него ошибку появившуюся при вводе
    validateFieldForBlur(input, eventType) {
        const value = input.value
        const error = this.validators[input.name](value);

        if (error) {
            this.showError(input.name, error, eventType);
        } else {
            this.hideError(input.name, eventType);
        }

        // для учтения несовпадений паролей при изменении изначального пароля
        if (input.name === 'password') {
            const confirmInput = this.form.querySelector('[name="passwordConfirm"]');
            if (confirmInput) {
                const confirmError = this.validators.passwordConfirm(confirmInput.value);
                if (confirmError) {
                    this.showError('passwordConfirm', confirmError, eventType);
                } else {
                    this.hideError('passwordConfirm', eventType);
                }
            }
        }

        return !error
    }

    validateFieldForInput(input, eventType) {
        const value = input.value;
        const error = this.validators[input.name](value);

        if (error) {
            this.showInfo(input.name, error, eventType);
        } else {
            this.hideInfo(input.name, eventType);
        }

        // для учтения несовпадений паролей при изменении изначального пароля
        if (input.name === 'password') {
            const confirmInput = this.form.querySelector('[name="passwordConfirm"]');
            if (confirmInput) {
                const confirmError = this.validators.passwordConfirm(confirmInput.value);
                if (confirmError) {
                    this.showInfo('passwordConfirm', confirmError, eventType);
                } else {
                    this.hideInfo('passwordConfirm', eventType);
                }
            }
        }

        return !error
    }

    // Проверка всей формы для кнопки
    // Теперь не положено передавать всю форму для валидации да и возвращать ничего не надо - только кнопку включать
    validateForm() {
        let isValid = true;

        for (const field of Object.keys(this.validators)) {
            const input = this.form.querySelector(`[name="${field}"]`);
            const error = this.validators[field](input.value);
            if (error) {
                isValid = false;
                break;
            }
        }

        if (this.submitButton) {
            this.submitButton.disabled = !isValid;
        }
    }

    init() {
        if (!this.form) return;

        // обработчик отправки
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            // Теперь проверка валидации при нажатии на кнопку не нужна т.к.
            // Можно нажать на кнопку только пройдя валидацию
            const formData = new FormData(this.form);
            this.onSubmit(formData);
        });

        // обработка каждого поля
        // При вводе или переключении проверяем и выводим сообщения валидации только у трогаемых полей
        // Также всегда используем validateForm() чтоб активировать или дезактивировать кнопку submit
        this.form.querySelectorAll('input').forEach(input => {
            this.touchedFields[input.name] = false;

            ['input', 'click'].forEach(event =>
                input.addEventListener(event, () => {
                    this.touchedFields[input.name] = true;
                    this.validateFieldForInput(input);
                    this.validateForm();
                })
            );

            input.addEventListener('blur', () => {
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