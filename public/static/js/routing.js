import { MainPage } from './pages/mainpage/mainpage.js';
import { notFoundPage } from './pages/notfoundpage/notFoundPage.js';
import { LoginPage } from './pages/login/login.js';
import { RegistrationPage } from './pages/register/register.js';

export class Router {
  constructor() {
    this.routes = {
      '/': new MainPage(),
      '/login': new LoginPage(),
      '/register': new RegistrationPage(),
    };
    this.handleLocation = this.handleLocation.bind(this);
  }

  handleLocation() {
    const path = window.location.pathname;
    const component = this.routes[path] || new notFoundPage();
    component.render();
  }

  init() {
    document.body.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/')) {
          e.preventDefault();
          this.navigate(href);
        }
      }
    });

    window.addEventListener('popstate', this.handleLocation);

    this.handleLocation();
  }

  navigate(path) {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    this.handleLocation();
  }
}

export const router = new Router();
