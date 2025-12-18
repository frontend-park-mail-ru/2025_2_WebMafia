import { ValidatorsConfig, InformationConfig } from './validation';

const getVal = (formId: string, name: string) => () => {
  const form = document.getElementById(formId) as HTMLFormElement;
  const input = form?.elements.namedItem(name) as HTMLInputElement;
  return input?.value || '';
};

export const Rules = {
  required: (val: string) => (val.trim() ? null : 'Обязательно для заполнения'),

  minLength: (min: number) => (val: string) => (val.length < min ? `Минимум ${min} символов` : null),

  maxLength: (max: number) => (val: string) => (val.length > max ? `Максимум ${max} символов` : null),

  email: (val: string) => (/\S+@\S+\.\S+/.test(val) ? null : 'Некорректный формат'),

  optional: (rule: (val: string) => string | null) => (val: string) => {
    if (!val) return null;
    return rule(val);
  },

  matchValue: (getReference: () => string, msg: string) => (val: string) => {
    if (!val) return null;
    return val === getReference() ? null : msg;
  },
};

export const FormSchemas = {
  login: () => ({
    validators: {
      login: (val) => Rules.required(val) || Rules.minLength(5)(val) || Rules.maxLength(35)(val),
      password: (val) => Rules.required(val) || Rules.minLength(8)(val),
    } as ValidatorsConfig,

    info: {
      login: (val) => Rules.minLength(5)(val) || Rules.maxLength(35)(val),
      password: (val) => Rules.minLength(8)(val),
    } as InformationConfig,
  }),

  registration: (formId: string) => ({
    validators: {
      email: (val) => Rules.required(val) || Rules.email(val),
      login: (val) => Rules.required(val) || Rules.minLength(5)(val),
      password: (val) => Rules.required(val) || Rules.minLength(8)(val),
      passwordConfirm: (val) =>
        Rules.required(val) || Rules.matchValue(getVal(formId, 'password'), 'Пароли не совпадают')(val),
    } as ValidatorsConfig,

    info: {
      email: (val) => (Rules.email(val) ? ['Формат: example@mail.com'] : null),

      login: (val) => Rules.minLength(5)(val) || Rules.maxLength(35)(val),

      password: (val) => {
        const errs: string[] = [];
        if (val.length < 8) errs.push('Минимум 8 символов');

        const confirmVal = getVal(formId, 'passwordConfirm')();
        if (confirmVal && val !== confirmVal) {
          errs.push('Пароли не совпадают');
        }
        return errs.length ? errs : null;
      },

      passwordConfirm: (val) => {
        const errs: string[] = [];
        const passVal = getVal(formId, 'password')();
        if (val.length < 8) errs.push('Минимум 8 символов');
        if (passVal && val !== passVal) errs.push('Пароли не совпадают');
        return errs.length ? errs : null;
      },
    } as InformationConfig,
  }),

  profile: (formId: string) => ({
    validators: {
      email: (val) => Rules.required(val) || Rules.email(val),
      login: (val) => Rules.required(val) || Rules.minLength(5)(val) || Rules.maxLength(35)(val),
      password: (val) => Rules.optional(Rules.minLength(8))(val),
      passwordConfirm: (val) => {
        const password = getVal(formId, 'password')();
        if (!password) return null;
        if (val !== password) return 'Пароли не совпадают';
        return null;
      },
    } as ValidatorsConfig,

    info: {
      email: (val) => (Rules.email(val) ? ['Формат: example@mail.com'] : null),

      login: (val) => Rules.minLength(5)(val) || Rules.maxLength(35)(val),

      password: (val) => {
        const errors: string[] = [];
        const confirmVal = getVal(formId, 'passwordConfirm')();

        if (val && val.length < 8) {
          errors.push('Минимум 8 символов');
        }
        if (confirmVal && val !== confirmVal) {
          errors.push('Пароли не совпадают');
        }
        return errors.length ? errors : null;
      },

      passwordConfirm: (val) => {
        const errors: string[] = [];
        const passwordVal = getVal(formId, 'password')();

        if (val && val.length < 8) {
          errors.push('Минимум 8 символов');
        }
        if (passwordVal && val !== passwordVal) {
          errors.push('Пароли не совпадают');
        }
        return errors.length ? errors : null;
      },
    } as InformationConfig,
  }),

  playlist: () => ({
    validators: {
      title: (val) => Rules.required(val),
    } as ValidatorsConfig,

    info: {
      title: (val) => {
        return !val ? ['Укажите название плейлиста'] : null;
      },
      description: () => {
        return ['Максимум 300 символов'];
      },
    } as InformationConfig,
  }),
};
