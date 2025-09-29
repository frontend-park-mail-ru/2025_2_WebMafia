
import { FormValidator } from './validation.js';
import { apiServise } from '../../data.js';
import { Router } from '../../routing.js';

export class LoginPage {
    async render() {
        const contentTemplate = Handlebars.templates['login.hbs'];
        document.getElementById('app').innerHTML = contentTemplate();
        this.initValidation();
    }

    initValidation() {
        const validators = {
            login: (value) => {
                if (!value.trim()) return 'Поле обязательно для заполнения';
                if (value.length < 5) return 'Имя пользователя слишком короткое';
                return null;
            },
            password: (value) => {
                if (!value) return 'Поле обязательно для заполнения';
                if (value.length < 8) return 'Пароль должен содержать минимум 8 символов';
                return null;
            }
        };

        const validator = new FormValidator('loginForm', validators);
        
        validator.onSubmit = async (formData) => {
            const login = formData.get('login');
            const password = formData.get('password');
            
            try {
                const response = await apiServise.loginUser(login, password);
                
                console.log('Login successful:', response);
                
                localStorage.setItem('isAuthenticated', 'true');
                
                new Router().navigate('/');

            } catch (error) {
                console.error('Login failed:', error.message);
                
                let errorMessage = 'Произошла неизвестная ошибка. Попробуйте снова.';
                
                if (error.message === 'unauthorized') {
                    errorMessage = 'Неверное имя пользователя или пароль.';
                } else if (error.message === 'bad request') {
                    errorMessage = 'Некорректный запрос. Проверьте введенные данные.';
                }
                
                this.showMessage(errorMessage, false);
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