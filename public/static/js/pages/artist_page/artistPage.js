import { apiServise } from '../../data.js';
import { router } from '../../routing.js';
import { initScrollbar } from '../../scrollbar.js'

export class ArtistPage {
  async render() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      router.navigate('/login');
      return;
    }

    let pageData = {
      isAuthenticated: true,
      albums: [],
      popular_tracks: [],
      singls: [],
      similar_artists: [],
    };

    /*try {
      const data = await apiServise.getArtistPageData();
      pageData.artists = (data.artists || []).map((artist) => ({
        id: artist.artist_id,
        name: artist.name,
        image: `static/img/${artist.avatar_url || 'default-artist.png'}`,
      }));
      pageData.albums = (data.albums || []).map((album) => ({
        id: album.album_id,
        name: album.title,
        image: `static/img/${album.avatar_url || 'default-album.png'}`,
        artist: album.artist ? album.artist.name : 'Unknown Artist',
      }));
      pageData.tracks = (data.tracks || []).map((track) => ({
        id: track.track_id,
        name: track.title,
        image: `static/img/${track.album.avatar_url || 'default-album.png'}`,
        artists: track.artists,
      }));
    } catch (error) {
      console.error('Failed to load main page data:', error.message);
      localStorage.removeItem('isAuthenticated');
      router.navigate('/login');
      return;
    }*/

    const contentTemplate = Handlebars.templates['artistPage.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);

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
          container.style.minHeight = '430px';
        } else {
          const newHeight = 430 + wrapper.scrollHeight - 35;
          wrapper.style.maxHeight = wrapper.scrollHeight + 'px';
          container.style.minHeight = newHeight + 'px';
        }

        container.classList.toggle('expanded');
      });
    }
  }
}
