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
import { likeChange, likeTrackBtn } from '../../utils/likeTrack';
import { player } from '@/components/player/player';
import { createPlaylis } from '@/utils/initCreatePlaylist';

export class PlaylistPage {
  constructor() {
    this.playlistData = {};
    this.totalDuration = 0;
  }

  async render(id) {
    let pageData = {};

    const contentTemplate = Handlebars.templates['playlist.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);
    document.querySelector('head title').textContent = 'Wave Music';

    try {
      const data = await apiServise.getPlaylistPageData(id);
      this.playlistData = data.playlist;
      const firstTrackId = data.tracks && data.tracks.length > 0 ? data.tracks[0].id : null;
      if (data.playlist.is_favorite) {
        pageData = {
          favourite: true,
          id: data.playlist.id,
          title: data.playlist.title,
          date: dateParser(data.playlist.created_at),
          cover: 'static/img/liked_tracks.png',
          description: data.playlist.description,
          track_id: firstTrackId,
        };
      } else {
        pageData = {
          favourite: false,
          id: data.playlist.id,
          title: data.playlist.title,
          date: dateParser(data.playlist.created_at),
          cover: getValidImage(data.playlist.avatar_url ? data.playlist.avatar_url : '', 'default-playlist.png'),
          description: data.playlist.description,
          track_id: firstTrackId,
        };
      }
      let totalDuration = 0;
      pageData.tracks = (data.tracks || []).map((track) => {
        totalDuration += track.duration_s;
        if (data.playlist.is_favorite) {
          return {
            id: track.id,
            name: track.title,
            album: track.album.title,
            album_id: track.album.id,
            cover: getValidImage('albums/' + track.album.avatar_url, 'default-album.png'),
            artists: track.artists,
            plays: playsParser(track.play_count),
            duration: durationParser(track.duration_s),
            is_liked: track.is_liked,
          };
        } else {
          return {
            id: track.id,
            name: track.title,
            album: track.album.title,
            album_id: track.album.id,
            cover: getValidImage('albums/' + track.album.avatar_url, 'default-album.png'),
            artists: track.artists,
            plays: playsParser(track.play_count),
            duration: durationParser(track.duration_s),
            is_liked: track.is_liked,
          };
        }
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
    await Promise.all([header.render(), sidebar.render()]);
    slider.sliderFunction();
    initScrollbar();
    this.addEventListeners(this.playlistData.id);
    createPlaylis();
    setPlayButtonsOnAuth();
    likeTrackBtn();
    playTrack();
  }

  addEventListeners(playlistId) {
    const getDescriptionButton = document.getElementById('getDescription');
    const getDescriptionOverlay = document.getElementById('descriptionOverlay');

    const editPlaylistButton = document.querySelector('.actions-item.edit');
    const deletePlaylistButton = document.querySelector('.actions-item.delete');
    const editPlaylistOverlay = document.getElementById('editPlaylistOverlay');
    const closeOverlayButton = document.getElementById('closeOverlayButtonPlaylist');
    const playlistShuffleBtn = document.querySelector('.album-buttons .control-btn.shuffle-album');
    if (playlistShuffleBtn) {
      if (player.isShaffle) {
        playlistShuffleBtn.classList.add('active');
      }
      playlistShuffleBtn.addEventListener('click', () => {
        player.handleShaffleClick();
      });
    }

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
            const response = await apiServise.uploadPlaylistAvatar(selectedAvatarFile, playlistId);
            const newAvatarUrl = getValidImage(response.avatar_url);
            updateAvatarContainer('playlistAvatarContainer', newAvatarUrl);
            selectedAvatarFile = null;
          } else if (deleteAvatar) {
            await apiServise.deletePlaylistAvatar(playlistId);
            updateAvatarContainer('playlistAvatarContainer');
            deleteAvatar = false;
          }

          const newTitle = document.getElementById('titlePlaylist').value;
          const newDescription = document.getElementById('descriptionPlaylist').value;
          console.log(newTitle, newDescription);
          if (newTitle !== this.playlistData.title || newDescription !== this.playlistData.description) {
            await apiServise.updatePlaylist(newTitle, newDescription, playlistId);
            const title = document.querySelector('.album-card-title');
            if (title) {
              title.textContent = newTitle;
            }
            const dscription = document.getElementById('getDescription');
            if (dscription) {
              dscription.textContent = newDescription;
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

    const warningOverlay = document.getElementById('warningOverlayPlayer');
    if (deletePlaylistButton) {
      deletePlaylistButton.addEventListener('click', async (e) => {
        e.preventDefault();
        warningOverlay.classList.add('active');
        const closeBtn = document.getElementById('cancelActionPlaylist');
        const confirmBtn = document.getElementById('confirmActionPlaylist');
        if (closeBtn) {
          closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            warningOverlay.classList.remove('active');
          });
        }
        if (confirmBtn) {
          confirmBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await apiServise.deletePlaylist(playlistId);
            router.navigate('/library');
          });
        }
      });
    }
    const closeDescriptionButton = document.getElementById('closeDescriptionButton');
    const closeWarningBtn = document.getElementById('closeWarningBtnPlaylist');

    if (closeWarningBtn && warningOverlay) {
      closeWarningBtn.addEventListener('click', (e) => {
        e.preventDefault();

        warningOverlay.classList.remove('active');
      });
    }

    if (warningOverlay) {
      warningOverlay.addEventListener('click', (e) => {
        if (e.target === warningOverlay) {
          warningOverlay.classList.remove('active');
        }
      });
    }

    if (getDescriptionButton && getDescriptionOverlay) {
      getDescriptionButton.addEventListener('click', (e) => {
        e.preventDefault();
        getDescriptionOverlay.classList.add('active');
      });
    }

    if (closeDescriptionButton && getDescriptionOverlay) {
      closeDescriptionButton.addEventListener('click', (e) => {
        e.preventDefault();
        getDescriptionOverlay.classList.remove('active');
      });
    }

    if (getDescriptionOverlay) {
      getDescriptionOverlay.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target === getDescriptionOverlay) {
          getDescriptionOverlay.classList.remove('active');
        }
      });
    }

    const dotsBtn = document.getElementById('playlistActions');
    const menu = document.getElementById('playlistMenu');

    if (dotsBtn && menu) {
      dotsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        menu.classList.toggle('hidden');

        const rect = dotsBtn.getBoundingClientRect();
        const parentRect = dotsBtn.parentElement.getBoundingClientRect();

        const top = rect.top - parentRect.top - menu.offsetHeight - 6;
        const left = rect.left - parentRect.left - 10;

        menu.style.top = `${top}px`;
        menu.style.left = `${left}px`;
      });

      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !dotsBtn.contains(e.target)) {
          menu.classList.add('hidden');
        }
      });
    }

    const tracksTemplate = Handlebars.templates['searchedTracks.hbs'];
    const searchTracks = document.getElementById('searchTracks');
    const searchedTracksContainer = document.getElementById('searchedTracksContainer');
    if (searchTracks && searchedTracksContainer) {
      searchTracks.addEventListener('input', async (e) => {
        const searchVal = e.target.value;
        if (searchVal === '') return;

        const data = await apiServise.searchTrack(searchVal);

        let pageData = {
          searched_tracks: [],
        };

        pageData.searched_tracks = (data || []).map((track) => ({
          id: track.id,
          name: track.title,
          album: track.album.title,
          album_id: track.album.id,
          cover: getValidImage('albums/' + track.album.avatar_url, 'default-album.png'),
          artists: track.artists,
          plays: playsParser(track.play_count),
          duration: durationParser(track.duration_s),
          is_liked: track.is_liked,
        }));

        searchedTracksContainer.innerHTML = tracksTemplate(pageData);
        playTrack();

        const addButtons = searchedTracksContainer.querySelectorAll('.add-track-size');
        addButtons.forEach((button) => {
          button.addEventListener('click', (e) => {
            e.stopPropagation();

            const track = pageData.searched_tracks.find((t) => t.id === button.dataset.trackId);
            if (!track) return;

            const tracksTable = document.getElementById('addedTracksTable');
            const tracks = tracksTable.querySelectorAll('.playlist-track-number');
            const lastTrack = tracks.length ? tracks[tracks.length - 1] : null;

            track.num = lastTrack ? Number(lastTrack.textContent) + 1 : 1;
            // track.is_liked = null;

            apiServise.addTrackToPlaylist(button.dataset.trackId, playlistId);

            const trackRow = Handlebars.templates['trackRow.hbs'];
            tracksTable.insertAdjacentHTML('beforeend', trackRow(track));

            const tracksNumElement = document.getElementById('tracksNum');
            const totalDurationElement = document.getElementById('totalDuration');

            tracksNumElement.textContent = tracksNumParser(parseInt(tracksNumElement.textContent) + 1);

            this.totalDuration += durationToSec(track.duration);
            totalDurationElement.textContent = totalDurationParser(this.totalDuration);

            likeTrackBtn();
            playTrack();
          });
        });
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

        await apiServise.deleteTrackFromPlaylist(trackId, playlistId);

        const tracksNumElement = document.getElementById('tracksNum');
        const totalDurationElement = document.getElementById('totalDuration');

        tracksNumElement.textContent = tracksNumParser(parseInt(tracksNumElement.textContent) - 1);

        this.totalDuration -= durationToSec(row.querySelector('.track-duration')?.textContent);
        totalDurationElement.textContent = totalDurationParser(this.totalDuration);

        row.remove();
        const rows = document.querySelectorAll('#addedTracksTable .playlist-track-number');

        rows.forEach((numEl, i) => {
          numEl.textContent = i + 1;
        });
      });
    }
  }
}
