import { Auth } from './auth.ts';
import { FormValidator, ValidatorsConfig, InformationConfig } from '@/utils/validation';
import { apiServise } from '@/data.js';
import { router } from '@/routing';
import { initPasswordShowing } from '@/eye';
import { player } from '@/components/player/player.js';
import { Rules } from './validationRules';

export class RegistrationPage extends Auth {
  protected templateName = 'register.hbs';
  protected pageTitle = 'Регистрация';

  protected afterRender(): void {
    initPasswordShowing();
    this.initValidation();
  }

  private initValidation(): void {
    const validators: ValidatorsConfig = {
      email: (val) => Rules.required(val) || Rules.email(val),
      login: (val) => Rules.required(val) || Rules.minLength(5)(val),
      password: (val) => Rules.required(val) || Rules.minLength(8)(val),
      // Проверяем совпадение с полем id="password"
      passwordConfirm: (val) =>
        Rules.required(val) || Rules.matchPassword('password', 'Пароли не совпадают')(val),
    };

    const information: InformationConfig = {
      email: (val) => (Rules.email(val) ? ['Формат: example@mail.com'] : null),
      login: (val) => {
        const errs: string[] = [];
        if (val.length < 5) errs.push('Минимум 5 символов');
        if (val.length > 35) errs.push('Максимум 35 символов');
        return errs.length ? errs : null;
      },
      password: (val) => {
        const errs: string[] = [];
        if (val.length < 8) errs.push('Минимум 8 символов');

        const confirmInput = document.getElementById('passwordConfirm') as HTMLInputElement;
        if (confirmInput && confirmInput.value && val !== confirmInput.value) {
           errs.push('Пароли перестали совпадать');
        }
        return errs.length ? errs : null;
      },
      passwordConfirm: (val) => {
        const errs: string[] = [];
        const passInput = document.getElementById('password') as HTMLInputElement;
        if (val.length < 8) errs.push('Минимум 8 символов');
        if (passInput && val !== passInput.value) errs.push('Пароли не совпадают');
        return errs.length ? errs : null;
      }
    };

    const validator = new FormValidator('registerForm', validators, information);

    validator.onSubmit = async (formData: FormData) => {
      const email = formData.get('email') as string;
      const login = formData.get('login') as string;
      const password = formData.get('password') as string;

      try {
        await apiServise.registerUser(login, email, password);
        const response = await apiServise.loginUser(login, password);

        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('uid', response.ID);

        await player.init();
        router.navigate('/');
      } catch (error: any) {
        this.handleApiError(error, validator);
      }
    };

    validator.init();
  }
}