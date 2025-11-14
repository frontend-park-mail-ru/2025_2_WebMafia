import { apiServise } from '../../data.js';
import { router } from '../../routing.js';
import { header } from '../header/header.js';
import { sidebar } from '../sidebar/sidebar.js';
import { initScrollbar } from '../../scrollbar.js';
import { slider } from '../../slider.js';
import { playsParser, durationParser, getValidImage, totalDurationParser, tracksNumParser } from '../../parsers.js';
import { playTrack } from '../../playTrackBtn.js';
import { setPlayButtonsOnAuth } from '../../setPlayButtonsOnAuth.js';
import { playerOnlyOnPlay } from '../../playerOnlyOnplay.js';

export class AlbumPage {
  async render(id) {
    let pageData = {};

    const contentTemplateWithoutData = Handlebars.templates['album.hbs'];
    document.getElementById('app').innerHTML = contentTemplateWithoutData(pageData);
    document.querySelector('head title').textContent = 'Wave Music';

    try {
      const data = await apiServise.getAlbumPageData(id);
      pageData = {
        id: data.album.id,
        title: data.album.title,
        type: data.album.type,
        year: data.album.release_date ? data.album.release_date.slice(0, 4) : '',
        cover: getValidImage('albums/' + data.album.avatar_url, 'default-album.png'),
        artist: {
          id: data.album.artists[0].id,
          name: data.album.artists[0].name,
          avatar: getValidImage('artists/' + data.album.artists[0].avatar_url, 'default-album.png'),
        },
        description: data.album.description,
      };
      let totalDuration = 0;
      pageData.tracks = (data.tracks || []).map((track) => {
        totalDuration += track.duration_s;
        return {
          id: track.id,
          name: track.title,
          plays: playsParser(track.play_count),
          duration: durationParser(track.duration_s),
        };
      });
      pageData.totalDuration = totalDurationParser(totalDuration);
      pageData.tracksNum = tracksNumParser(pageData.tracks.length);
      if (pageData.tracksNum) pageData.firstTrack = pageData.tracks[0].id;
      console.log(pageData.description);
    } catch (error) {
      console.error('Failed to load album page data:', error);

      if (error.response && error.response.status === 404) {
        router.navigate('/not-found');
        return;
      }

      if (error.message && error.message.includes('Network')) {
        alert('Проблема с подключением. Попробуйте позже.');
        return;
      }

      alert('Не удалось загрузить страницу альбома.');
      return;
    }

    const contentTemplate = Handlebars.templates['album.hbs'];
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
    const getDescriptionOverlay = document.getElementById('albumDescriptionOverlay');

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
  }
}
