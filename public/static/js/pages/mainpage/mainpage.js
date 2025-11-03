import { apiServise } from '../../data.js';
import { router } from '../../routing.js';
import { header } from '../header/header.js';
import { sidebar } from '../sidebar/sidebar.js';
import { initScrollbar } from '../../scrollbar.js';
import { slider } from '../../slider.js';
import { player } from '../player/player.js';
import { playTrack } from '../../playTrackBtn.js';
import { getValidImage, playsParser } from '../../parsers.js';

export class MainPage {
  async render() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    // if (!isAuthenticated) {
    //   router.navigate('/login');
    //   return;
    // }

    let pageData = {
      isAuthenticated: isAuthenticated,
      artists: [],
      albums: [],
      tracks: [],
      nickname: 'Александр Константинов',
      letter: '',
    };

    const contentTemplateWithoutData = Handlebars.templates['MainPage.hbs'];
    document.getElementById('app').innerHTML = contentTemplateWithoutData(pageData);

    pageData.isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    pageData.letter = pageData.nickname ? pageData.nickname[0] : '';

    try {
      const data = await apiServise.getMainPageData();
      pageData.artists = (data.artists || []).map((artist) => ({
        id: artist.id,
        name: artist.name,
        listeners: playsParser(artist.listeners || 0),
        image: getValidImage(artist.avatar_url, 'default_artist_avatar.png'),
      }));
      pageData.albums = (data.albums || []).map((album) => ({
        id: album.id,
        name: album.title,
        image: getValidImage(album.avatar_url, 'default_album_avatar.png'),
        artist: album.artists ? album.artists[0].name : 'Unknown Artist',
        type: album.type,
      }));
      pageData.tracks = (data.tracks || []).map((track) => ({
        id: track.id,
        name: track.title,
        image: getValidImage(track.album.avatar_url, 'default_album_avatar.png'),
        artists: track.artists,
      }));
    } catch (error) {
      console.error('Failed to load main page data:', error);

      if (error.response && error.response.status === 404) {
        router.navigate('/not-found');
        return;
      }

      if (error.message && error.message.includes('Network')) {
        alert('Проблема с подключением. Попробуйте позже.');
        return;
      }

      alert('Не удалось загрузить главную страницу.');
      return;
    }

    const contentTemplate = Handlebars.templates['MainPage.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);

    header.render();
    sidebar.render();

    slider.sliderFunction();
    this.nowPlayingCardSlider();
    initScrollbar();
    this.setPlayButtonsOnAuth();
    playTrack();
  }

  setPlayButtonsOnAuth() {
    const playbtn = document.querySelectorAll('.play-button');
    playbtn.forEach((button) => {
      button.addEventListener('click', (event) => {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        if (!isAuthenticated) {
          event.preventDefault();
          event.stopPropagation();
          router.navigate('/login');
        } else {
          playTrack();
        }
      });
    });
  }

