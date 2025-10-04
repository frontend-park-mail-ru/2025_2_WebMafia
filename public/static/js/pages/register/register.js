import { FormValidator } from '../login/validation.js';
import { apiServise } from '../../data.js';
import { router } from '../../routing.js';

export class RegistrationPage {
  async render() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      router.navigate('/');
    }
    const contentTemplate = Handlebars.templates['register.hbs'];
    document.getElementById('app').innerHTML = contentTemplate();
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
        if (value.length < 5)
          return 'Логин должен содержать минимум 5 символов';
        return null;
      },
      password: (value) => {
        if (!value) return 'Поле обязательно для заполнения';
        if (value.length < 8)
          return 'Пароль должен содержать минимум 8 символов';
        return null;
      },
      passwordConfirm: (value) => {
        const passwordInput = document.getElementById('password');
        if (value !== passwordInput.value) {
          return 'Пароли не совпадают';
        }
        return null;
      },
    };

    const validator = new FormValidator('registerForm', validators);

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
          errorMessage =
            'Пользователь с таким именем или email уже существует.';
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
      messageElement.style.backgroundColor = isSuccess
        ? 'rgba(39, 174, 96, 0.1)'
        : 'rgba(231, 76, 60, 0.1)';
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
