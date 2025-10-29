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
    };

    const contentTemplateWithoutData = Handlebars.templates['MainPage.hbs'];
    document.getElementById('app').innerHTML = contentTemplateWithoutData(pageData);

    try {
      const data = await apiServise.getMainPageData();
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
    const cardElements = document.querySelectorAll('.now-playing-container-card');

    let cardsData = [
      { img: '/static/img/image11.jpg', name: 'Tyler, the Creator' },
      { img: '/static/img/image12.jpg', name: 'Playboi Carti' },
      { img: '/static/img/image13.jpg', name: 'Jpegmafiaaaaaa aaaaaaaa aa' },
    ];

    let currentIndex = 0;
    let isAnimating = false;

    /**
     * ФУНКЦИЯ: Управляет UI элементами на карточке.
     * @param {HTMLElement} card - Карточка для обновления.
     * @param {object | null} data - Данные для отображения (имя) или null для очистки.
     */
    function updateCardUI(card, data = null) {
      // 1. Очистка: всегда удаляем старые элементы, если они есть.
      const existingButton = card.querySelector('.current-card-btn.play');
      const existingName = card.querySelector('.current-card-name');
      if (existingButton) existingButton.remove();
      if (existingName) existingName.remove();

      if (data) {
        // Создаем кнопку Play
        const playButton = document.createElement('button');
        playButton.className = 'current-card-btn play';

        // Создаем параграф для имени
        const nameP = document.createElement('p');
        nameP.className = 'current-card-name';
        nameP.textContent = data.name;

        // Добавляем созданные элементы в карточку
        card.appendChild(playButton);
        card.appendChild(nameP);
      }
    }

    // Функция для первоначальной расстановки
    function initializeSlider() {
      cardElements.forEach((card, i) => {
        let dataIndex;
        if (i === 0) dataIndex = (currentIndex - 1 + cardsData.length) % cardsData.length;
        if (i === 1) dataIndex = currentIndex;
        if (i === 2) dataIndex = (currentIndex + 1) % cardsData.length;

        card.querySelector('img').src = cardsData[dataIndex].img;

        if (i === 1) {
          updateCardUI(card, cardsData[currentIndex]);
        }

        // Назначаем классы
        card.classList.remove('card-position-prev', 'card-position-current', 'card-position-next');
        if (i === 0) card.classList.add('card-position-prev');
        if (i === 1) card.classList.add('card-position-current');
        if (i === 2) card.classList.add('card-position-next');
      });
    }

    // Функция сдвига карточек
    function shiftCards(direction) {
      if (isAnimating) return;
      isAnimating = true;

      const currentCard = document.querySelector('.card-position-current');
      const prevCard = document.querySelector('.card-position-prev');
      const nextCard = document.querySelector('.card-position-next');

      updateCardUI(currentCard, null);

      if (direction === 'next') {
        currentIndex = (currentIndex + 1) % cardsData.length;
        updateCardUI(nextCard, cardsData[currentIndex]);
      } else {
        currentIndex = (currentIndex - 1 + cardsData.length) % cardsData.length;
        updateCardUI(prevCard, cardsData[currentIndex]);
      }

      currentCard.classList.remove('card-position-current');
      prevCard.classList.remove('card-position-prev');
      nextCard.classList.remove('card-position-next');

      if (direction === 'next') {
        currentCard.classList.add('card-position-prev');
        nextCard.classList.add('card-position-current');
        prevCard.classList.add('card-position-next');

        const newNextDataIndex = (currentIndex + 1) % cardsData.length;
        prevCard.querySelector('img').src = cardsData[newNextDataIndex].img;
      } else {
        currentCard.classList.add('card-position-next');
        prevCard.classList.add('card-position-current');
        nextCard.classList.add('card-position-prev');

        const newPrevDataIndex = (currentIndex - 1 + cardsData.length) % cardsData.length;
        nextCard.querySelector('img').src = cardsData[newPrevDataIndex].img;
      }

      setTimeout(() => {
        isAnimating = false;
      }, 500);
    }

    nextBtn.addEventListener('click', () => shiftCards('next'));
    prevBtn.addEventListener('click', () => shiftCards('prev'));

    initializeSlider();
  }
}
