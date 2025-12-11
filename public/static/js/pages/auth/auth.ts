import { router } from '@/routing';
import { images } from '@/assets';
import { FormValidator } from '@/utils/validation';

declare const Handlebars: any;

export abstract class Auth {
  protected abstract templateName: string;
  protected abstract pageTitle: string;

  protected checkAuth(): void {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      router.navigate('/profile');
    }
  }

  public render(): void {
    this.checkAuth();

    const app = document.getElementById('app');
    if (!app) return;

    const pageData = {
      logo: images.wavePath,
    };

    const template = Handlebars.templates[this.templateName];
    if (template) {
      app.innerHTML = template(pageData);
      document.title = this.pageTitle;

      this.afterRender();
    } else {
      console.error(`Шаблон ${this.templateName} не найден`);
    }
  }

  protected abstract afterRender(): void;

  protected handleApiError(error: Error, validator: FormValidator): void {
    let msg = 'Произошла ошибка. Попробуйте позже.';
    const message = error.message.toLowerCase();

    if (message.includes('unauthorized') || message.includes('401')) {
      msg = 'Неверное имя пользователя или пароль.';
    } else if (message.includes('conflict') || message.includes('409')) {
      msg = 'Пользователь с такими данными уже существует.';
    } else if (message.includes('bad request') || message.includes('400')) {
      msg = 'Некорректные данные. Проверьте правильность заполнения.';
    }

    validator.showMessage(msg, false);
  }
}