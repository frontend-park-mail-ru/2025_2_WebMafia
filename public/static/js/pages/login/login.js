import { FormValidator } from './validation.js';
import { apiServise } from '../../data.js';

export class LoginPage {
    async render() {
        const contentTemplate = Handlebars.templates['login.hbs'];
        document.getElementById('app').innerHTML = contentTemplate();
        const data = await apiServise.getUserAuth();
        this.initValidation(data);
    }

    initValidation(authData) {
        const validators = {
            email: (value) => {
                if (!value.trim()) return 'Поле обязательно для заполнения';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
                    return 'Введите корректный email или имя пользователя';
                }
                return null;
            },
            
            password: (value) => {
                if (!value) return 'Поле обязательно для заполнения';
                if (value.length < 6) return 'Пароль должен содержать минимум 6 символов';
                return null;
            }
        };

        const validator = new FormValidator('loginForm', validators);
        
        validator.onSubmit = async (formData) => {
            const email = formData.get('email');
            const password = formData.get('password');
            
            // Проверяем совпадение с тестовыми данными
            const isEmailValid = email === authData.login;
            const isPasswordValid = password === authData.password;
            
            if (isEmailValid && isPasswordValid) {
                // Успешная авторизация
                // this.showMessage('Авторизация успешна! Перенаправление...', true);
                
                // Сохраняем статус авторизации
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('user', JSON.stringify(authData));
                
                // Редирект на главную страницу
                setTimeout(() => {
                    window.location.href = '/';
                }, 500);
            } else {
                // Неверные данные
                this.showMessage('Неверный логин или пароль', false);
            }
        };
        
        validator.init();
        this.setupMessageElement();
    }

    showMessage(message, isSuccess = false) {
        const messageElement = document.getElementById('generalError');
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.style.color = isSuccess ? '#27ae60' : '#e74c3c';
            messageElement.style.backgroundColor = isSuccess ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)';
            messageElement.classList.add('show');
        }
    }

    setupMessageElement() {
        const messageElement = document.getElementById('generalError');
        if (messageElement) {
            messageElement.style.textAlign = 'center';
            messageElement.style.marginBottom = '15px';
            messageElement.style.padding = '10px';
            messageElement.style.borderRadius = '5px';
        }
    }
}