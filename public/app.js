import { player } from './static/js/pages/player/player.js';
import { router } from './static/js/routing.js';

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
}

function persistence() {
  window.addEventListener('storage', () => {
    const currentPlayingtrack = localStorage.getItem('isPlaying');
    if (currentPlayingtrack === 'true') {
      player._toggleplayPauseSwitch(true);
      player.audio.play();
    } else {
      player._toggleplayPauseSwitch(false);
      player.audio.pause();
    }
  });
}

function spaceToggle() {
  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
      event.preventDefault();
      if (player && player.audio) {
        const spaceElement = document.activeElement;
        if (spaceElement.tagName === 'INPUT' || spaceElement.tagName === 'TEXTAREA' || spaceElement.isContentEditable) {
          return;
        }
        player.togglePlayPause();
      }
    }
  });
}

function initializePage() {
  registerPartials();
  persistence();
  spaceToggle();
  router.init();
}
