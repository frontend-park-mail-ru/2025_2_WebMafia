import { Auth } from './auth.ts';
import { FormValidator, ValidatorsConfig, InformationConfig } from '@/utils/validation';
import { apiServise } from '@/data.js';
import { router } from '@/routing';
import { initPasswordShowing } from '@/eye';
import { player } from '@/components/player/player.js';
import { Rules } from './validationRules';

export class LoginPage extends Auth {
  protected templateName = 'login.hbs';
  protected pageTitle = 'Вход';

  protected afterRender(): void {
    initPasswordShowing();
    this.initValidation();
  }

  private initValidation(): void {
    const validators: ValidatorsConfig = {
      login: (val) => Rules.required(val) || Rules.minLength(5)(val),
      password: (val) => Rules.required(val) || Rules.minLength(8)(val),
    };

    const information: InformationConfig = {
      login: (val) => {
        const errors: string[] = [];
        if (val.length < 5) errors.push('Минимум 5 символов');
        if (val.length > 35) errors.push('Максимум 35 символов');
        return errors.length ? errors : null;
      },
      password: (val) => (val.length < 8 ? ['Минимум 8 символов'] : null),
    };

    const validator = new FormValidator('loginForm', validators, information);

    validator.onSubmit = async (formData: FormData) => {
      const login = formData.get('login') as string;
      const password = formData.get('password') as string;

      try {
        await apiServise.loginUser(login, password);

        localStorage.setItem('isAuthenticated', 'true');

        await player.init();

        router.navigate('/');
      } catch (error: any) {
        this.handleApiError(error, validator);
      }
    };

    validator.init();
  }
}