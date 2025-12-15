export function injectBubbleStyles() {
  if (document.getElementById('bubble-styles')) return;
  const style = document.createElement('style');
  style.id = 'bubble-styles';
  document.head.appendChild(style);
}

export function spawnBubble(data) {
  const container = document.getElementById('bubblesStream');
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'bubble-unit';

  const duration = 8 + Math.random() * 4;
  div.style.animationDuration = `${duration}s`;

  const avatarHtml = data.avatar
    ? `<img src="${data.avatar}" alt="user">`
    : `<span>${data.letter || (data.nickname ? data.nickname[0] : 'U')}</span>`;

  div.innerHTML = `
        <div class="bubble-content">
          <div class="bubble-avatar">${avatarHtml}</div>
            <div class="bubble-data"> 
              <div class="bubble-author">${data.nickname || 'User'}</div>
              <div class="bubble-text">${data.text}</div>
            </div>
        </div>
    `;

  container.appendChild(div);

  setTimeout(() => {
    if (div.parentNode) div.parentNode.removeChild(div);
  }, duration * 1000);
}
