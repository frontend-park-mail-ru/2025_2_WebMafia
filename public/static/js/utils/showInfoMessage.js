export function showInfoMessage(text) {
  const section = document.getElementById('section');

  const msg = document.createElement('div');
  msg.className = 'inform-message';
  msg.textContent = text;

  section.appendChild(msg);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      msg.classList.add('visible');
    });
  });

  setTimeout(() => {
    msg.classList.remove('visible');
    msg.addEventListener('transitionend', () => msg.remove());
  }, 4000);
}
