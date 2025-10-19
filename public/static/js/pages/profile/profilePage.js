import { router } from '../../routing.js';
//import { apiServise } from '../../data.js';
import { initPasswordShowing } from '../../eye.js';
import { initScrollbar } from "../../scrollbar.js";

export class ProfilePage {
  async render() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      router.navigate('/login');
      return;
    }

    let pageData = {
      isAuthenticated: true,
      top_artists: [],
      top_tracks: [],
      recent_tracks: [],
      avatar: '',
      email: '',
      password: '',
      nickname: '',
    };

    /*try {
      const data = await apiServise.getProfilePageData();
      pageData.artists = (data.artists || []).map((artist) => ({
        id: artist.artist_id,
        name: artist.name,
        image: `static/img/${artist.avatar_url || 'default-artist.png'}`,
      }));
      pageData.tracks = (data.tracks || []).map((track) => ({
        id: track.track_id,
        name: track.title,
        image: `static/img/${track.album.avatar_url || 'default-album.png'}`,
        artists: track.artists,
      }));
      pageData.recently = (data.recently || []).map((track) => ({
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

    const contentTemplate = Handlebars.templates['profilePage.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);

    this.addEventListeners();
    initPasswordShowing();
    initScrollbar();
  }

  addEventListeners() {
    const editProfileButton = document.getElementById('editProfileBtn');
    const editProfileOverlay = document.getElementById('editProfileOverlay');

    if (editProfileButton && editProfileOverlay) {
      editProfileButton.addEventListener('click', (e) => {
        e.preventDefault();
        editProfileOverlay.classList.add('active');
      });
    }

    const closeEditButton = document.getElementById('closeEditButton');
    if (closeEditButton && editProfileOverlay) {
      closeEditButton.addEventListener('click', (e) => {
        e.preventDefault();
        editProfileOverlay.classList.remove('active');
      });
    }

    if (editProfileOverlay) {
      editProfileOverlay.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target === editProfileOverlay) {
          editProfileOverlay.classList.remove('active');
        }
      });
    }
  }
}
