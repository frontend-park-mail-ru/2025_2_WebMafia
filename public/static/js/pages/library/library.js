import { apiServise } from '@/data.js';
import { router } from '@/routing.js';
import { header } from '@/components/header/header.js';
import { sidebar } from '@/components/sidebar/sidebar.js';
import { initScrollbar } from '@/scrollbar.js';
import { getValidImage, playsParser, tracksNumParser } from '@/parsers.js';
import { playTrack } from '@/playTrackBtn.js';
import { setPlayButtonsOnAuth } from '@/setPlayButtonsOnAuth.js';
import { playerOnlyOnPlay } from '@/playerOnlyOnplay.js';
import { createPlaylis } from '@/utils/initCreatePlaylist';
import { images } from '@/assets';
import { copyToClipboard } from '@/utils/shareBtn.js';
import { deletePlaylistLogic } from '@/utils/deletePlaylist.js';
import { confirmation } from '@/components/confirmation_modal/confirmationModal.js';
import { showInfoMessage } from '@/utils/showInfoMessage.js';

export class LibraryPage {
  async render() {
    let pageData = {
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
      library: [],
      playlists: [],
      artists: [],
      albums: [],
      showType: true,
    };

    const contentTemplate = Handlebars.templates['library.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);
    await Promise.all([header.render(), sidebar.render()]);

    if (!pageData.isAuthenticated) {
      await Promise.all([header.render(), sidebar.render()]);
      return;
    }

    const gridTemplate = Handlebars.templates['libraryGrid.hbs'];
    document.querySelector('head title').textContent = 'Wave Music';

    try {
      const data = await apiServise.getLibraryPageData();
      const item = {
        name: 'Понравившиеся треки',
        image: images.likedTracksPath,
        created_at: new Date(),
        sub: data.favourite_tracks ? tracksNumParser(data.favourite_tracks.length) : '0 треков',
        href: 'playlist/LM',
        type: 'Плейлист',
      };
      pageData.library.push(item);
      pageData.playlists.push(item);
      data.artists.forEach((artist) => {
        const item = {
          id: artist.id,
          name: artist.name,
          image: getValidImage('artists/' + artist.avatar_url, images.defaultArtistPath),
          created_at: new Date(artist.created_at),
          type: 'Артист',
          sub: playsParser(artist.play_count || 0),
          href: 'artist/' + artist.id,
        };
        pageData.library.push(item);
        pageData.artists.push(item);
      });
      data.albums.forEach((album) => {
        const item = {
          id: album.id,
          name: album.title,
          image: getValidImage('albums/' + album.avatar_url, images.defaultAlbumPath),
          sub: album.artists ? album.artists[0].name : 'Unknown Artist',
          created_at: new Date(album.created_at),
          type: album.type,
          href: 'album/' + album.id,
        };
        pageData.library.push(item);
        pageData.albums.push(item);
      });
      data.playlists.forEach((playlist) => {
        if (!playlist.is_favorite) {
          const item = {
            id: playlist.id,
            name: playlist.title,
            default_avatar: 'default-playlist.png',
            image: getValidImage(playlist.avatar_url, images.defaultPlaylistPath),
            created_at: new Date(playlist.created_at),
            sub: playlist.tracks ? tracksNumParser(playlist.tracks.length) : '0 треков',
            type: 'Плейлист',
            href: 'playlist/' + playlist.id,
          };
          pageData.library.push(item);
          pageData.playlists.push(item);
        }
      });
      pageData.library.sort((a, b) => b.created_at - a.created_at);
    } catch (error) {
      console.error('Failed to load library page data:', error);

      if (error.response && error.response.status === 404) {
        router.navigate('/not-found');
        return;
      }

      if (error.message && error.message.includes('Network')) {
        alert('Проблема с подключением. Попробуйте позже.');
        return;
      }

      alert('Не удалось загрузить страницу библиотеки.');
      return;
    }

    document.getElementById('app').innerHTML = contentTemplate(pageData);
    document.querySelector('.grid-layout').innerHTML = gridTemplate(pageData);
    playerOnlyOnPlay();

    await Promise.all([header.render(), sidebar.render()]);

    createPlaylis();

    initScrollbar();
    playTrack();
    setPlayButtonsOnAuth();
    this.addEventListeners(pageData);
    this.initContextMenu();
  }

  addEventListeners(data) {
    const searchToggle = document.getElementById('librarySearchToggle');
    const libraryHeaderContainer = document.querySelector('.library-header-container');
    const titleName = document.querySelector('.title-name');
    const createPlaylistToggle = document.querySelector('.create-playlist-toggle');
    const rightSearchContainer = document.querySelector('.library-search-container');
    const closeButton = rightSearchContainer.querySelector('.input-close-button');
    const originalParent = rightSearchContainer.parentElement;

    searchToggle.addEventListener('click', (e) => {
      e.preventDefault();

      titleName.classList.add('hidden');
      searchToggle.classList.add('hidden');
      createPlaylistToggle.classList.add('hidden');

      libraryHeaderContainer.appendChild(rightSearchContainer);

      rightSearchContainer.classList.remove('active');
      requestAnimationFrame(() => {
        rightSearchContainer.classList.add('active');
      });

      const input = rightSearchContainer.querySelector('#librarySearchInput');
      setTimeout(() => input.focus(), 200);
    });

    closeButton.addEventListener('click', (e) => {
      e.preventDefault();

      rightSearchContainer.classList.remove('active');

      titleName.classList.remove('hidden');
      searchToggle.classList.remove('hidden');
      createPlaylistToggle.classList.remove('hidden');

      setTimeout(() => originalParent.appendChild(rightSearchContainer), 200);
    });

    const container = document.querySelector('.sort-buttons');
    const buttons = container.querySelectorAll('button');
    const disableSort = document.getElementById('disableSort');
    const gridTemplate = Handlebars.templates['libraryGrid.hbs'];

    buttons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();

        const isActivating = button.classList.contains('secondary-button');

        if (button.id === 'disableSort') {
          buttons.forEach((b) => {
            b.style.display = '';
            b.classList.remove('primary-button');
            b.classList.add('secondary-button');
          });

          button.style.display = 'none';

          document.querySelector('.grid-layout').innerHTML = gridTemplate(data);
        } else if (isActivating) {
          button.classList.remove('secondary-button');
          button.classList.add('primary-button');

          disableSort.style.display = 'flex';

          buttons.forEach((b) => {
            if (b !== button && b.id !== 'disableSort') b.style.display = 'none';
          });

          const dataName = button.dataset.name;
          const pageData = {
            library: data[dataName] || [],
            showType: false,
          };

          document.querySelector('.grid-layout').innerHTML = gridTemplate(pageData);
        } else {
          buttons.forEach((b) => {
            b.style.display = '';
            b.classList.remove('primary-button');
            b.classList.add('secondary-button');
          });

          disableSort.style.display = 'none';

          document.querySelector('.grid-layout').innerHTML = gridTemplate(data);
        }
      });
    });
  }

  initContextMenu() {
    let activeMenu = null;
    let longPressTimer;

    const menuConfig = {
      Плейлист: [
        { text: 'Редактировать', icon: 'pencil', action: 'edit' },
        { text: 'Поделиться', icon: 'share', action: 'share' },
        { text: 'Удалить', icon: 'trash', action: 'delete' },
      ],
      Артист: [
        { text: 'Отписаться', icon: 'close', action: 'unsubscribe' },
        { text: 'Поделиться', icon: 'share', action: 'share' },
      ],
      default: [
        { text: 'Удалить из библиотеки', icon: 'close', action: 'deleteFromLibrary' },
        { text: 'Поделиться', icon: 'share', action: 'share' },
      ],
    };

    const removeMenu = () => {
      if (activeMenu) {
        activeMenu.remove();
        activeMenu = null;
      }
    };

    const createAndShowMenu = (e, x, y) => {
      const card = e.target.closest('.card');

      if (!card) return;
      e.preventDefault();

      const type = card.dataset.type;
      const name = card.dataset.name;
      const id = card.dataset.id;
      const href = card.href;

      removeMenu();
      if (!id) return;

      const items = menuConfig[type] || menuConfig['default'];

      const menuTemplate = Handlebars.templates['contextMenu.hbs'];

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = menuTemplate({ items: items });
      const menuElement = tempDiv.firstElementChild;

      document.body.appendChild(menuElement);
      activeMenu = menuElement;

      const menuRect = menuElement.getBoundingClientRect();
      const winWidth = window.innerWidth;
      const winHeight = window.innerHeight;

      let posX = x;
      let posY = y;

      if (x + menuRect.width > winWidth) {
        posX = x - menuRect.width;
      }
      if (y + menuRect.height > winHeight) {
        posY = y - menuRect.height;
      }

      menuElement.style.left = `${posX}px`;
      menuElement.style.top = `${posY}px`;

      menuElement.addEventListener('click', (e) => {
        const btn = e.target.closest('.actions-item');
        if (!btn) return;
        e.stopPropagation();
        const action = btn.dataset.action;

        switch (action) {
          case 'delete':
            deletePlaylistLogic(id, name, () => {
              card.remove();
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
                  card.remove();
                  showInfoMessage(`Вы отписались от «${name || ''}»`);
                } catch (error) {
                  console.error('Ошибка при удалении плейлиста:', error);
                  showInfoMessage(`Не удалось отписаться от «${name || ''}»`);
                }
              },
            });
            break;
          case 'edit':
            // router.navigate(...)
            break;
          case 'share':
            copyToClipboard(href);
            break;
        }

        removeMenu();
      });
    };

    document.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.grid-layout')) {
        createAndShowMenu(e, e.clientX, e.clientY);
      }
    });

    document.addEventListener(
      'touchstart',
      (e) => {
        if (!e.target.closest('.grid-layout')) return;
        longPressTimer = setTimeout(() => {
          const touch = e.touches[0];
          createAndShowMenu(e, touch.clientX, touch.clientY);
        }, 500);
      },
      { passive: false }
    );

    const cancelLongPress = () => clearTimeout(longPressTimer);
    document.addEventListener('touchmove', cancelLongPress);
    document.addEventListener('touchend', cancelLongPress);

    document.addEventListener('click', (e) => {
      if (activeMenu && !activeMenu.contains(e.target)) {
        removeMenu();
      }
    });
  }
}
