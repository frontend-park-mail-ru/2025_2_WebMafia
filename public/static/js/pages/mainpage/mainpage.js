import { apiServise } from '../../data.js';
import { router } from '../../routing.js';
import { header } from '../header/header.js';
import { sidebar } from '../sidebar/sidebar.js';
import { initScrollbar } from '../../scrollbar.js';
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
      nickname: 'Александр Константинов',
      letter: '',
    };

    const contentTemplateWithoutData = Handlebars.templates['MainPage.hbs'];
    document.getElementById('app').innerHTML = contentTemplateWithoutData(pageData);

    function getValidImage(url, defaultImage) {
      if (!url) return `static/img/${defaultImage}`;
      return url.startsWith('http') ? url : `static/img/${url}`;
    }

    pageData.letter = pageData.nickname ? pageData.nickname[0] : '';

    try {
      const data = await apiServise.getMainPageData();
      pageData.artists = (data.artists || []).map((artist) => ({
        id: artist.id,
        name: artist.name,
        listeners: artist.listeners || 0,
        //Заглушки пока не доделана minio
        image: getValidImage(artist.avatar_url, 'default_artist_avatar.png'),
      }));
      pageData.albums = (data.albums || []).map((album) => ({
        id: album.id,
        name: album.title,
        image: getValidImage(album.avatar_url, 'default_album_avatar.png'),
        artist: album.artists ? album.artists[0].name : 'Unknown Artist',
      }));
      pageData.tracks = (data.tracks || []).map((track) => ({
        id: track.id,
        name: track.title,
        image: getValidImage(track.album.avatar_url, 'default_album_avatar.png'),
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
    this.playTrack();
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

  playTrack() {
    const playBtn = document.querySelectorAll('.play-button-track, .play-button');
    let currentTrackId = null;

    playBtn.forEach((button) => {
      button.addEventListener('click', (event) => {
        const trackId = event.currentTarget.dataset.trackId;
        if (currentTrackId !== trackId) {
          currentTrackId = trackId;
          player.loadAndPlayTrackById(trackId);
          player.audio.addEventListener('playing', updateButtons, { once: true });
        } else {
          player.togglePlayPause();
        }
        updateButtons();
      });
    });
    player.audio.addEventListener('canplay', () => {
      updateButtons();
    });
    player.audio.addEventListener('play', updateButtons);
    player.audio.addEventListener('pause', updateButtons);
    if (player.currentTrack) {
      updateButtons();
    }
    function updateButtons() {
      const playerTrackId = player.currentTrack.id;
      playBtn.forEach((button) => {
        const buttonTrackId = button.dataset.trackId;

        if (buttonTrackId === playerTrackId) {
          button.classList.add('is-active');
          if (player.audio.paused) {
            button.classList.remove('paused');
          } else {
            button.classList.add('paused');
          }
        } else {
          button.classList.remove('is-active');
          button.classList.remove('paused');
        }
      });
    }
  }
}
