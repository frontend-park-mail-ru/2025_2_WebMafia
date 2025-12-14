import { apiServise } from '@/data.js';
import { header } from '@/components/header/header.js';
import { sidebar } from '@/components/sidebar/sidebar.js';
import { initScrollbar } from '@/scrollbar.js';
import { slider } from '@/slider.js';
import { player } from '@/components/player/player.js';
import { playTrack } from '@/playTrackBtn.js';
import { getValidImage, playsParser, dateParser } from '@/parsers.js';
import { setPlayButtonsOnAuth } from '@/setPlayButtonsOnAuth.js';
import { playerOnlyOnPlay } from '@/playerOnlyOnplay.js';
import { createPlaylis } from '@/utils/initCreatePlaylist';
import { nowPlayingCardSlider } from '@/utils/nowPlayingCardsLogic.js';
import {
  setInitialPLayTime,
  sliderColorChange,
  updateCurrentTimeAndSlider,
  loadTrackInfo,
} from '@/utils/playerFunctions.js';

export class trackComments {
  async render(id) {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    let pageData = {
      isAuthenticated: isAuthenticated,
    };

    // if (this.socket) {
    //   this.socket.disconnect();
    //   this.socket = null;
    // }

    if (!pageData.isAuthenticated) {
      localStorage.clear();
    }

    const contentTemplate = Handlebars.templates['trackComments.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);
    document.querySelector('head title').textContent = 'Wave Music';
    await Promise.all([header.render(), sidebar.render()]);

    try {
      const data = await apiServise.loadTrackById(id);
      const artistId = data.artists[0].id;
      const artistData = await apiServise.getArtistPageData(artistId, pageData.isAuthenticated);
      const playerContext = player.currentContext;
      const commentsData = await apiServise.GetTrackComments(id);

      console.log('Data Comments', commentsData);

      pageData = {
        isAuthenticated: isAuthenticated,
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

      pageData.comment = (commentsData || []).map((comment) => ({
        id: comment.id,
        text: comment.text,
        track_id: comment.track_id,
        avatar: comment.user_avatar ? getValidImage(comment.user_avatar) : null,
        nickname: comment.user_login,
        letter: comment.user_login ? comment.user_login[0].toUpperCase() : 'U',
        created_at: dateParser(comment.created_at),
      }));
    } catch (error) {
      console.error('Failed to load comment page data:', error);
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

    // Инициализация сокета
    if (isAuthenticated) {
      try {
        await apiServise.getCSRFToken();
        this.initSocket(id);
      } catch (e) {
        console.error('Failed to fetch token for WS:', e);
      }
    } else {
      console.warn('User is not authenticated, socket not initialized');
    }
  }

  initSocket(trackId) {
    this.socket = apiServise.createTrackSocket(trackId, {
      onOpen: () => console.log('WebSocket connected for comments'),
      onMessage: (data) => this.handleNewComment(data),
      onError: (err) => console.error('WebSocket error:', err),
      onClose: () => console.log('WebSocket connection closed'),
    });
    this.socket.connect();
  }

  handleNewComment(data) {
    if (!data) return;

    const commentData = Array.isArray(data) ? data[0] : data;

    let dateStr = 'Just now';
    if (commentData.created_at) {
      try {
        dateStr = new Date(commentData.created_at).toLocaleDateString();
      } catch (e) {
        console.log(e);
      }
    }

    const commentObj = {
      nickname: commentData.user_login || 'User',
      text: commentData.text,
      time: dateStr,
      avatar: commentData.user_avatar ? getValidImage(commentData.user_avatar) : null,
      letter: (commentData.user_login || 'U')[0].toUpperCase(),
    };

    const commentsContainer = document.querySelector('.comments-container');
    if (!commentsContainer) return;

    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment-container';

    const avatarHtml = commentObj.avatar
      ? `<img src="${commentObj.avatar}" alt="Ваш аватар" class="profile-image" />`
      : `<div class="default-avatar default-avatar-header">${commentObj.letter}</div>`;

    commentDiv.innerHTML = `
        <div class="profile-avatar-header user-avatar">
            ${avatarHtml}
        </div>
        <div class="comment-info-container">
            <div class="comment-info-header">
                <div class="comment-author">${commentObj.nickname}</div>
                <span class="dot"></span>
                <div class="comment-time">${commentObj.time}</div>
            </div>
            <div class="comment-text">
                ${commentObj.text}
            </div>
        </div>
    `;

    const form = document.getElementById('createCommentsForm');

    if (form && form.nextSibling) {
      const list = document.getElementById('commentsList');
      if (!list) return;
      list.prepend(commentDiv);
    } else {
      commentsContainer.appendChild(commentDiv);
    }
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

    const commentForm = document.getElementById('createCommentsForm');

    if (commentForm) {
      const newCommentForm = commentForm.cloneNode(true);
      commentForm.parentNode.replaceChild(newCommentForm, commentForm);
      const newTitleInput = newCommentForm.querySelector('#title');
      const newErrorDiv = newCommentForm.querySelector('#titleError');

      newCommentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const text = newTitleInput.value.trim();

        if (this.socket) {
          const payload = { text: text };
          this.socket.send(payload);
          newTitleInput.value = '';
        } else {
          if (newErrorDiv) newErrorDiv.textContent = 'Ошибка соединения. Обновите страницу.';
          console.error('Socket is not initialized');
        }
      });
    } else {
      console.error('Form createCommentsForm not found in DOM');
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
