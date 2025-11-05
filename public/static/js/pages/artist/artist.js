import { router } from '../../routing.js';
import { initScrollbar } from '../../scrollbar.js';
import { apiServise } from '../../data.js';
import { durationParser, getValidImage, playsParser } from '../../parsers.js';
import { header } from '../header/header.js';
import { sidebar } from '../sidebar/sidebar.js';
import { player } from '../player/player.js';
import { slider } from '../../slider.js';
import { playTrack } from '../../playTrackBtn.js';

export class ArtistPage {
  async render(id) {
    let pageData = {
      albums: [],
      popular_tracks: [],
      singls: [],
      similar_artists: [],
      nickname: 'Александр Константинов',
      letter: '',
      id: '',
    };

    const contentTemplateWithoutData = Handlebars.templates['artistPage.hbs'];
    document.getElementById('app').innerHTML = contentTemplateWithoutData(pageData);

    pageData.isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    pageData.letter = pageData.nickname ? pageData.nickname[0] : '';

    try {
      const data = await apiServise.getArtistPageData(id);
      pageData.id = data.artist.id;
      pageData.name = data.artist ? data.artist.name : 'Unknown Artist';
      pageData.id = data.artist.id;

      document.querySelector('head title').textContent = pageData.name;

      pageData.artist_header = getValidImage(`http://217.16.17.173:8099/avatars/artists/${data.artist.avatar_url}`);
      pageData.description = data.artist.description;
      pageData.listeners = data.artist.play_count || 0;

      pageData.similar_artists = (data.similar_artists || []).map((artist) => ({
        id: artist.id,
        name: artist.name,
        listeners: playsParser(artist.play_count) || 0,
        image: getValidImage(`http://217.16.17.173:8099/avatars/artists/${artist.avatar_url}`, 'default_artist_avatar.png'),
      }));
      pageData.popular_tracks = (data.popular_tracks || []).map((track) => ({
        id: track.id,
        name: track.title,
        plays: playsParser(track.play_count) || 0,
        album: track.album.title,
        album_id: track.album.id,
        duration: durationParser(track.duration_s),
        cover: getValidImage(`http://217.16.17.173:8099/avatars/albums/${track.album.avatar_url}`, 'default_album_avatar.png'),
        artists: track.artists,
      }));
      data.albums.forEach((album) => {
        const item = {
          id: album.id,
          name: album.title,
          cover: getValidImage(`http://217.16.17.173:8099/avatars/albums/${album.avatar_url}`, 'default_artist_avatar.png'),
          year: album.release_date ? album.release_date.slice(0, 4) : '',
          type: album.type,
        };

        if (album.type && (album.type === 'Сингл' || album.type === 'EP')) {
          pageData.singls.push(item);
        } else {
          pageData.albums.push(item);
        }
      });
    } catch (error) {
      console.error('Failed to load artist page data:', error);

      if (error.response && error.response.status === 404) {
        router.navigate('/not-found');
        return;
      }

      if (error.message && error.message.includes('Network')) {
        alert('Проблема с подключением. Попробуйте позже.');
        return;
      }

      alert('Не удалось загрузить страницу артиста.');
      return;
    }

    const contentTemplate = Handlebars.templates['artistPage.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);

    await Promise.all([header.render(), sidebar.render()]);

    slider.sliderFunction();
    initScrollbar();
    this.addEventListeners();
    playTrack();
  }

  addEventListeners() {
    const showInfoBtn = document.getElementById('showArtistDescription');
    const container = document.querySelector('.artist-container');

    if (showInfoBtn && container) {
      showInfoBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const wrapper = container.querySelector('.artist-description');

        if (container.classList.contains('expanded')) {
          wrapper.style.maxHeight = '35px';
          container.style.minHeight = '450px';
          setTimeout(() => {
            wrapper.style.removeProperty('-webkit-line-clamp');
            wrapper.style.setProperty('-webkit-line-clamp', '2');
            wrapper.style.removeProperty('white-space');
          }, 600);
        } else {
          wrapper.style.setProperty('-webkit-line-clamp', 'unset');
          const newHeight = 450 + wrapper.scrollHeight - 35;
          wrapper.style.maxHeight = wrapper.scrollHeight + 'px';
          container.style.minHeight = newHeight + 'px';
        }

        container.classList.toggle('expanded');
      });
    }
  }
}
