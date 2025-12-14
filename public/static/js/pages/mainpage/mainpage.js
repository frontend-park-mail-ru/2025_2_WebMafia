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
import { nowPlayingcards } from '@/components/now_playing_cards/nowPlayingCards.js';
import { nowPlayingCardSlider } from '@/utils/nowPlayingCardsLogic.js';

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
    await Promise.all([header.render(), sidebar.render(), nowPlayingcards.render()]);

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
    nowPlayingCardSlider();
    slider.sliderFunction();
    initScrollbar();
    this.addEventListeners();
    setPlayButtonsOnAuth();
    createPlaylis();
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
}
