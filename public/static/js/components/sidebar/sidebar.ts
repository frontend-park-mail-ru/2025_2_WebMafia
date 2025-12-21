import { playlistModal } from '@/components/modal/playlistModal.ts';
import { Album, Artist, LibraryItem, Playlist } from '@/models.ts';
import { images } from '@/assets.ts';
import { apiServise } from '@/data.ts';
import { getValidImage } from '@/utils/parsers.ts';
import { scrollbar } from '@/utils/scrollbar.ts';

interface SidebarUpdateEvent extends CustomEvent {
  detail: { id: string; name: string; image: string };
}
interface SidebarRemoveEvent extends CustomEvent {
  detail: { id: string };
}
interface SidebarCreateEvent extends CustomEvent {
  detail: { id: string; name: string; image: string; type: 'Плейлист' | 'Артист' | 'Альбом' | 'EP' | 'Сингл' };
}

class Sidebar {
  private container!: HTMLElement;
  private isGlobalListenersAttached = false;

  public async render() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    if (sidebar.innerHTML.trim() !== '') {
      this.activePath();
      return;
    }

    this.container = sidebar;

    const contentTemplate = Handlebars.templates['sidebar.hbs'];
    this.container.innerHTML = contentTemplate({});

    const templateData = {
      library: [] as LibraryItem[],
    };

    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      try {
        const data = await apiServise.getLibraryPageData();

        templateData.library.push({
          id: 'LM',
          name: 'Понравившиеся',
          image: images.likedTracksPath,
          type: 'Плейлист',
          href: 'playlist/LM',
          created_at: new Date(),
        });

        if (data.playlists) {
          data.playlists.forEach((p: Playlist) => {
            if (!p.is_favorite) {
              templateData.library.push({
                id: p.id,
                name: p.title,
                image: getValidImage(p.avatar_url, images.defaultPlaylistPath),
                type: 'Плейлист',
                href: `playlist/${p.id}`,
                created_at: new Date(p.created_at || 0),
              });
            }
          });
        }

        data.albums.forEach((a: Album) => {
          templateData.library.push({
            id: a.id,
            name: a.title,
            image: getValidImage(`albums/${a.avatar_url}`, images.defaultAlbumPath),
            type: 'Альбом',
            href: `album/${a.id}`,
            created_at: new Date(a.created_at || 0),
          });
        });

        data.artists.forEach((a: Artist) => {
          templateData.library.push({
            id: a.id,
            name: a.name,
            image: getValidImage(`artists/${a.avatar_url}`, images.defaultArtistPath),
            type: 'Артист',
            href: `artist/${a.id}`,
            created_at: new Date(a.created_at || 0),
          });
        });

        templateData.library.sort((a: LibraryItem, b: LibraryItem) => {
          const timeA = a.created_at ? a.created_at.getTime() : 0;
          const timeB = b.created_at ? b.created_at.getTime() : 0;
          return timeB - timeA;
        });
      } catch (e) {
        console.error('Sidebar data fetch error:', e);
      }
    }

    this.container.innerHTML = contentTemplate(templateData);
    this.initComponents();
  }

  private initComponents() {
    this.activePath();
    this.addMenuListeners();
    this.createPlaylistButton();
    scrollbar.init('sidebarScrollContent');

    if (this.isGlobalListenersAttached) return;

    window.addEventListener('popstate', () => this.activePath());
    window.addEventListener('va-navigate', () => this.activePath());

    window.addEventListener('sidebar:update', (e) => this.handleUpdate(e as SidebarUpdateEvent));
    window.addEventListener('sidebar:remove', (e) => this.handleRemove(e as SidebarRemoveEvent));
    window.addEventListener('sidebar:create', (e) => this.handleCreate(e as SidebarCreateEvent));
    window.addEventListener('sidebar:clear', () => this.handleClear());

    this.isGlobalListenersAttached = true;
  }

  private activePath() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.menu-item').forEach((link) => {
      const href = link.getAttribute('href');
      if (href === currentPath) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  private addMenuListeners() {
    this.container.addEventListener('click', (e) => {
      const link = (e.target as HTMLElement).closest('.menu-item');
      if (!link) return;
      document.querySelectorAll('.menu-item').forEach((item) => {
        item.classList.remove('active');
      });
      link.classList.add('active');
    });
  }

  private createPlaylistButton() {
    const createButton = document.getElementById('sidebarCreatePlaylistButton');
    if (!createButton) return;
    createButton.addEventListener('click', (e) => {
      e.preventDefault();
      playlistModal.open({ isEdit: false });
    });
  }

  private handleUpdate(e: SidebarUpdateEvent) {
    const { id, name, image } = e.detail;
    if (!this.container) return;

    const item = this.container.querySelector(`.menu-item[data-id="${id}"]`);
    if (!item) return;

    const titleEl = item.querySelector('.sidebar-item-name');
    if (titleEl) titleEl.textContent = name;

    const imgEl = item.querySelector('img');
    if (imgEl && image) imgEl.src = image;
  }

  private handleRemove(e: SidebarRemoveEvent) {
    const { id } = e.detail;
    if (!this.container) return;

    const item = this.container.querySelector(`.menu-item[data-id="${id}"]`);
    if (item) item.remove();
  }

  private handleCreate(e: SidebarCreateEvent) {
    const { id, name, image, type } = e.detail;

    const sidebarContent = document.querySelector('.sidebar-user-items');
    if (!sidebarContent) return;

    const itemData = {
      id,
      name,
      image: image || images.defaultPlaylistPath,
      type,
      href: this.getHrefByType(type, id),
    };

    const template = Handlebars.templates['sidebarItem.hbs'];
    const html = template(itemData);

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html.trim();
    const newItem = tempDiv.firstElementChild as HTMLElement;

    const likedPlaylist = sidebarContent.querySelector('.menu-item[data-id="LM"]');

    if (likedPlaylist) {
      likedPlaylist.after(newItem);
    } else {
      sidebarContent.prepend(newItem);
    }

    this.activePath();
    scrollbar.init('sidebarScrollContent');
  }

  private handleClear() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  private getHrefByType(type: string, id: string): string {
    switch (type) {
      case 'Плейлист':
        return `playlist/${id}`;
      case 'Артист':
        return `artist/${id}`;
      default:
        return `album/${id}`;
    }
  }
}

export const sidebar = new Sidebar();
