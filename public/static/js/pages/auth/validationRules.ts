export const Rules = {
  required: (val: string) => (val.trim() ? null : 'Обязательно для заполнения'),

  minLength: (min: number) => (val: string) =>
    val.length < min ? `Минимум ${min} символов` : null,

  maxLength: (max: number) => (val: string) =>
    val.length > max ? `Максимум ${max} символов` : null,

  email: (val: string) =>
    /\S+@\S+\.\S+/.test(val) ? null : 'Некорректный формат (example@mail.com)',

  matchPassword: (targetId: string, errorMsg: string) => (val: string) => {
    const targetInput = document.getElementById(targetId) as HTMLInputElement;
    if (!targetInput) return null;
    return val === targetInput.value ? null : errorMsg;
  }
};