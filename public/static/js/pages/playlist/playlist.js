import { apiServise } from '@/data.js';
import { router } from '@/routing.js';
import { header } from '@/components/header/header.js';
import { sidebar } from '@/components/sidebar/sidebar.js';
import { initScrollbar } from '@/scrollbar.js';
import { slider } from '@/slider.js';
import {
  playsParser,
  durationParser,
  getValidImage,
  totalDurationParser,
  tracksNumParser,
  dateParser,
  durationToSec,
} from '@/parsers.js';
import { playTrack } from '@/playTrackBtn.js';
import { setPlayButtonsOnAuth } from '@/setPlayButtonsOnAuth.js';
import { playerOnlyOnPlay } from '@/playerOnlyOnplay.js';
import { FormValidator } from '@/validation.js';
import { likeChange, likeTrackBtn } from '@/utils/likeTrack';
import { createPlaylis } from '@/utils/initCreatePlaylist';
import { confirmation } from "@/components/confirmation_modal/confirmationModal.js";
import { getStaticImagePath } from '@/utils/getStaticImages.js';
import { albumPlaylistButtons } from "@/utils/albumPlaylistButtons.js";
import { share } from "@/utils/shareBtn";

export class PlaylistPage {
  constructor() {
    this.playlistData = {};
    this.totalDuration = 0;
  }

