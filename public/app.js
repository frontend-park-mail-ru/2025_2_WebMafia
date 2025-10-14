import { router } from './static/js/routing.js';

document.addEventListener('DOMContentLoaded', function () {
  initializePage();
});

function registerPartials() {
  Handlebars.registerPartial('eyeOpen', Handlebars.templates['eyeOpen.hbs']);
  Handlebars.registerPartial('eyeClosed', Handlebars.templates['eyeClosed.hbs']);
  Handlebars.registerPartial('pencil', Handlebars.templates['pencil.hbs']);
  Handlebars.registerPartial('homeIcon', Handlebars.templates['homeIcon.hbs']);
  Handlebars.registerPartial('libraryIcon', Handlebars.templates['libraryIcon.hbs']);
  Handlebars.registerPartial('header', Handlebars.templates['header.hbs']);
  Handlebars.registerPartial('sidebar', Handlebars.templates['sidebar.hbs']);
}

function initializePage() {
  registerPartials();
  router.init();
}
