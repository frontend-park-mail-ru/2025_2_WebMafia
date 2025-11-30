import { apiServise } from '@/data.js';
import { router } from '@/routing.js';
import { header } from '@/components/header/header.js';
import { sidebar } from '@/components/sidebar/sidebar.js';
import { initScrollbar } from '@/scrollbar.js';
import { slider } from '@/slider.js';
import { player } from '@/components/player/player.js';
import { playTrack } from '@/playTrackBtn.js';
import { getValidImage, playsParser } from '@/parsers.js';
import { setPlayButtonsOnAuth } from '@/setPlayButtonsOnAuth.js';
import { playerOnlyOnPlay } from '@/playerOnlyOnplay.js';
import { setupMarquees } from '@/marquee.js';
import { createPlaylis } from '@/utils/initCreatePlaylist';

export class MainPage {
  async render() {
    let pageData = {
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
      artists: [],
      albums: [],
      tracks: [],
    };
    if (!pageData.isAuthenticated) {
      localStorage.clear();
    }

    const contentTemplate = Handlebars.templates['MainPage.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);
    document.querySelector('head title').textContent = 'Wave Music';

    try {
      const data = await apiServise.getMainPageData();
      pageData.artists = (data.artists || []).map((artist) => ({
        id: artist.id,
        name: artist.name,
        listeners: playsParser(artist.play_count || 0),
        image: getValidImage('artists/' + artist.avatar_url, 'default-artist.png'),
      }));
      pageData.albums = (data.albums || []).map((album) => ({
        id: album.id,
        name: album.title,
        image: getValidImage('albums/' + album.avatar_url, 'default-album.png'),
        artist: album.artists ? album.artists[0].name : 'Unknown Artist',
        artist_id: album.artists?.[0].id,
        type: album.type,
      }));
      pageData.tracks = (data.tracks || []).map((track) => ({
        id: track.id,
        name: track.title,
        image: getValidImage('albums/' + track.album.avatar_url, 'default-album.png'),
        artists: track.artists,
        album_id: track.album.id,
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
    document.getElementById('app').innerHTML = contentTemplate(pageData);
    playerOnlyOnPlay();
    await Promise.all([header.render(), sidebar.render()]);

    slider.sliderFunction();
    initScrollbar();
    this.addEventListeners();
    setPlayButtonsOnAuth();
    createPlaylis();
    this.nowPlayingCardSlider();
    playTrack();
  }

  addEventListeners() {
    document.querySelectorAll('.click-event-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('a')) {
          router.navigate(card.dataset.href);
        }
      });
    });
  }

  async nowPlayingCardSlider() {
    const cardElements = document.querySelectorAll('.now-playing-container-card');
    if (!cardElements) return;
    const prevBtn = document.querySelector('.current-card-btn.prev');
    const nextBtn = document.querySelector('.current-card-btn.next');

    let cardsData = [
      { img: '/static/img/default-album.png', name: '', id: null },
      { img: '/static/img/default-album.png', name: '', id: null },
      { img: '/static/img/default-album.png', name: '', id: null },
    ];

    player.addEventListener('trackchange', (event) => {
      playerSliderDataSync(event.detail);
    });

    let isAnimating = false;
    const animationDuration = 500;
    let pendingTrackData = null;

    function playerSliderDataSync(data) {
      if (isAnimating) {
        pendingTrackData = data;
        return;
      }

      applyDataToCards(data);
    }

    function applyDataToCards({ prev, current, next }) {
      const prevCard = document.querySelector('.card-position-prev');
      const nextCard = document.querySelector('.card-position-next');

      if (next) {
        if (nextBtn) nextBtn.classList.remove('hidden');
        if (nextCard) nextCard.classList.remove('hidden');
      } else {
        if (nextBtn) nextBtn.classList.add('hidden');
        if (nextCard) nextCard.classList.add('hidden');
      }

      if (prev) {
        if (prevBtn) prevBtn.classList.remove('hidden');
        if (prevCard) prevCard.classList.remove('hidden');
      } else {
        if (prevBtn) prevBtn.classList.add('hidden');
        if (prevCard) prevCard.classList.add('hidden');
      }

      cardsData = [playerData(prev), playerData(current), playerData(next)];
      updateAllCardsUI();
    }

    function playerData(track) {
      if (!track) {
        return {
          img: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
          name: '',
          id: null,
        };
      }

      const imageUrl = getValidImage('albums/' + track.album?.avatar_url, 'default-album.png');
      const artistName = track.title;

      return {
        title: track.title,
        id: track.id,
        img: imageUrl,
        name: artistName,
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
      playTrack();
    }

    function updateCardUI(card, data = null) {
      const existingButton = card.querySelector('.current-card-btn.play');
      const existingName = card.querySelector('.current-card-name');
      if (existingButton) existingButton.remove();
      if (existingName) existingName.remove();

      if (data && data.name && data.id) {
        const playButton = document.createElement('button');
        playButton.className = 'current-card-btn play';
        playButton.dataset.trackId = data.id;
        const nameP = document.createElement('p');
        nameP.innerHTML = `
            <div class="marquee-inner">
              <span class="marquee-text">${data.name}</span>
            </div>`;
        nameP.className = 'marquee current-card-name cards-marquee-limiter';
        card.appendChild(playButton);
        card.appendChild(nameP);
        setupMarquees();
      }
    }

    function initializeSlider() {
      cardElements.forEach((card, i) => {
        card.classList.remove('card-position-prev', 'card-position-current', 'card-position-next');
        if (i === 0) card.classList.add('card-position-prev');
        if (i === 1) card.classList.add('card-position-current');
        if (i === 2) card.classList.add('card-position-next');
      });
      updateAllCardsUI();
    }

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
        currentCard.classList.remove('card-position-current');
        currentCard.classList.add('card-position-prev');
        nextCard.classList.remove('card-position-next');
        nextCard.classList.add('card-position-current');
        prevCard.classList.remove('card-position-prev');
        prevCard.style.transition = 'none';
        prevCard.classList.add('card-position-next');
        void prevCard.offsetWidth;
        prevCard.style.transition = '';
      } else {
        currentCard.classList.remove('card-position-current');
        currentCard.classList.add('card-position-next');
        prevCard.classList.remove('card-position-prev');
        prevCard.classList.add('card-position-current');
        nextCard.classList.remove('card-position-next');
        nextCard.style.transition = 'none';
        nextCard.classList.add('card-position-prev');
        void nextCard.offsetWidth;
        nextCard.style.transition = '';
      }

      setTimeout(() => {
        isAnimating = false;
        if (typeof pendingTrackData !== 'undefined' && pendingTrackData) {
          applyDataToCards(pendingTrackData);
          pendingTrackData = null;
        } else {
          updateAllCardsUI();
        }
      }, animationDuration);
    }

    if (nextBtn || prevBtn) {
      nextBtn.addEventListener('click', async () => {
        if (isAnimating) return;
        shiftCards('next');
        await player.nextTrack();
      });
      prevBtn.addEventListener('click', async () => {
        if (isAnimating) return;
        shiftCards('prev');
        await player.prevTrack();
      });
    }
    let touchStartX = 0;
    let touchEndX = 0;

    function handleGesture() {
      if (touchEndX - touchStartX > 50) {
        if (!isAnimating) {
          shiftCards('prev');
          player.prevTrack();
        }
      }

      if (touchStartX - touchEndX > 50) {
        if (!isAnimating) {
          shiftCards('next');
          player.nextTrack();
        }
      }
    }

    const slider = document.querySelector('.card-slider');

    if (slider) {
      slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].clientX;
      });

      slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        handleGesture();
      });
    }

    if (player.currentTrack) {
      await player.getPrevAndNextTracks();
    }
    initializeSlider();
  }
}
