if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('SW зарегистрирован:', reg))
      .catch((err) => console.error('Ошибка SW:', err));
  });
}

import { player } from '@/components/player/player';
import { router } from '@/routing';
import { spaceToggle } from '@/utils/playerSpace';

import.meta.glob('@/pages/**/*.tmpl.js', { eager: true });
import.meta.glob('@/partials/**/*.tmpl.js', { eager: true });
import.meta.glob('@/components/**/*.tmpl.js', { eager: true });

function startApp() {
  document.removeEventListener('DOMContentLoaded', startApp);
  initializePage();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}

function registerPartials() {
  const hbsFiles = import.meta.glob(['@/partials/**/*.hbs', '@/components/**/*.hbs'], { eager: true });

  for (const path in hbsFiles) {
    const fileName = path.split('/').pop(); // "sidebar.hbs"
    if (!fileName) continue;
    const name = fileName.replace('.hbs', ''); // "sidebar"
    const templateKey = fileName;
    if (Handlebars.templates[templateKey]) {
      Handlebars.registerPartial(name, Handlebars.templates[templateKey]);
    }
  }

  Handlebars.registerHelper('numeration', function (value: string | number) {
    return parseInt(String(value)) + 1;
  });
}

function initializePage() {
  registerPartials();
  spaceToggle();
  const currentTrack = localStorage.getItem('currentTrackId');
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (currentTrack && isAuthenticated) {
    player.init();
  }
  router.init();
}
