import { copyToClipboard } from '@/utils/shareBtn';
import { confirmation } from '@/components/confirmation_modal/confirmationModal.ts';
import { showInfoMessage } from '@/utils/showInfoMessage';
import { apiServise } from '@/data';
import { playlistModal } from '@/components/modal/playlistModal.ts';
import { images } from '@/assets';
import { deletePlaylistLogic } from "@/utils/deletePlaylist";
import { getValidImage } from "@/utils/parsers";

type MenuAction = 'edit' | 'share' | 'delete' | 'deleteFromLibrary' | 'unsubscribe';

interface MenuItem {
  text: string;
  icon: string;
  action: MenuAction;
}

export type RemoveCallback = (id: string, type: string, card: HTMLElement) => void;
export type UpdateCallback = (id: string, newData: { title: string; description: string; image: string | null }) => void;

class ContextMenuService {
  private activeMenu: HTMLElement | null = null;
  private longPressTimer: any = null;

  private onRemove: RemoveCallback | null = null;
  private onUpdate: UpdateCallback | null = null;

  private boundHandleContextMenu: (e: Event) => void;
  private boundHandleTouchStart: (e: TouchEvent) => void;
  private boundHandleTouchMove: () => void;
  private boundHandleGlobalClick: (e: Event) => void;

  constructor() {
    this.boundHandleContextMenu = this.handleContextMenu.bind(this);
    this.boundHandleTouchStart = this.handleTouchStart.bind(this);
    this.boundHandleTouchMove = this.clearLongPress.bind(this);
    this.boundHandleGlobalClick = this.handleGlobalClick.bind(this);
  }

  public init(onRemove: RemoveCallback, onUpdate?: UpdateCallback) {
    this.onRemove = onRemove;
    this.onUpdate = onUpdate || null;
    this.addListeners();
  }

  public destroy() {
    this.removeMenu();
    this.removeListeners();
    this.onRemove = null;
    this.onUpdate = null;
  }

  private addListeners() {
    document.addEventListener('contextmenu', this.boundHandleContextMenu);
    document.addEventListener('touchstart', this.boundHandleTouchStart, { passive: true });
    document.addEventListener('touchmove', this.boundHandleTouchMove);
    document.addEventListener('touchend', this.boundHandleTouchMove);
    document.addEventListener('click', this.boundHandleGlobalClick);
  }

  private removeListeners() {
    document.removeEventListener('contextmenu', this.boundHandleContextMenu);
    document.removeEventListener('touchstart', this.boundHandleTouchStart);
    document.removeEventListener('touchmove', this.boundHandleTouchMove);
    document.removeEventListener('touchend', this.boundHandleTouchMove);
    document.removeEventListener('click', this.boundHandleGlobalClick);
  }

  private handleContextMenu(e: Event) {
    const card = (e.target as HTMLElement).closest('.card');
    if (card && card.closest('.grid-layout')) {
      const mouseEvent = e as MouseEvent;
      this.createAndShowMenu(e, mouseEvent.clientX, mouseEvent.clientY, card as HTMLElement);
    }
  }

  private handleTouchStart(e: TouchEvent) {
    const card = (e.target as HTMLElement).closest('.card');
    if (!card || !card.closest('.grid-layout')) return;

    this.longPressTimer = setTimeout(() => {
      const touch = e.touches[0];
      this.createAndShowMenu(e, touch.clientX, touch.clientY, card as HTMLElement);
    }, 500);
  }

  private clearLongPress() {
    clearTimeout(this.longPressTimer);
  }

  private handleGlobalClick(e: Event) {
    if (this.activeMenu && !this.activeMenu.contains(e.target as Node)) {
      this.removeMenu();
    }
  }

  private createAndShowMenu(e: Event, x: number, y: number, card: HTMLElement) {
    e.preventDefault();
    this.removeMenu();

    const type = card.dataset.type || 'default';
    const id = card.dataset.id;
    const name = card.dataset.name || '';
    const href = (card as HTMLAnchorElement).href;

    if (!id) return;

    const items = this.getMenuItems(type);
    const template = Handlebars.templates['contextMenu.hbs'];

    const div = document.createElement('div');
    div.innerHTML = template({ items });
    this.activeMenu = div.firstElementChild as HTMLElement;
    document.body.appendChild(this.activeMenu);

    this.positionMenu(x, y);

    this.activeMenu.addEventListener('click', (ev) => {
       const btn = (ev.target as HTMLElement).closest('.actions-item') as HTMLElement;
       if(btn) {
         ev.stopPropagation();
         const action = btn.dataset.action as MenuAction;
         this.handleAction(action, id, name, type, href, card);
         this.removeMenu();
       }
    });
  }

