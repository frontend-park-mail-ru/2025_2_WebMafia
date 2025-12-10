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
import { likeChange, likeTrackBtn } from '@/utils/likeTrack';
import { images } from '@/assets';
import { albumPlaylistButtons } from '@/utils/albumPlaylistButtons.js';
import { share } from '@/utils/shareBtn';
import { deletePlaylistLogic } from '@/utils/deletePlaylist';
import { playlistModal } from "@/components/playlist_modal/initPlaylistModal.js";
import { showInfoMessage } from "@/utils/showInfoMessage.js";

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
    await Promise.all([header.render(), sidebar.render()]);

    try {
      const data = await apiServise.getPlaylistPageData(id, pageData.isAuthenticated);
      const firstTrackId = data.tracks && data.tracks.length > 0 ? data.tracks[0].id : null;
      pageData = {
        favourite: true,
        date: 'Создан автоматически',
        title: 'Понравившиеся треки',
        image: images.likedTracksPath,
        description: 'В этот плейлист попадают треки, которым вы поставили отметку "Нравится"',
        track_id: firstTrackId,
      };
      if (id !== 'LM') {
        pageData.favourite = false;
        pageData.title = data.title;
        pageData.id = data.id;
        pageData.date = dateParser(data.created_at);
        pageData.image = getValidImage(data.avatar_url ? data.avatar_url : '', images.defaultPlaylistPath);
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
          cover: getValidImage('albums/' + track.album.avatar_url, images.defaultAlbumPath),
          artists: track.artists,
          plays: playsParser(track.play_count),
          duration: durationParser(track.duration_s),
          is_liked: pageData.favourite ? true : track.is_liked,
        };
      });

      this.playlistData.id = pageData.id;
      this.playlistData.title = pageData.title;
      this.playlistData.description = pageData.description;
      this.playlistData.image = pageData.image === images.defaultPlaylistPath ? null : pageData.image;

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
    this.addEventListeners();
    setPlayButtonsOnAuth();
    likeTrackBtn();
    playTrack();
    albumPlaylistButtons();
    share();
  }

  addEventListeners() {
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
      return;
    }

    const editPlaylistButton = document.getElementById('editPlaylistButton');
    if (editPlaylistButton) {
      editPlaylistButton.addEventListener('click', (e) => {
        e.preventDefault();
        playlistModal.openEdit(this.playlistData, (newData) => {
          this.playlistData = newData;

          const avatarContainer = document.querySelector('#playlistAvatarContainer img');
          avatarContainer.src = newData.image ? newData.image : images.defaultPlaylistPath;

          const title = document.querySelector('.album-card-title');
          if (title) title.textContent = newData.title;

          const description = document.getElementById('getDescription');
          const allDescription = document.getElementById('allDescription');
          if (description) {
            if (newData.description.trim() === '') {
              description.remove();
            } else {
              description.textContent = newData.description;
              if (allDescription) allDescription.textContent = newData.description;
            }
          } else if (newData.description.trim() !== '') {
            const container = document.querySelector('.album-card');
            const buttons = container.querySelector('.album-buttons');

            const newDescEl = document.createElement('div');
            newDescEl.className = 'card-sub album-description';
            newDescEl.id = 'getDescription';
            newDescEl.textContent = newData.description;
            if (allDescription) allDescription.textContent = newData.description;

            container.insertBefore(newDescEl, buttons);

            const getDescriptionOverlay = document.getElementById('descriptionOverlay');
            if (getDescriptionOverlay) {
              newDescEl.addEventListener('click', (e) => {
                e.preventDefault();
                getDescriptionOverlay.classList.add('active');
              });
            }
          }

          showInfoMessage('Изменения успешно сохранены!');
        });
      });
    }

    const deletePlaylistButton = document.getElementById('deletePlaylistButton');
    if (deletePlaylistButton) {
      deletePlaylistButton.addEventListener('click', (e) => {
        e.preventDefault();
        deletePlaylistLogic(this.playlistData.id, this.playlistData.title, () => {
          router.navigate('/library');
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
          cover: getValidImage('albums/' + track.album.avatar_url, images.defaultPlaylistPath),
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
