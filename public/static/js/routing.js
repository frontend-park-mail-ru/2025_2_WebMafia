import { MainPage } from './pages/mainpage/mainpage.js';
import { notFoundPage } from './pages/notfoundpage/notFoundPage.js';
import { LoginPage } from './pages/login/login.js';
import { RegistrationPage } from './pages/register/register.js';
import { ArtistPage } from './pages/artist_page/artistPage.js';
import { ProfilePage } from './pages/profile/profilePage.js';

export class Router {
  constructor() {
    this.routes = [
      { pattern: /^\/$/, component: new MainPage() },
      { pattern: /^\/login$/, component: new LoginPage() },
      { pattern: /^\/register$/, component: new RegistrationPage() },
      { pattern: /^\/artist\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, component: new ArtistPage() },
      { pattern: /^\/profile$/, component: new ProfilePage() },
    ];
    this.handleLocation = this.handleLocation.bind(this);
  }

  handleLocation() {
    const path = window.location.pathname;

    let matched = null;
    for (const route of this.routes) {
      const match = path.match(route.pattern);

      if (match) {
        matched = { component: route.component, params: match.slice(1) };
        break;
      }
    }

    if (matched) {
      const { component, params } = matched;
      component.render(params[0]);
    } else {
      new notFoundPage().render();
    }
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
