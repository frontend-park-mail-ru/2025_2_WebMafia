import { apiServise } from '../../data.js';
import { router } from '../../routing.js';
import { header } from '../header/header.js';
import { sidebar } from '../sidebar/sidebar.js';
import { initScrollbar } from '../../scrollbar.js';
import { slider } from '../../slider.js';
import { playsParser, durationParser, getValidImage, totalDurationParser, tracksNumParser, dateParser } from '../../parsers.js';
import { playTrack } from '../../playTrackBtn.js';
import { setPlayButtonsOnAuth } from '../../setPlayButtonsOnAuth.js';
import { playerOnlyOnPlay } from '../../playerOnlyOnplay.js';

export class PlaylistPage {
  async render(id) {
    let pageData = {};

    const contentTemplate = Handlebars.templates['playlist.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);
    document.querySelector('head title').textContent = 'Wave Music';

    try {
      const data = await apiServise.getPlaylistPageData(id);
      pageData = {
        id: data.playlist.id,
        title: data.playlist.title,
        date: dateParser(data.playlist.created_at),
        cover: getValidImage(data.playlist.avatar_url ? 'playlist/' + data.playlist.avatar_url : '', 'default-playlist.png'),
        description: data.playlist.description,
      };
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
        };
      });
      pageData.totalDuration = totalDurationParser(totalDuration);
      pageData.tracksNum = tracksNumParser(pageData.tracks.length);
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
    playTrack();
  }

  addEventListeners() {
    const getDescriptionButton = document.getElementById('getDescription');
    const getDescriptionOverlay = document.getElementById('descriptionOverlay');

    if (getDescriptionButton && getDescriptionOverlay) {
      getDescriptionButton.addEventListener('click', (e) => {
        e.preventDefault();
        getDescriptionOverlay.classList.add('active');
      });
    }

    const closeDescriptionButton = document.getElementById('closeDescriptionButton');
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
}