  async render(id) {
    let pageData = {
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
    };

    if (!pageData.isAuthenticated && id === 'LM') router.navigate('/not-found');

    const contentTemplate = Handlebars.templates['playlist.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);
    document.querySelector('head title').textContent = 'Wave Music';

    try {
      const data = await apiServise.getPlaylistPageData(id, pageData.isAuthenticated);
      this.playlistData = data;
      const firstTrackId = data.tracks && data.tracks.length > 0 ? data.tracks[0].id : null;
      pageData = {
        favourite: true,
        date: 'Создан автоматически',
        title: 'Понравившиеся треки',
        cover: 'static/img/liked_tracks.png',
        description: 'В этот плейлист попадают треки, которым вы поставили отметку "Нравится"',
        track_id: firstTrackId,
      };
      if (id !== 'LM') {
        pageData.favourite = false;
        pageData.title = data.title;
        pageData.id = data.id;
        pageData.date = dateParser(data.created_at);
        pageData.cover = getValidImage(data.avatar_url ? data.avatar_url : '', 'default-playlist.png');
        pageData.isCover = data.avatar_url;
        pageData.description = data.description;
      }
      let totalDuration = 0;
      pageData.tracks = (data.tracks || []).map((track) => {
        totalDuration += track.duration_s;
        return {
          id: track.id,
          name: track.title,
          album: track.album.title,
          album_id: track.album.id,
          cover: getValidImage('albums/' + track.album.avatar_url, 'default-album.png'),
          artists: track.artists,
          plays: playsParser(track.play_count),
          duration: durationParser(track.duration_s),
          is_liked: pageData.favourite ? true : track.is_liked,
        };
      });
      pageData.totalDuration = totalDurationParser(totalDuration);
      this.totalDuration = totalDuration;
      pageData.tracksNum = pageData.tracks.length ? tracksNumParser(pageData.tracks.length) : '0 треков';
    } catch (error) {
      console.error('Failed to load playlist page data:', error);

      if (error.response && error.response.status === 404) {
        router.navigate('/not-found');
        return;
      }

      if (error.message && error.message.includes('Network')) {
        alert('Проблема с подключением. Попробуйте позже.');
        return;
      }

      alert('Не удалось загрузить страницу плейлиста.');
      return;
    }

    document.getElementById('app').innerHTML = contentTemplate(pageData);
    document.querySelector('head title').textContent = pageData.title;
    playerOnlyOnPlay();
    getStaticImagePath(pageData);
    await Promise.all([header.render(), sidebar.render()]);
    slider.sliderFunction();
    initScrollbar();
    this.addEventListeners();
    createPlaylis();
    setPlayButtonsOnAuth();
    likeTrackBtn();
    playTrack();
    albumPlaylistButtons();
    share();
  }

  addEventListeners() {
    const editPlaylistButton = document.getElementById('editPlaylistButton');
    const deletePlaylistButton = document.getElementById('deletePlaylistButton');
    const editPlaylistOverlay = document.getElementById('editPlaylistOverlay');
    const closeOverlayButton = document.getElementById('closeOverlayButtonPlaylist');

    if (this.playlistData.is_favorite) {
      const appContainer = document.getElementById('app');

      if (appContainer) {
        appContainer.addEventListener('click', (e) => {
          const likeBtn = e.target.closest('.like-btn-track');

          if (likeBtn) {
            const row = likeBtn.closest('.album-row.playlist');
            const id = likeBtn.dataset.trackId;

            if (row) {
              row.remove();

              likeChange(id, false);

              const remainingRows = document.querySelectorAll('.album-row .playlist-track-number');
              remainingRows.forEach((el, index) => {
                el.textContent = index + 1;
              });
            }
          }
        });
      }

      const handlePlayerLikeChange = (e) => {
        if (!appContainer.querySelector('.album-row.playlist')) {
          window.removeEventListener('player-like-changed', handlePlayerLikeChange);
          return;
        }

        const { id, isLiked } = e.detail;

        if (!isLiked) {
          const trackBtn = document.querySelector(`.album-row.playlist .like-btn-track[data-track-id="${id}"]`);

          if (trackBtn) {
            const row = trackBtn.closest('.album-row.playlist');
            if (row) {
              row.remove();

              const remainingRows = document.querySelectorAll('.album-row.playlist .playlist-track-number');
              remainingRows.forEach((el, index) => {
                el.textContent = index + 1;
              });
            }
          }
        }
      };
      window.addEventListener('player-like-changed', handlePlayerLikeChange);
    }

    if (editPlaylistButton && editPlaylistOverlay) {
      editPlaylistButton.addEventListener('click', (e) => {
        e.preventDefault();
        editPlaylistOverlay.classList.add('active');
      });
    }

    if (closeOverlayButton && editPlaylistOverlay) {
      closeOverlayButton.addEventListener('click', (e) => {
        e.preventDefault();
        editPlaylistOverlay.classList.remove('active');
      });
    }

    if (editPlaylistOverlay) {
      editPlaylistOverlay.addEventListener('click', (e) => {
        if (e.target === editPlaylistOverlay) {
          editPlaylistOverlay.classList.remove('active');
        }
      });
    }

    let selectedAvatarFile = null;
    let deleteAvatar = false;
    const editAvatarButtons = document.getElementById('editPlaylistAvatarButtons');

    function updateAvatarContainer(containerId, src = null) {
      const container = document.getElementById(containerId);
      if (!container) return;

      const img = container.querySelector('img');

      if (src) img.src = src;
      else img.src = 'static/img/default-playlist.png';
    }

    if (editAvatarButtons) {
      editAvatarButtons.addEventListener('click', (e) => {
        const target = e.target;

        if (target.id === 'setPlaylistAvatarButton') {
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
            deleteAvatar = false;

            const reader = new FileReader();
            reader.onload = (event) => {
              updateAvatarContainer('playlistAvatarEditContainer', event.target.result);

              if (!document.getElementById('deletePlaylistAvatarButton')) {
                editAvatarButtons.insertAdjacentHTML(
                  'beforeend',
                  `<button id="deletePlaylistAvatarButton" class="secondary-button save-avatar-button-size">Удалить фото</button>`
                );
              }
            };
            reader.readAsDataURL(file);
          });
        }

        if (target.id === 'deletePlaylistAvatarButton') {
          e.preventDefault();

          selectedAvatarFile = null;
          deleteAvatar = true;

          updateAvatarContainer('playlistAvatarEditContainer');

          target.remove();
        }
      });
    }

    const editValidators = {
      title: (value) => {
        if (!value) return 'Назовите ваш плейлист';
        return null;
      },
    };

