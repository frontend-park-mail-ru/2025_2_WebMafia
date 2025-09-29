export class FormValidator {
    constructor(formId, validators) {
        this.form = document.getElementById(formId);
        this.validators = validators;
        this.isInitialized = false;
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

    showGeneralError(message) {
        const generalError = document.getElementById('generalError');
        if (generalError) {
            generalError.textContent = message;
            generalError.classList.add('show');
        }
    }

    hideGeneralError() {
        const generalError = document.getElementById('generalError');
        if (generalError) {
            generalError.classList.remove('show');
        }
    }

    validateForm(formData) {
        let isValid = true;
        this.hideGeneralError();
        
        Object.keys(this.validators).forEach(field => {
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
        if (!this.form) {
            console.error('Form not found with id: loginForm');
            return;
        }

        // Предотвращаем множественную инициализацию
        if (this.isInitialized) {
            return;
        }

        console.log('Initializing form validation'); // для отладки

        this.form.addEventListener('submit', (e) => {
            console.log('Submit event triggered'); // для отладки
            e.preventDefault(); // ОБЯЗАТЕЛЬНО предотвращаем отправку формы
            
            const formData = new FormData(this.form);
            
            if (this.validateForm(formData)) {
                // Блокируем кнопку на время обработки
                const submitButton = this.form.querySelector('button[type="submit"]');
                const originalText = submitButton.textContent;
                
                submitButton.textContent = 'Вход...';
                submitButton.disabled = true;
                
                // Вызываем колбэк и восстанавливаем кнопку после завершения
                Promise.resolve(this.onSubmit(formData)).finally(() => {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                });
            } else {
                console.log('Form validation failed');
            }
        });

        // Реальная-time валидация
        this.form.querySelectorAll('input').forEach(input => {
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
                this.hideGeneralError();
            });
        });

        this.isInitialized = true;
    }

    onSubmit(formData) {
        console.log('Form submitted with:', Object.fromEntries(formData));
        return Promise.resolve();
    }
}