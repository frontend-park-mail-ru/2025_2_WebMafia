import { MainPage } from '@/pages/mainpage/mainpage.ts';
import { notFoundPage } from '@/pages/notfoundpage/notFoundPage.js';
import { LoginPage } from '@/pages/auth/login.ts';
import { RegistrationPage } from '@/pages/auth/register.ts';
import { ArtistPage } from '@/pages/artist/artist.js';
import { ProfilePage } from '@/pages/profile/profilePage.js';
import { ArtistAlbumsPage } from '@/pages/artist_albums/artistAlbumsPage.js';
import { ArtistTracksPage } from '@/pages/artist_tracks/artistTracksPage.js';
import { AlbumPage } from '@/pages/album/album.js';
import { ArtistSinglesPage } from '@/pages/artist_singles/artistSinglesPage.js';
import { LibraryPage } from '@/pages/library/library.js';
import { SearchPage } from '@/pages/search_page/search_page.js';
import { PlaylistPage } from '@/pages/playlist/playlist.js';

interface Page {
  render(slug?: string): Promise<void> | void;
  destroy?(): void;
}

interface Route {
  pattern: RegExp;
  component: Page;
}

class Router {
  private routes: Route[];
  private currentPage: Page | null = null;

  constructor() {
    this.routes = [
      { pattern: /^\/$/, component: new MainPage() },
      { pattern: /^\/login$/, component: new LoginPage() },
      { pattern: /^\/register$/, component: new RegistrationPage() },
      {
        pattern: /^\/artist\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\/albums$/,
        component: new ArtistAlbumsPage(),
      },
      {
        pattern: /^\/artist\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\/tracks$/,
        component: new ArtistTracksPage(),
      },
      {
        pattern: /^\/artist\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\/singles$/,
        component: new ArtistSinglesPage(),
      },
      {
        pattern: /^\/artist\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/,
        component: new ArtistPage(),
      },
      { pattern: /^\/profile$/, component: new ProfilePage() },
      { pattern: /^\/library$/, component: new LibraryPage() },
      {
        pattern: /^\/album\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/,
        component: new AlbumPage(),
      },
      { pattern: /^\/search\/((.+))$/, component: new SearchPage() },
      {
        pattern: /^\/playlist\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/,
        component: new PlaylistPage(),
      },
      { pattern: /^\/playlist\/(LM)$/, component: new PlaylistPage() },
    ];
    this.handleLocation = this.handleLocation.bind(this);
  }

  async handleLocation(): Promise<void> {
    const path: string = window.location.pathname;

    let matched: { component: Page; params: string[] } | null = null;
    for (const route of this.routes) {
      const match = path.match(route.pattern);

      if (match) {
        matched = { component: route.component, params: match.slice(1) };
        break;
      }
    }

    if (!matched) {
      matched = { component: new notFoundPage(), params: [] };
    }

    const { component, params } = matched;

    if (this.currentPage) {
      if (typeof this.currentPage.destroy === 'function') {
        console.log('destroyed');
        this.currentPage.destroy();
      }
    }

    this.currentPage = component;

    try {
      await component.render(params[0]);
    } catch (error) {
      console.error('Render error:', error);
    }
  }

  init(): void {
    document.body.addEventListener('click', (e) => {
      const link = (e.target as HTMLElement).closest('a');
      if (link) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/') && !href.startsWith('http') && !link.target) {
          e.preventDefault();
          this.navigate(href);
        }
      }
    });

    window.addEventListener('popstate', this.handleLocation);

    this.handleLocation();
  }

  navigate(path: string): void {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    this.handleLocation();
    window.dispatchEvent(new CustomEvent('va-navigate'));
  }
}

export const router = new Router();