    const editInformation = {
      title: (value) => (value ? null : 'Укажите название плейлиста'),
      description: (value) => {
        return 'Максимум 300 символов';
      },
    };

    const editValidator = new FormValidator('editPlaylistForm', editValidators, editInformation, {
      submitButtonSelector: '.general-error',
      messageSelector: '#generalErrorPlaylist',
    });

    editValidator.init();

    const saveButton = document.getElementById('savePlaylistChangesButton');
    if (saveButton) {
      saveButton.addEventListener('click', async (e) => {
        e.preventDefault();

        const isValid = editValidator.validateForm();
        if (!isValid) {
          editValidator.showMessage('Пожалуйста, проверьте подсвеченные поля');
          return;
        }

        try {
          if (selectedAvatarFile) {
            const response = await apiServise.uploadPlaylistAvatar(selectedAvatarFile, this.playlistData.id);
            const newAvatarUrl = getValidImage(response.avatar_url);
            updateAvatarContainer('playlistAvatarContainer', newAvatarUrl);
            selectedAvatarFile = null;
          } else if (deleteAvatar) {
            await apiServise.deletePlaylistAvatar(this.playlistData.id);
            updateAvatarContainer('playlistAvatarContainer');
            deleteAvatar = false;
          }

          const newTitle = document.getElementById('titlePlaylist').value;
          const newDescription = document.getElementById('descriptionPlaylist').value;
          if (newTitle !== this.playlistData.title || newDescription !== this.playlistData.description) {
            this.playlistData.title = newTitle;
            this.playlistData.description = newDescription;
            await apiServise.updatePlaylist(newTitle, newDescription, this.playlistData.id);
            const title = document.querySelector('.album-card-title');
            if (title) {
              title.textContent = newTitle;
            }
            const description = document.getElementById('getDescription');
            const allDescription = document.getElementById('allDescription');
            if (description) {
              if (newDescription.trim() === '') {
                description.remove();
              } else {
                description.textContent = newDescription;
                if (allDescription) allDescription.textContent = newDescription;
              }
            } else if (newDescription.trim() !== '') {
              const container = document.querySelector('.album-card');
              const buttons = container.querySelector('.album-buttons');

              const newDescEl = document.createElement('div');
              newDescEl.className = 'card-sub album-description';
              newDescEl.id = 'getDescription';
              newDescEl.textContent = newDescription;
              if (allDescription) allDescription.textContent = newDescription;

              container.insertBefore(newDescEl, buttons);

              if (getDescriptionOverlay) {
                newDescEl.addEventListener('click', (e) => {
                  e.preventDefault();
                  getDescriptionOverlay.classList.add('active');
                });
              }
            }
          }
          editValidator.showMessage('Изменения успешно сохранены!', true);
          setTimeout(() => {
            const messageElement = document.getElementById('generalErrorPlaylist');
            if (messageElement) {
              messageElement.textContent = '';
              messageElement.classList.remove('show');
              messageElement.style.backgroundColor = '';
            }

            editPlaylistOverlay.classList.remove('active');
          }, 1000);
        } catch (err) {
          console.error('Ошибка при сохранении плейлиста:', err);
          let msg = 'Не удалось сохранить изменения. Попробуйте еще раз чуть позже.';
          if (err.message === 'bad request')
            msg = 'Что-то пошло не так. Пожалуйста, проверьте правильность введенных данных.';
          editValidator.showMessage(msg);
        }
      });
    }

    if (deletePlaylistButton) {
      deletePlaylistButton.addEventListener('click', (e) => {
        e.preventDefault();

        confirmation.showConfirm({
          title: 'Вы точно хотите удалить плейлист?',
          description: `Плейлист <b>${this.playlistData.title}</b> будет удалён <b>безвозвратно</b>`,
          confirmText: 'Удалить',
          cancelText: 'Закрыть',
          onConfirm: async () => {
            try {
              await apiServise.deletePlaylist(this.playlistData.id);
              router.navigate('/library');
            } catch (error) {
              console.error('Ошибка при удалении плейлиста:', error);
            }
          }
        });

      });
    }

