import { player } from './static/js/pages/player/player.js';
import { router } from './static/js/routing.js';
import { persistence } from './static/js/utils/persistence.js';
import { spaceToggle } from './static/js/utils/playerSpace.js';

function startApp() {
  document.removeEventListener('DOMContentLoaded', startApp);
  initializePage();
}

document.addEventListener('DOMContentLoaded', startApp);

function registerPartials() {
  Handlebars.registerPartial('eyeOpen', Handlebars.templates['eyeOpen.hbs']);
  Handlebars.registerPartial('eyeClosed', Handlebars.templates['eyeClosed.hbs']);
  Handlebars.registerPartial('angleDown', Handlebars.templates['angleDown.hbs']);
  Handlebars.registerPartial('pencil', Handlebars.templates['pencil.hbs']);
  Handlebars.registerPartial('homeIcon', Handlebars.templates['homeIcon.hbs']);
  Handlebars.registerPartial('libraryIcon', Handlebars.templates['libraryIcon.hbs']);
  Handlebars.registerPartial('header', Handlebars.templates['header.hbs']);
  Handlebars.registerPartial('sidebar', Handlebars.templates['sidebar.hbs']);
  Handlebars.registerPartial('play', Handlebars.templates['play.hbs']);
  Handlebars.registerPartial('player', Handlebars.templates['player.hbs']);
  Handlebars.registerPartial('playBtn', Handlebars.templates['playBtn.hbs']);
  Handlebars.registerPartial('shuffle', Handlebars.templates['shuffleBtn.hbs']);
  Handlebars.registerPartial('repeat', Handlebars.templates['repeatBtn.hbs']);
  Handlebars.registerPartial('pauseBtn', Handlebars.templates['pauseBtn.hbs']);
  Handlebars.registerPartial('nextTrack', Handlebars.templates['nextTrack.hbs']);
  Handlebars.registerPartial('prevTrack', Handlebars.templates['prevTrack.hbs']);
  Handlebars.registerPartial('volumeBar', Handlebars.templates['volumeBar.hbs']);
  Handlebars.registerPartial('likeBtn', Handlebars.templates['likeBtn.hbs']);
  Handlebars.registerPartial('close', Handlebars.templates['close.hbs']);
  Handlebars.registerPartial('profile', Handlebars.templates['profile.hbs']);
  Handlebars.registerHelper('numeration', function (value) {
    return parseInt(value) + 1;
  });
  Handlebars.registerPartial('pause', Handlebars.templates['pause.hbs']);
  Handlebars.registerPartial('create_problem', Handlebars.templates['create_problem.hbs']);
  Handlebars.registerPartial('edit_problem', Handlebars.templates['edit_problem.hbs']);
}

function initializePage() {
  registerPartials();
  persistence();
  spaceToggle();
  player.init();
  router.init();
}