  private handleAction(action: MenuAction, id: string, name: string, type: string, href: string, card: HTMLElement) {
    switch (action) {
      case 'share':
        copyToClipboard(href);
        break;

      case 'edit':
        this.editPlaylist(id, card);
        break;

      case 'delete':
        deletePlaylistLogic(id, name, () => {
          this.onRemove?.(id, type, card);
        });
        break;

      case 'deleteFromLibrary':
        confirmation.showConfirm({
          title: 'Ты точно хочешь удалить этот альбом из библиотеки?',
          description: `Альбом <b>«${name || ''}»</b> будет удалён из твоей библиотеки, но ты всё ещё сможешь найти его на <b>Wave Music</b>`,
          confirmText: 'Удалить',
          cancelText: 'Отмена',
          onConfirm: async () => {
            try {
              await apiServise.toggleAlbumLike(id, false);
              this.onRemove?.(id, type, card);
              showInfoMessage(`Вы удалили «${name}» из библиотеки`);
            } catch(e) { console.error(e); }
          }
        });
        break;

      case 'unsubscribe':
        confirmation.showConfirm({
          title: 'Ты точно хочешь отписаться от артиста?',
          description: `Исполнитель <b>«${name || ''}»</b> будет удалён из твоей библиотеки, но ты всё ещё сможешь найти его на <b>Wave Music</b>`,
          confirmText: 'Отписаться',
          cancelText: 'Отмена',
          onConfirm: async () => {
            try {
              await apiServise.toggleSubscribeToArtist(id, false);
              this.onRemove?.(id, type, card);
              showInfoMessage(`Вы отписались от «${name}»`);
            } catch(e) { console.error(e); }
          }
        });
        break;
    }
  }

  private async editPlaylist(id: string, card: HTMLElement) {
    try {
      const data = await apiServise.getPlaylistPageData(id, true);
      if(!data.id) return;

      const imageSrc = getValidImage(data.avatar_url, images.defaultPlaylistPath);

      playlistModal.open({
        isEdit: true,
        id: data.id,
        title: data.title,
        description: data.description || '',
        image: imageSrc
      }, (newData) => {
        const titleEl = card.querySelector('.card-name');
        if (titleEl) titleEl.textContent = newData.title;
        card.dataset.name = newData.title;

        const img = card.querySelector('.playlist-cover') as HTMLImageElement;
        if (img) img.src = newData.image || images.defaultPlaylistPath;

        this.onUpdate?.(id, {
          title: newData.title,
          description: newData.description,
          image: newData.image
        });

        showInfoMessage('Изменения успешно сохранены!');
      });
    } catch(e) {
      console.error(e);
      showInfoMessage('Не удалось загрузить данные');
    }
  }

  private removeMenu() {
    if (this.activeMenu) {
      this.activeMenu.remove();
      this.activeMenu = null;
    }
  }

  private positionMenu(x: number, y: number) {
    if (!this.activeMenu) return;
    const rect = this.activeMenu.getBoundingClientRect();
    let posX = x;
    let posY = y;
    if (x + rect.width > window.innerWidth) posX = x - rect.width;
    if (y + rect.height > window.innerHeight) posY = y - rect.height;
    this.activeMenu.style.left = `${posX}px`;
    this.activeMenu.style.top = `${posY}px`;
  }

  private getMenuItems(type: string): MenuItem[] {
    const config: Record<string, MenuItem[]> = {
      'Плейлист': [
        { text: 'Редактировать', icon: 'pencil', action: 'edit' },
        { text: 'Поделиться', icon: 'share', action: 'share' },
        { text: 'Удалить', icon: 'trash', action: 'delete' }
      ],
      'Артист': [
        { text: 'Отписаться', icon: 'close', action: 'unsubscribe' },
        { text: 'Поделиться', icon: 'share', action: 'share' },
      ],
      'default': [
        { text: 'Удалить из библиотеки', icon: 'close', action: 'deleteFromLibrary' },
        { text: 'Поделиться', icon: 'share', action: 'share' },
      ]
    };
    return config[type] || config['default'];
  }
}

export const contextMenu = new ContextMenuService();
