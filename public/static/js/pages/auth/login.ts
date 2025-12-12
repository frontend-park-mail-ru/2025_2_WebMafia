import { Auth } from './auth.ts';
import { FormValidator } from '@/utils/validation';
import { apiServise } from '@/data.js';
import { initPasswordShowing } from '@/eye';
import { FormSchemas } from '@/utils/validationRules';

export class LoginPage extends Auth {
  protected templateName = 'login.hbs';
  protected pageTitle = 'Вход';

  protected afterRender(): void {
    initPasswordShowing();
    this.initValidation();
  }

  private initValidation(): void {
    const formId = 'loginForm';

    const { validators, info } = FormSchemas.login();

    const validator = new FormValidator(formId, validators, info);

    validator.onSubmit = async (formData: FormData) => {
      const login = formData.get('login') as string;
      const password = formData.get('password') as string;

      try {
        const response = await apiServise.loginUser(login, password);
        this.handleLoginSuccess(response);
      } catch (error: any) {
        this.handleApiError(error, validator);
      }
    };

    validator.init();
  }
}