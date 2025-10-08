import { router } from './static/js/routing.js';

document.addEventListener('DOMContentLoaded', function () {
  initializePage();
});

function registerPartials() {
  Handlebars.registerPartial('eyeOpen', Handlebars.templates['eyeOpen.hbs']);
  Handlebars.registerPartial('eyeClosed', Handlebars.templates['eyeClosed.hbs']);
}

function initializePage() {
  registerPartials();
  router.init();
}
