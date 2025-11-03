import { apiServise } from '../../data.js';
import { router } from '../../routing.js';
import { header } from '../header/header.js';
import { sidebar } from '../sidebar/sidebar.js';
import { initScrollbar } from '../../scrollbar.js';
import { slider } from '../../slider.js';
import { player } from '../player/player.js';

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
        cover: data.album.avatar_url,
        artist: data.album.artists[0],
        description: data.album.description,
      };
      let totalDuration = 0;
      pageData.tracks = (data.tracks || []).map((track) => {
        totalDuration += track.duration_s;
        return {
          id: track.id,
          name: track.title,
          plays: track.play_count,
          duration: track.duration_s,
        };
      });
      pageData.totalDuration = Math.floor(totalDuration / 60);
      pageData.tracksNum = pageData.tracks.length;
      pageData.firstTrack = pageData.tracks[0].id

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
  }
}
