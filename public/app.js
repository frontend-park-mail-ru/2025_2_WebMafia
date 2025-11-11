import { player } from './static/js/pages/player/player.js';
import { router } from './static/js/routing.js';
import { persistence } from './static/js/utils/persistence.js';
import { spaceToggle } from './static/js/utils/playerSpace.js';

// Страницы
import './static/js/pages/mainpage/MainPage.tmpl.js';
import './static/js/pages/notfoundpage/notFoundPage.tmpl.js';
import './static/js/pages/login/login.tmpl.js';
import './static/js/pages/register/register.tmpl.js';
import './static/js/pages/profile/profilePage.tmpl.js';
import './static/js/pages/artist_albums/artistAlbumsPage.tmpl.js';
import './static/js/pages/artist_tracks/artistTracksPage.tmpl.js';
import './static/js/pages/artist_singles/artistSinglesPage.tmpl.js';
import './static/js/pages/artist/artistPage.tmpl.js';
import  './static/js/pages/album/album.tmpl.js';
import './static/js/pages/player/player.tmpl.js';

// Иконки
import './static/js/partials/eyeOpen.tmpl.js';
import'./static/js/partials/eyeClosed.tmpl.js';
import './static/js/partials/pencil.tmpl.js';
import './static/js/pages/header/header.tmpl.js';
import './static/js/pages/sidebar/sidebar.tmpl.js';
import './static/js/partials/homeIcon.tmpl.js';
import './static/js/partials/libraryIcon.tmpl.js';
import './static/js/partials/angleDown.tmpl.js';
import './static/js/partials/play.tmpl.js';
import './static/js/partials/playBtn.tmpl.js';
import './static/js/partials/nextTrack.tmpl.js';
import './static/js/partials/prevTrack.tmpl.js';
import './static/js/partials/shuffleBtn.tmpl.js';
import './static/js/partials/repeatBtn.tmpl.js';
import './static/js/partials/pauseBtn.tmpl.js';
import './static/js/partials/volumeBar.tmpl.js';
import './static/js/partials/likeBtn.tmpl.js';
import './static/js/partials/close.tmpl.js';
import './static/js/partials/profile.tmpl.js';

document.addEventListener('DOMContentLoaded', function () {
  initializePage();
});

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
}

function initializePage() {
  registerPartials();
  persistence();
  spaceToggle();
  player.init();
  router.init();
}
