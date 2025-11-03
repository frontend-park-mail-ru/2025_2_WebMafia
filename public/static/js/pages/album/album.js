import { apiServise } from '../../data.js';
import { router } from '../../routing.js';
import { header } from '../header/header.js';
import { sidebar } from '../sidebar/sidebar.js';
import { initScrollbar } from '../../scrollbar.js';
import { slider } from '../../slider.js';
import { player } from '../player/player.js';
import { playsParser, durationParser, getValidImage, totalDurationParser, tracksNumParser } from "../../parsers.js";

export class AlbumPage {
  async render(id) {
    let pageData = {};

    const contentTemplateWithoutData = Handlebars.templates['album.hbs'];
    document.getElementById('app').innerHTML = contentTemplateWithoutData(pageData);

    try {
      const data = await apiServise.getAlbumPageData(id);
      pageData = {
        title: data.album.title,
        type: data.album.type,
        year: data.album.release_date ? data.album.release_date.slice(0, 4) : '',
        cover: getValidImage(data.album.avatar_url, 'default-album.png'),
        artist: data.album.artists[0],
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

    await Promise.all([
      header.render(),
      sidebar.render(),
      player.render(),
    ]);

    slider.sliderFunction();
    initScrollbar();
    this.addEventListeners();
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
