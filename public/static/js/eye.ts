export function initPasswordShowing(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>('.eye');

  buttons.forEach((btn) => {
    const input = btn.previousElementSibling as HTMLInputElement | null;

    if (!input) return;

    const eyeOpen = btn.querySelector('.eye-open') as HTMLElement | null;
    const eyeClosed = eyeOpen?.nextElementSibling as HTMLElement | null;

    btn.setAttribute('tabindex', '-1');

    btn.addEventListener('click', () => {
      if (!eyeOpen || !eyeClosed) return;
      if (input.type === 'password') {
        input.type = 'text';
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'block';
      } else {
        input.type = 'password';
        eyeClosed.style.display = 'none';
        eyeOpen.style.display = 'block';
      }
    });
  });
}
