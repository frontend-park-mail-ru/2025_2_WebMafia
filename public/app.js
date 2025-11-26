import { player } from '@/components/player/player.js';
import { router } from '@/routing.js';
import { persistence } from '@/utils/persistence.js';
import { spaceToggle } from '@/utils/playerSpace.js';

import.meta.glob('@/pages/**/*.tmpl.js', { eager: true });
import.meta.glob('@/partials/**/*.tmpl.js', { eager: true });
import.meta.glob('@/components/**/*.tmpl.js', { eager: true });

function startApp() {
  document.removeEventListener('DOMContentLoaded', startApp);
  initializePage();
}

document.addEventListener('DOMContentLoaded', startApp);

function registerPartials() {
  const hbsFiles = import.meta.glob(['@/partials/**/*.hbs', '@/components/**/*.hbs'], { eager: true });

  for (const path in hbsFiles) {
    const name = path.split('/').pop().replace('.hbs', '');
    const templateKey = name + '.hbs';
    Handlebars.registerPartial(name, Handlebars.templates[templateKey]);
  }

  Handlebars.registerHelper('numeration', function (value) {
    return parseInt(value) + 1;
  });
}

function initializePage() {
  registerPartials();
  persistence();
  spaceToggle();
  const currentTrack = localStorage.getItem('currentTrackId');
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (currentTrack && isAuthenticated) {
    player.init();
  }
  router.init();
}
