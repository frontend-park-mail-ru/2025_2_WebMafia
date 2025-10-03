export class FormValidator {
    constructor(formId, validators) {
        this.form = document.getElementById(formId);
        this.validators = validators;
        this.submitButton = this.form?.querySelector(".login-button");
        this.touchedFields = {};
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

    // Проверка одного поля,
    // Чтоб выводить конкретно у него ошибку появившуюся при вводе
    validateField(input) {
        const value = input.value
        const error = this.validators[input.name](value);

        if (error) {
            this.showError(input.name, error);
            return false;
        } else {
            this.hideError(input.name);
            return true;
        }
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

            input.addEventListener('input', () => {
                this.touchedFields[input.name] = true;
                this.validateField(input);
                this.validateForm();
            });

            input.addEventListener('blur', () => {
                if (this.touchedFields[input.name]) {
                    this.validateField(input);
                }
                this.validateForm();
            });
        });
    }

    onSubmit(formData) {
        console.log('Form submitted with:', Object.fromEntries(formData));
    }
}