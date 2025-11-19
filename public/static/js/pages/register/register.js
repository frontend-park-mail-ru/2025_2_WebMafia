import { FormValidator } from '../../validation.js';
import { apiServise } from '../../data.js';
import { router } from '../../routing.js';
import { initPasswordShowing } from '../../eye.js';
import { player } from '../player/player.js';

export class RegistrationPage {
  async render() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      router.navigate('/');
    }
    const contentTemplate = Handlebars.templates['register.hbs'];
    document.getElementById('app').innerHTML = contentTemplate();
    initPasswordShowing();
    this.initValidation();
  }

  initValidation() {
    const validators = {
      email: (value) => {
        if (!value.trim()) return 'Обязательно для заполнения';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Некорректный формат';
        return null;
      },
      login: (value) => {
        if (!value.trim()) return 'Обязательно для заполнения';
        if (value.length < 5) return 'Слишком короткое имя пользователя';
        return null;
      },
      password: (value) => {
        if (!value) return 'Обязательно для заполнения';
        if (value.length < 8) return 'Слишком короткий пароль';
        return null;
      },
      passwordConfirm: (value) => {
        if (!value) return 'Обязательно для заполнения';
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
          errors.push('Формат: example@mail.com');
        }
        return errors.length ? errors : null;
      },
      login: (value) => {
        const errors = [];
        if (value.length < 5) {
          errors.push('Минимум 5 символов');
        } else if (value.length > 35) {
          errors.push('Максимум 35 символов');
        }
        return errors.length ? errors : null;
      },
      password: (value) => {
        const errors = [];
        const passwordConfirm = document.getElementById('passwordConfirm');
        if (value.length < 8) {
          errors.push('Минимум 8 символов');
        }
        if (value !== passwordConfirm.value) {
          errors.push('Пароли не совпадают');
        }
        return errors.length ? errors : null;
      },
      passwordConfirm: (value) => {
        const errors = [];
        const password = document.getElementById('password');
        if (value.length < 8) {
          errors.push('Минимум 8 символов');
        }
        if (value !== password.value) {
          errors.push('Пароли не совпадают');
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
        await player.init();
      } catch (error) {
        let msg = 'Ошибка регистрации';
        if (error.message === 'resource conflict') msg = 'Пользователь с такими данными уже существует';
        else if (error.message === 'bad request') msg = 'Некорректный запрос. Проверьте введенные данные';
        validator.showMessage(msg);
      }
    };

    validator.init();
  }
}
