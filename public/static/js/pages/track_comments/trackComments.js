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
import { nowPlayingcards } from '@/components/now_playing_cards/nowPlayingCards';
import { nowPlayingCardSlider } from '@/utils/nowPlayingCardsLogic.js';

export class trackComments {
  async render(id) {
    let pageData = {
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
      track: [],
    };
    if (!pageData.isAuthenticated) {
      localStorage.clear();
    }

    const contentTemplate = Handlebars.templates['trackComments.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);
    document.querySelector('head title').textContent = 'Wave Music';
    await Promise.all([header.render(), sidebar.render()]);

    try {
      const data = await apiServise.loadTrackById(id);
    } catch (error) {
      console.error('Failed to load main page data:', error);
      alert('Не удалось загрузить страницу c комментами.');
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
    nowPlayingCardSlider();
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