  nowPlayingCardSlider() {
    const prevBtn = document.querySelector('.current-card-btn.prev');
    const nextBtn = document.querySelector('.current-card-btn.next');
    const cardElements = document.querySelectorAll('.now-playing-container-card');

    let cardsData = [
      { img: '/static/img/default_album_avatar.png', name: '', id: null },
      { img: '/static/img/default_album_avatar.png', name: '', id: null },
      { img: '/static/img/default_album_avatar.png', name: '', id: null },
    ];

    player.addEventListener('trackchange', (event) => {
      playerSliderDataSync(event.detail);
    });

    let isAnimating = false;
    const animationDuration = 500; // Должно совпадать с 'transition' в вашем CSS

    function playerSliderDataSync({ prev, current, next }) {
      const prevCard = document.querySelector('.card-position-prev');
      const nextCard = document.querySelector('.card-position-next');
      if (next) {
        nextBtn.classList.remove('hidden');
        nextCard.classList.remove('hidden');
      } else {
        nextBtn.classList.add('hidden');
        nextCard.classList.add('hidden');
      }

      if (prev) {
        prevBtn.classList.remove('hidden');
        prevCard.classList.remove('hidden');
      } else {
        prevBtn.classList.add('hidden');
        prevCard.classList.add('hidden');
      }

      cardsData = [playerData(prev), playerData(current), playerData(next)];
      updateAllCardsUI();
    }

    function playerData(track) {
      if (!track) {
        return { img: '/static/img/default_album_avatar.png', name: '' };
      }
      return {
        title: track.title,
        id: track.id,
        img: `static/img/${track.imageUrl}`,
        name: track.artist,
      };
    }

    function updateAllCardsUI() {
      const prevCard = document.querySelector('.card-position-prev');
      const currentCard = document.querySelector('.card-position-current');
      const nextCard = document.querySelector('.card-position-next');

      if (prevCard) {
        prevCard.querySelector('img').src = cardsData[0].img;
        updateCardUI(prevCard, null);
      }
      if (currentCard) {
        currentCard.querySelector('img').src = cardsData[1].img;
        updateCardUI(currentCard, cardsData[1]);
      }
      if (nextCard) {
        nextCard.querySelector('img').src = cardsData[2].img;
        updateCardUI(nextCard, null);
      }
    }

    // Функция для управляет UI элементами на карточке.
    function updateCardUI(card, data = null) {
      const existingButton = card.querySelector('.current-card-btn.play');
      const existingName = card.querySelector('.current-card-name');
      if (existingButton) existingButton.remove();
      if (existingName) existingName.remove();

      if (data && data.name) {
        const playButton = document.createElement('button');
        playButton.className = 'current-card-btn play';
        playButton.dataset.trackId = data.id;
        const nameP = document.createElement('p');
        nameP.className = 'current-card-name';
        nameP.textContent = data.name;
        card.appendChild(playButton);
        card.appendChild(nameP);
      }
    }

    // Функция для первоначальной расстановки
    function initializeSlider() {
      cardElements.forEach((card, i) => {
        card.classList.remove('card-position-prev', 'card-position-current', 'card-position-next');
        if (i === 0) card.classList.add('card-position-prev');
        if (i === 1) card.classList.add('card-position-current');
        if (i === 2) card.classList.add('card-position-next');
      });
      updateAllCardsUI();
    }

    // Функция сдвига карточек
    function shiftCards(direction) {
      if (isAnimating) return;
      isAnimating = true;

      const currentCard = document.querySelector('.card-position-current');
      const prevCard = document.querySelector('.card-position-prev');
      const nextCard = document.querySelector('.card-position-next');

      currentCard.classList.remove('card-position-current');
      prevCard.classList.remove('card-position-prev');
      nextCard.classList.remove('card-position-next');

      if (direction === 'next') {
        prevCard.classList.add('hidden');
        currentCard.classList.add('hidden');
        prevCard.classList.remove('hidden');
        prevCard.classList.add('card-position-next');
        currentCard.classList.remove('hidden');
        currentCard.classList.add('card-position-prev');
        nextCard.classList.add('card-position-current');
      } else {
        nextCard.classList.add('hidden');
        currentCard.classList.add('hidden');
        nextCard.classList.remove('hidden');
        nextCard.classList.add('card-position-prev');
        currentCard.classList.remove('hidden');
        currentCard.classList.add('card-position-next');
        prevCard.classList.add('card-position-current');
      }

      setTimeout(() => {
        isAnimating = false;
        updateAllCardsUI();
      }, animationDuration);
    }

    nextBtn.addEventListener('click', () => {
      if (isAnimating) return;
      shiftCards('next');
      player.nextTrack();
    });
    prevBtn.addEventListener('click', () => {
      if (isAnimating) return;
      shiftCards('prev');
      player.prevTrack();
    });

    if (player.currentTrack) {
      player.getPrevAndNextTracks();
    }
    initializeSlider();
  }
}
