import { Auth } from './auth.ts';
import { FormValidator } from '@/utils/validation';
import { apiServise } from '@/data.ts';
import { initPasswordShowing } from '@/eye';
import { FormSchemas } from '@/utils/validationRules';

export class RegistrationPage extends Auth {
  protected templateName = 'register.hbs';
  protected pageTitle = 'Регистрация';

  protected afterRender(): void {
    initPasswordShowing();
    this.initValidation();
  }

  private initValidation(): void {
    const formId = 'registerForm';

    const { validators, info } = FormSchemas.registration(formId);

    const validator = new FormValidator(formId, validators, info);

    validator.onSubmit = async (formData: FormData) => {
      const email = formData.get('email') as string;
      const login = formData.get('login') as string;
      const password = formData.get('password') as string;

      try {
        await apiServise.registerUser(login, email, password);
        const response = await apiServise.loginUser(login, password);
        this.handleLoginSuccess(response);
      } catch (error: unknown) {
        this.handleApiError(error as Error, validator);
      }
    };

    validator.init();
  }
}