    const tracksTemplate = Handlebars.templates['searchedTracks.hbs'];
    const searchTracks = document.getElementById('searchTracks');
    const searchedTracksContainer = document.getElementById('searchedTracksContainer');
    let currentResults = [];

    function debounce(fn, delay = 400) {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
      };
    }

    function renderResults(data) {
      let pageData = {
        searched_tracks: (data || []).map((track) => ({
          id: track.id,
          name: track.title,
          album: track.album.title,
          album_id: track.album.id,
          cover: getValidImage('albums/' + track.album.avatar_url, 'default-album.png'),
          artists: track.artists,
          plays: playsParser(track.play_count),
          duration: durationParser(track.duration_s),
          is_liked: track.is_liked,
        })),
      };

      currentResults = pageData.searched_tracks;
      searchedTracksContainer.innerHTML = tracksTemplate(pageData);

      playTrack();
    }

    if (searchTracks && searchedTracksContainer) {
      searchTracks.addEventListener(
        'input',
        debounce(async (e) => {
          const searchVal = e.target.value.trim();
          if (searchVal === '') {
            searchedTracksContainer.innerHTML = '';
            return;
          }

          const data = await apiServise.searchTrack(searchVal);
          renderResults(data);
        }, 400)
      );
    }

    if (searchedTracksContainer) {
      searchedTracksContainer.addEventListener('click', async (e) => {
        const button = e.target.closest('.add-track-size');
        if (!button) return;
        e.stopPropagation();

        const track = currentResults.find((t) => t.id === button.dataset.trackId);
        if (!track) return;

        const tracksTable = document.getElementById('addedTracksTable');
        const tracks = tracksTable.querySelectorAll('.playlist-track-number');
        const lastTrack = tracks.length ? tracks[tracks.length - 1] : null;

        track.num = lastTrack ? Number(lastTrack.textContent) + 1 : 1;

        await apiServise.addTrackToPlaylist(button.dataset.trackId, this.playlistData.id);

        const trackRow = Handlebars.templates['trackRow.hbs'];
        tracksTable.insertAdjacentHTML('beforeend', trackRow(track));

        const tracksNumElement = document.getElementById('tracksNum');
        const totalDurationElement = document.getElementById('totalDuration');

        tracksNumElement.textContent = tracksNumParser(parseInt(tracksNumElement.textContent) + 1);

        this.totalDuration += durationToSec(track.duration);
        totalDurationElement.textContent = totalDurationParser(this.totalDuration);

        let divider = document.getElementById('playlistTracksDivider');
        if (!divider) {
          const searchTitle = document.querySelector('.playlist-search-title');
          if (searchTitle) {
            searchTitle.insertAdjacentHTML(
              'beforebegin',
              '<div class="header-divider" id="playlistTracksDivider"></div>'
            );
          }
        }

        likeTrackBtn();
        playTrack();
      });
    }

    const addedTracksTable = document.getElementById('addedTracksTable');
    if (addedTracksTable) {
      addedTracksTable.addEventListener('click', async (e) => {
        const btn = e.target.closest('.delete-btn-track');
        if (!btn) return;
        e.stopPropagation();

        const row = btn.closest('.album-row.playlist-unfav');
        const trackId = btn.dataset.trackId;

        await apiServise.deleteTrackFromPlaylist(trackId, this.playlistData.id);

        const tracksNumElement = document.getElementById('tracksNum');
        const totalDurationElement = document.getElementById('totalDuration');

        tracksNumElement.textContent = tracksNumParser(parseInt(tracksNumElement.textContent) - 1);

        this.totalDuration -= durationToSec(row.querySelector('.track-duration')?.textContent);
        totalDurationElement.textContent = totalDurationParser(this.totalDuration);

        row.remove();
        const rows = document.querySelectorAll('#addedTracksTable .playlist-track-number');
        if (rows.length === 0) {
          document.getElementById('playlistTracksDivider')?.remove();
        }

        rows.forEach((numEl, i) => {
          numEl.textContent = i + 1;
        });
      });
    }
  }
}
