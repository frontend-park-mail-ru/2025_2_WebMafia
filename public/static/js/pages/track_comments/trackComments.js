import { apiServise } from '@/data.js';
import { router } from '@/routing.js';
import { header } from '@/components/header/header.js';
import { sidebar } from '@/components/sidebar/sidebar.js';
import { initScrollbar } from '@/scrollbar.js';
import { slider } from '@/slider.js';
import { player } from '@/components/player/player.js';
import { playTrack } from '@/playTrackBtn.js';
import { getValidImage, playsParser, durationParser } from '@/parsers.js';
import { setPlayButtonsOnAuth } from '@/setPlayButtonsOnAuth.js';
import { playerOnlyOnPlay } from '@/playerOnlyOnplay.js';
import { setupMarquees } from '@/marquee.js';
import { createPlaylis } from '@/utils/initCreatePlaylist';
import { nowPlayingcards } from '@/components/now_playing_cards/nowPlayingCards';
import { nowPlayingCardSlider } from '@/utils/nowPlayingCardsLogic.js';
import {
  setInitialPLayTime,
  sliderColorChange,
  updateCurrentTimeAndSlider,
  loadTrackInfo,
} from '@/utils/playerFunctions.js';
import { goToComments } from '@/utils/goToComment.js';

export class trackComments {
  async render(id) {
    let pageData = {
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
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
      const profileData = await apiServise.getProfileData();
      const artistId = data.artists[0].id;
      const artistData = await apiServise.getArtistPageData(artistId, pageData.isAuthenticated);
      const playerContext = player.currentContext;
      pageData = {
        id: data.album.id,
        title: data.title,
        type: data.album.type,
        is_liked: data.is_liked,
        year: data.album.release_date ? data.album.release_date.slice(0, 4) : '',
        cover: getValidImage('albums/' + data.album.avatar_url, 'default-album.png'),
        isSubscribed: artistData.artist.isSubscribed,
        artist: {
          id: data.album.artists[0].id,
          name: data.album.artists[0].name,
          avatar: getValidImage('artists/' + data.album.artists[0].avatar_url, 'default-album.png'),
        },
        description: data.album.description,
        track_id: data.id,
        listeners: playsParser(artistData.artist.play_count) || 0,
        player_context: playerContext,
      };
      // pageData.tracks = (data.tracks || []).map((track) => {
      //   totalDuration += track.duration_s;
      //   return {
      //     id: track.id,
      //     name: track.title,
      //     plays: playsParser(track.play_count),
      //     duration: durationParser(track.duration_s),
      //     is_liked: track.is_liked,
      //   };
      // });
      pageData.avatar = data.AvatarURL ? getValidImage(data.AvatarURL) : data.AvatarURL;
      pageData.nickname = profileData.Login;
      pageData.letter = pageData.nickname ? pageData.nickname[0].toUpperCase() : '';
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
    setPlayButtonsOnAuth();
    createPlaylis();
    nowPlayingCardSlider();
    sliderColorChange();
    loadTrackInfo(player.currentTrack);
    player.audio.addEventListener('timeupdate', () => {
      updateCurrentTimeAndSlider();
    });
    setInitialPLayTime();
    this.setupPageLogic(id);
    playTrack();
  }

  setupPageLogic(pageTrackId) {
    this.updatePageStatus(pageTrackId);

    this.onTrackChangeHandler = (e) => {
      const currentPlayingId = e.detail.current ? e.detail.current.id : null;
      this.updatePageStatus(pageTrackId, currentPlayingId);
    };

    player.addEventListener('trackchange', this.onTrackChangeHandler);

    const container = document.querySelector('.track-info-comments');
    if (container) {
      container.addEventListener('click', (e) => {
        if (e.target.closest('.prev')) {
          player.prevTrack();
        }
        if (e.target.closest('.next')) {
          player.nextTrack();
        }
      });
    }
  }

  updatePageStatus(pageId, playingId = player.currentTrack?.id) {
    const isCurrent = String(pageId) === String(playingId);
    const container = document.querySelector('.track-info-comments');

    if (!container) return;

    if (isCurrent) {
      container.classList.add('active-track');
      container.classList.remove('inactive-track');
      updateCurrentTimeAndSlider();
    } else {
      container.classList.remove('active-track');
      container.classList.add('inactive-track');
      const slider = container.querySelector('.remote-slider-comments');
      if (slider) {
        slider.value = 0;
        slider.style.setProperty('--progress', '0%');
      }
    }
  }
}
