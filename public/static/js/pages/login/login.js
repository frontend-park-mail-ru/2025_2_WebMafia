import { FormValidator } from '@/validation.js';
import { apiServise } from '@/data.js';
import { router } from '@/routing.js';
import { initPasswordShowing } from '@/eye.js';
import { player } from '@/components/player/player.js';
import { images } from '@/assets';

export class LoginPage {
  async render() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      router.navigate('/profile');
    }
    let pageData = {
      logo: images.wavePath,
    };
    const contentTemplate = Handlebars.templates['login.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);
    document.querySelector('head title').textContent = 'Wave Music';
    initPasswordShowing();
    this.initValidation();
  }

  initValidation() {
    const validators = {
      login: (value) => {
        if (!value.trim()) return 'Обязательно для заполнения';
        if (value.length < 5) return 'Минимум 5 символов';
        return null;
      },
      password: (value) => {
        if (!value) return 'Обязательно для заполнения';
        if (value.length < 8) return 'Минимум 8 символов';
        return null;
      },
    };

    const information = {
      login: (value) => {
        if (value.length < 5) return 'Минимум 5 символов';
        else if (value.length > 35) return 'Максимум 35 символов';
        return null;
      },
      password: (value) => {
        if (value.length < 8) return 'Минимум 8 символов';
        return null;
      },
    };

    const validator = new FormValidator('loginForm', validators, information);

    validator.onSubmit = async (formData) => {
      const login = formData.get('login');
      const password = formData.get('password');

      try {
        const response = await apiServise.loginUser(login, password);

        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('uid', response.ID);

        window.location.replace('/');
        await player.init();
      } catch (error) {
        let msg = 'Ошибка авторизации.';
        if (error.message === 'unauthorized') msg = 'Неверное имя пользователя или пароль.';
        else if (error.message === 'bad request') msg = 'Некорректный запрос. Проверьте введенные данные.';
        validator.showMessage(msg);
      }
    };

    validator.init();
  }
}
