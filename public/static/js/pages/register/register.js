import { FormValidator } from '../../validation.js';
import { apiServise } from '../../data.js';
import { router } from '../../routing.js';
import { initPasswordShowing } from '../../eye.js';

export class RegistrationPage {
  async render() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      router.navigate('/');
    }
    const contentTemplate = Handlebars.templates['register.hbs'];
    document.getElementById('app').innerHTML = contentTemplate();

    this.initPasswordShowing();
    this.initValidation();
  }

  initValidation() {
    const validators = {
      email: (value) => {
        if (!value.trim()) return 'Поле обязательно для заполнения';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Некорректный формат email';
        return null;
      },
      login: (value) => {
        if (!value.trim()) return 'Поле обязательно для заполнения';

        if (value.length < 5) return 'Логин должен содержать минимум 5 символов';

        if (value.length < 5) return 'Слишком короткое имя пользователя';

        return null;
      },
      password: (value) => {
        if (!value) return 'Поле обязательно для заполнения';

        if (value.length < 8) return 'Слишком короткий пароль';
        return null;
      },
      passwordConfirm: (value) => {
        if (!value) return 'Поле обязательно для заполнения';
        const passwordInput = document.getElementById('password');
        if (value !== passwordInput.value) {
          return 'Пароли не совпадают';
        }
        return null;
      },
    };

    const information = {
      email: (value) => {
        const errors = [];
        if (!/\S+@\S+\.\S+/.test(value)) {
          errors.push('Почта должна быть в формате address@domain.com');
        }
        return errors.length ? errors : null;
      },
      login: (value) => {
        const errors = [];
        if (value.length < 5) {
          errors.push('Логин должен содержать минимум 5 символов');
        }
        return errors.length ? errors : null;
      },
      password: (value) => {
        const errors = [];
        const passwordConfirm = document.getElementById('passwordConfirm');
        if (value.length < 8) {
          errors.push('Пароль должен содержать минимум 8 символов');
        }
        if (value !== passwordConfirm.value) {
          errors.push('Пароли должны совпадать');
        }
        return errors.length ? errors : null;
      },
      passwordConfirm: (value) => {
        const errors = [];
        const password = document.getElementById('password');
        if (value.length < 8) {
          errors.push('Пароль должен содержать минимум 8 символов');
        }
        if (value !== password.value) {
          errors.push('Пароли должны совпадать');
        }
        return errors.length ? errors : null;
      },
    };

    const validator = new FormValidator('registerForm', validators, information);

    validator.onSubmit = async (formData) => {
      const email = formData.get('email');
      const login = formData.get('login');
      const password = formData.get('password');

      try {
        await apiServise.registerUser(login, email, password);
        console.log('Registration successful');

        console.log('Attempting auto-login after registration...');
        await apiServise.loginUser(login, password);

        console.log('Auto-login successful');

        localStorage.setItem('isAuthenticated', 'true');
        router.navigate('/');
      } catch (error) {
        console.error('Registration or auto-login failed:', error.message);

        let errorMessage = 'Произошла неизвестная ошибка. Попробуйте снова.';

        if (error.message === 'resource conflict') {
          errorMessage = 'Пользователь с таким именем или email уже существует.';
        } else if (error.message === 'bad request') {
          errorMessage = 'Некорректные данные. Проверьте все поля.';
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
