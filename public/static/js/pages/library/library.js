import { apiServise } from '@/data.js';
import { router } from '@/routing.js';
import { header } from '@/components/header/header.js';
import { sidebar } from '@/components/sidebar/sidebar.js';
import { initScrollbar } from '@/scrollbar.js';
import { getValidImage, playsParser, tracksNumParser } from '@/parsers.js';
import { playTrack } from '@/playTrackBtn.js';
import { setPlayButtonsOnAuth } from '@/setPlayButtonsOnAuth.js';
import { playerOnlyOnPlay } from '@/playerOnlyOnplay.js';
import { FormValidator } from '@/validation.js';

export class LibraryPage {
  async render() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      router.navigate('/login');
      return;
    }

    let pageData = {
      isAuthenticated: true,
      library: [],
      playlists: [],
      artists: [],
      albums: [],
      showType: true,
    };

    const contentTemplate = Handlebars.templates['library.hbs'];
    document.getElementById('app').innerHTML = contentTemplate();
    const gridTemplate = Handlebars.templates['libraryGrid.hbs'];
    document.querySelector('.grid-layout').innerHTML = gridTemplate();
    document.querySelector('head title').textContent = 'Библиотека';

    try {
      const data = await apiServise.getLibraryPageData();
      const item = {
        name: 'Понравившиеся треки',
        image: 'static/img/liked_tracks.png',
        created_at: new Date(),
        sub: data.favourite.tracks ? tracksNumParser(data.favourite.tracks.length) : '0 треков',
        href: 'playlist/' + data.favourite.id,
        type: 'Плейлист',
      };
      pageData.library.push(item);
      pageData.playlists.push(item);
      // data.artists.forEach((artist) => {
      //   const item = {
      //     name: artist.name,
      //     default_avatar: 'default-artist.png',
      //     image: getValidImage('artists/' + artist.avatar_url, 'default-artist.png'),
      //     created_at: new Date(artist.created_at),
      //     type: 'Артист',
      //     sub: playsParser(artist.play_count),
      //     href: 'artist/' + artist.id,
      //   };
      //   pageData.library.push(item);
      //   pageData.artists.push(item);
      // });
      // data.albums.forEach((album) => {
      //   const item = {
      //     name: album.title,
      //     default_avatar: 'default-album.png',
      //     image: getValidImage('albums/' + album.avatar_url, 'default-album.png'),
      //     sub: album.artists ? album.artists[0].name : 'Unknown Artist',
      //     created_at: new Date(album.created_at),
      //     type: album.type,
      //     href: 'album/' + album.id,
      //   };
      //   pageData.library.push(item);
      //   pageData.albums.push(item);
      // });
      data.playlists.forEach((playlist) => {
        if (!playlist.is_favorite) {
          const item = {
            name: playlist.title,
            default_avatar: 'default-playlist.png',
            image: getValidImage(playlist.avatar_url, 'default-album.png'),
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

    initScrollbar();
    playTrack();
    setPlayButtonsOnAuth();
    this.addEventListeners(pageData);
  }

  addEventListeners(data) {
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

    const createPlaylistOverlay = document.getElementById('createPlaylistOverlay');
    const createPlaylistButton = document.getElementById('createPlaylistButton');
    if (createPlaylistOverlay && createPlaylistButton) {
      createPlaylistButton.addEventListener('click', (e) => {
        e.preventDefault();
        createPlaylistOverlay.classList.add('active');
      });
    }

    let selectedAvatarFile = null;
    const closeOverlayButton = document.getElementById('closeOverlayButton');
    if (closeOverlayButton && createPlaylistOverlay) {
      closeOverlayButton.addEventListener('click', (e) => {
        document.getElementById('title').value = '';
        document.getElementById('description').value = '';

        updateAvatarContainer();

        selectedAvatarFile = null;

        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach((el) => {
          el.textContent = '';
          el.classList.remove('show');
        });

        const formGroups = document.querySelectorAll('.form-group.error');
        formGroups.forEach((group) => group.classList.remove('error'));

        const messageElement = document.getElementById('generalError');
        if (messageElement) {
          messageElement.textContent = '';
          messageElement.classList.remove('show');
          messageElement.style.backgroundColor = '';
        }

        createPlaylistOverlay.classList.remove('active');
      });
    }

    function updateAvatarContainer(src = null) {
      const img = document.getElementById('playlistAvatar');

      if (src) img.src = src;
      else img.src = 'static/img/default-playlist.png';
    }

    const editAvatarButtons = document.getElementById('editAvatarButtons');
    if (editAvatarButtons) {
      editAvatarButtons.addEventListener('click', (e) => {
        const target = e.target;

        if (target.id === 'setAvatarButton') {
          e.preventDefault();

          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.click();

          input.addEventListener('change', () => {
            const file = input.files[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
              alert('Файл слишком большой (максимум 5МБ)');
              return;
            }

            selectedAvatarFile = file;

            const reader = new FileReader();
            reader.onload = (event) => {
              updateAvatarContainer(event.target.result);

              if (!document.getElementById('deleteAvatarButton')) {
                editAvatarButtons.insertAdjacentHTML(
                  'beforeend',
                  `<button id="deleteAvatarButton" class="secondary-button save-avatar-button-size">Удалить фото</button>`
                );
              }
            };
            reader.readAsDataURL(file);
          });
        }

        if (target.id === 'deleteAvatarButton') {
          e.preventDefault();
          selectedAvatarFile = null;
          updateAvatarContainer();
          target.remove();
        }
      });
    }

    const createValidators = {
      title: (value) => {
        if (!value) return 'Назовите ваш плейлист';
        return null;
      },
    };

    const createInformation = {
      title: (value) => (value ? null : 'Укажите название плейлиста'),
      description: (value) => {
        return 'Максимум 300 символов';
      },
    };

    const createValidator = new FormValidator(
      'createPlaylistForm',
      createValidators,
      createInformation,
      '.primary-button'
    );
    createValidator.init();

    const saveButton = document.getElementById('savePlaylistButton');
    if (saveButton) {
      saveButton.addEventListener('click', async (e) => {
        e.preventDefault();

        const isValid = createValidator.validateForm();
        if (!isValid) {
          createValidator.showMessage('Необходимо указать название плейлиста');
          return;
        }

        try {
          const title = document.getElementById('title').value;
          const description = document.getElementById('description').value;
          const data = await apiServise.createPlaylist(title, description);

          if (selectedAvatarFile) {
            await apiServise.uploadPlaylistAvatar(selectedAvatarFile);
          }

          router.navigate(`playlist/${data.id}`);
        } catch (err) {
          console.error('Ошибка при сохранении профиля:', err);
          let msg = 'Не удалось сохранить изменения. Попробуйте еще раз чуть позже.';
          if (err.message === 'bad request')
            msg = 'Что-то пошло не так. Пожалуйста, проверьте правильность введенных данных.';
          createValidator.showMessage(msg);
        }
      });
    }
  }
}
