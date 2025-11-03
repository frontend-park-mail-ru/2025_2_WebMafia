import { router } from '../../routing.js';
//import { apiServise } from '../../data.js';
import { initPasswordShowing } from '../../eye.js';
import { initScrollbar } from '../../scrollbar.js';
import { getValidImage } from "../../parsers.js";

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
      recent: [],
      avatar: '',
      email: '',
      password: '',
      nickname: '',
    };

    try {
      const data = await apiServise.getProfilePageData();
      pageData.artists = (data.artists || []).map((artist) => ({
        id: artist.id,
        name: artist.name,
        image: getValidImage(artist.avatar_url, 'default-artist.png'),
      }));
      pageData.top_tracks = (data.tracks || []).map((track) => ({
        id: track.id,
        name: track.title,
        image: getValidImage(track.album.avatar_url, 'default-album.png'),
        artists: track.artists,
      }));
      pageData.recent = (data.recent || []).map((artist) => ({
        id: artist.id,
        name: artist.name,
        image: getValidImage(artist.avatar_url, 'default-artist.png'),
      }));
    } catch (error) {
      console.error('Failed to load profile page data:', error);

      if (error.response && error.response.status === 404) {
        router.navigate('/not-found');
        return;
      }

      if (error.message && error.message.includes('Network')) {
        alert('Проблема с подключением. Попробуйте позже.');
        return;
      }

      alert('Не удалось загрузить страницу профиля.');
      return;
    }

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
