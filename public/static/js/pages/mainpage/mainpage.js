import { apiServise } from '../../data.js';
import { router } from '../../routing.js';
import { header } from '../header/header.js';
import { sidebar } from '../sidebar/sidebar.js';
import { initScrollbar } from "../../scrollbar.js";
import { slider } from '../../slider.js';
import { player } from '../player/player.js';

export class MainPage {
  async render() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      router.navigate('/login');
      return;
    }

    let pageData = {
      isAuthenticated: true,
      artists: [],
      albums: [],
      tracks: [],
    };

    const contentTemplateWithoutData = Handlebars.templates['MainPage.hbs'];
    document.getElementById('app').innerHTML = contentTemplateWithoutData(pageData);

    try {
      const data = await apiServise.getMainPageData();
      pageData.artists = (data.artists || []).map((artist) => ({
        id: artist.id,
        name: artist.name,
        listeners: artist.listeners || 0,
        //Заглушки пока не доделана minio
        image: artist.avatar_url.startsWith('http')
          ? artist.avatar_url
          : `static/img/${artist.avatar_url || 'default_artist_avatar.png'}`,
      }));
      pageData.albums = (data.albums || []).map((album) => ({
        id: album.id,
        name: album.title,
        image: album.avatar_url.startsWith('http')
          ? album.avatar_url :
          `static/img/${album.avatar_url || 'default_artist_avatar.png'}`,
        artist: album.artists ? album.artists[0].name : 'Unknown Artist',
      }));
      pageData.tracks = (data.tracks || []).map((track) => ({
        id: track.id,
        name: track.title,
        image: track.album.avatar_url.startsWith('http')
          ? track.album.avatar_url
          : `static/img/${track.album.avatar_url || 'default_artist_avatar.png'}`,
        artists: track.artists,
      }));
    } catch (error) {
      console.error('Failed to load main page data:', error.message);
      localStorage.removeItem('isAuthenticated');
      router.navigate('/login');
      return;
    }

    const contentTemplate = Handlebars.templates['MainPage.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);

    header.render();
    sidebar.render();
    player.render();

    slider.sliderFunction();
    this.nowPlayingCardSlider();
    initScrollbar();
  }

  nowPlayingCardSlider() {
    const prevBtn = document.querySelector('.current-card-btn.prev');
    const nextBtn = document.querySelector('.current-card-btn.next');

    let cards = [
      { img: '/static/img/image11.jpg', name: 'Tyler, the Creator' },
      { img: '/static/img/image12.jpg', name: 'Playboi carti' },
      { img: '/static/img/image13.jpg', name: 'Jpegmafia' },
    ];

    let currentIndex = 1;

    function renderCards() {
      const prevIndex = (currentIndex - 1 + cards.length) % cards.length;
      const nextIndex = (currentIndex + 1) % cards.length;

      document.querySelector('.now-playing-container-card-previous img').src = cards[prevIndex].img;
      document.querySelector('.now-playing-container-card-next img').src = cards[nextIndex].img;
      document.querySelector('.now-playing-container-card-current img').src = cards[currentIndex].img;
      document.querySelector('.current-card-name').textContent = cards[currentIndex].name;
    }

    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + cards.length) % cards.length;
      renderCards();
    });

    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % cards.length;
      renderCards();
    });
  }
}
