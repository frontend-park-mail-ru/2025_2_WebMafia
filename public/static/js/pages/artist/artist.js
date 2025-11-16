import { router } from '@/routing.js';
import { initScrollbar } from '@/scrollbar.js';
import { apiServise } from '@/data.js';
import { durationParser, getValidImage, playsParser } from '@/parsers.js';
import { header } from '@/components/header/header.js';
import { sidebar } from '@/components/sidebar/sidebar.js';
import { slider } from '@/slider.js';
import { playTrack } from '@/playTrackBtn.js';
import { setPlayButtonsOnAuth } from '@/setPlayButtonsOnAuth.js';

export class ArtistPage {
  async render(id) {
    let pageData = {
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
      albums: [],
      popular_tracks: [],
      singls: [],
      similar_artists: [],
    };

    const contentTemplateWithoutData = Handlebars.templates['artistPage.hbs'];
    document.getElementById('app').innerHTML = contentTemplateWithoutData(pageData);
    document.querySelector('head title').textContent = 'Wave music';

    try {
      const data = await apiServise.getArtistPageData(id);
      pageData.id = data.artist.id;
      pageData.name = data.artist ? data.artist.name : 'Unknown Artist';
      pageData.artist_header = getValidImage('artists/' + data.artist.header_url, 'default-artist.png');
      pageData.description = data.artist.description;
      pageData.listeners = data.artist.play_count || 0;
      pageData.similar_artists = (data.similar_artists || []).map((artist) => ({
        id: artist.id,
        name: artist.name,
        listeners: playsParser(artist.play_count) || 0,
        image: getValidImage('artists/' + artist.avatar_url, 'default-artist.png'),
      }));
      pageData.popular_tracks = (data.popular_tracks || []).map((track) => ({
        id: track.id,
        name: track.title,
        plays: playsParser(track.play_count) || 0,
        album: track.album.title,
        album_id: track.album.id,
        duration: durationParser(track.duration_s),
        cover: getValidImage('albums/' + track.album.avatar_url, 'default-album.png'),
        artists: track.artists,
      }));
      data.albums.forEach((album) => {
        const item = {
          id: album.id,
          name: album.title,
          cover: getValidImage('albums/' + album.avatar_url, 'default-album.png'),
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
    document.querySelector('head title').textContent = pageData.name;

    await Promise.all([header.render(), sidebar.render()]);

    slider.sliderFunction();
    initScrollbar();
    this.addEventListeners();
    setPlayButtonsOnAuth();
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
