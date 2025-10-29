import { router } from '../../routing.js';
import { initScrollbar } from '../../scrollbar.js';
import { apiServise } from "../../data.js";

export class ArtistPage {
  playsParser(plays) {
    if (plays > 1_000_000_000) {
      const value = plays / 1_000_000_000;
      plays = (value < 10 ? value.toFixed(1) : value.toFixed(0)).replace('.', ',') + ' млрд';
    } else if (plays > 1_000_000) {
      const value = plays / 1_000_000;
      plays = (value < 10 ? value.toFixed(1) : value.toFixed(0)).replace('.', ',') + ' млн';
    } else if (plays > 1_000) {
      const value = plays / 1_000;
      plays = (value < 10 ? value.toFixed(1) : value.toFixed(0)).replace('.', ',') + ' тыс';
    }

    return plays;
  }

  durationParser(duration) {
    const duration_m = Math.floor(duration / 60);
    const duration_s = duration - duration_m * 60;
    return duration_s < 10 ? `${duration_m}:0${duration_s}` : `${duration_m}:${duration_s}`;
  }

  async render(id) {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      router.navigate('/login');
      return;
    }

    let pageData = {
      isAuthenticated: isAuthenticated,
      albums: [],
      popular_tracks: [],
      singls: [],
      similar_artists: [],
      listeners: 13267225,
    };

    function getValidImage(url, defaultImage) {
      if (!url) return `static/img/${defaultImage}`;
      return url.startsWith('http') ? url : `static/img/${url}`;
    }

    try {
      const data = await apiServise.getArtistPageData(id);
      pageData.name = data.artist ? data.artist.name : 'Unknown Artist';
      pageData.artist_header = getValidImage(data.artist.avatar_url);
      pageData.description = data.artist.description;
      pageData.similar_artists = (data.similar_artists || []).map((artist) => ({
        id: artist.id,
        name: artist.name,
        listeners: 0,
        image: getValidImage(artist.avatar_url, 'default-artist.png'),
      }));
      pageData.popular_tracks = (data.popular_tracks || []).map((track) => ({
        id: track.id,
        name: track.title,
        plays: 0,
        album: track.album.title,
        album_id: track.album.id,
        duration: this.durationParser(track.duration_s),
        cover: getValidImage(track.album.avatar_url, 'default-album.png'),
        artists: track.artists,
      }));
      data.albums.forEach(album => {
        const item = {
          id: album.album_id,
          name: album.title,
          cover: getValidImage(album.avatar_url, 'default-album.png'),
          release_year: album.release_year,
        };

        if (album.type && album.type === 'Альбом') {
          pageData.albums.push(item);
        } else {
          pageData.singls.push(item);
        }
      });
    } catch (error) {
      console.error('Failed to load artist page data:', error.message);
      localStorage.removeItem('isAuthenticated');
      router.navigate('/login');
      return;
    }

    pageData.popular_tracks = pageData.popular_tracks.map((track) => ({
      ...track,
      plays: this.playsParser(track.plays),
    }));
    pageData.similar_artists = pageData.similar_artists.map((artist) => ({
      ...artist,
      listeners: this.playsParser(artist.listeners),
    }));
    pageData.listeners = this.playsParser(pageData.listeners);
    Handlebars.registerHelper('numeration', function (value) {
      return parseInt(value) + 1;
    });
    const contentTemplate = Handlebars.templates['artistPage.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);
    console.log(pageData);

    initScrollbar();
    this.addEventListeners();
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
