import { BasePage } from '@/pages/base/basePage.ts';
import { apiServise } from '@/data.ts';
import { router } from '@/routing.ts';
import { scrollbar } from '@/utils/scrollbar';
import { slider } from '@/utils/slider';
import { nowPlayingSlider } from '@/pages/mainpage/nowPlayingSlider';
import { player } from '@/components/player/player.js';
import { playTrack } from '@/playTrackBtn.js';
import { getValidImage, playsParser, dateParser } from '@/utils/parsers';
import { playerOnlyOnPlay } from '@/playerOnlyOnplay.js';
import { sliderColorChange, updateCurrentTimeAndSlider, loadTrackInfo } from '@/utils/playerFunctions.js';
import { initSubscribeButton } from '@/utils/subscribeArtist';
import { injectBubbleStyles } from '@/utils/commentAnimation.js';
import { likeTrackBtn } from '@/utils/likeTrack.js';
import { share } from '@/utils/shareBtn.js';
import { images } from '@/assets';
import { showInfoMessage } from '@/utils/showInfoMessage';
import { Comment, isHttpError } from '@/models';
import { setupMarquees } from '@/utils/marquee.ts';

interface TrackCommentsContext {
  isAuthenticated: boolean;
  id?: string;
  title?: string;
  type?: string;
  is_liked?: boolean;
  year?: string;
  cover?: string;
  isSubscribed?: boolean;
  artist?: {
    id: string;
    name: string;
    avatar: string;
  };
  description?: string;
  track_id?: string;
  listeners?: string;
  comments: Comment[];
  player_context?: string;
}

export class TrackCommentsPage extends BasePage {
  private trackId: string | null = null;
  private clickHandlers: Array<{ el: Element; fn: EventListener }> = [];
  private boundTrackChange: EventListener | null = null;
  private boundTimeUpdate: EventListener | null = null;
  private boundOnCommentReceived: EventListener | null = null;

  protected async renderContent(container: HTMLElement, trackId: string): Promise<void> {
    this.trackId = trackId;

    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) localStorage.clear();

    const template = Handlebars.templates['trackComments.hbs'];
    container.innerHTML = template({
      isAuthenticated,
      comments: [],
    });

    const titleEl = document.querySelector('head title');
    if (titleEl) titleEl.textContent = 'Wave Music';

    try {
      const data = await apiServise.getTrackCommentsPageData(trackId, isAuthenticated);
      const { track, comments, artist } = data;

      const pageData: TrackCommentsContext = {
        isAuthenticated,
        id: track.album?.id,
        title: track.title,
        type: track.album?.type,
        is_liked: track.is_liked || false,
        year: track.album?.release_date ? track.album.release_date.slice(0, 4) : '',
        cover: getValidImage(`albums/${track.album?.avatar_url}`, images.defaultAlbumPath),
        isSubscribed: artist?.isSubscribed || false,
        listeners: playsParser(artist?.play_count) || '0',
        artist: {
          id: artist?.id || '',
          name: artist?.name || 'Unknown',
          avatar: getValidImage(`artists/${artist?.avatar_url}`, images.defaultArtistPath),
        },
        description: track.album?.description,
        track_id: track.id,
        player_context: player.currentContext,
        comments: comments.map((c: Comment) => ({
          id: c.id,
          text: c.text,
          nickname: c.user_login,
          avatar: c.user_avatar ? getValidImage(c.user_avatar) : null,
          letter: c.user_login ? c.user_login[0].toUpperCase() : 'U',
          time: dateParser(c.created_at),
        })),
      };

      container.innerHTML = template(pageData);
      if (titleEl) titleEl.textContent = pageData.title || 'Wave Music';

      this.initComponents();
    } catch (error: unknown) {
      console.error('TrackCommentsPage load error:', error);
      if (isHttpError(error) && error.response?.status === 404) {
        router.navigate('/not-found');
        return;
      }
      showInfoMessage('Не удалось загрузить данные трека');
    }
  }

  private initComponents(): void {
    injectBubbleStyles();
    playerOnlyOnPlay();

    slider.init();
    scrollbar.init();
    nowPlayingSlider.init();

    sliderColorChange();
    if (player.currentTrack) {
      loadTrackInfo(player.currentTrack);
    }

    this.setupPageLogic();
    this.setupCommentForm();
    this.setupNavigationLinks();

    likeTrackBtn();
    share();
    playTrack();
    initSubscribeButton();
    setupMarquees();

    this.setupGlobalCommentListener();
  }

  private setupGlobalCommentListener() {
    this.boundOnCommentReceived = (e) => {
      const customEvent = e as CustomEvent<Comment>;
      const comment = customEvent.detail;
      if (String(comment.track_id) === String(this.trackId)) {
        this.renderNewCommentInList(comment);
      }
    };
    window.addEventListener('comment:received', this.boundOnCommentReceived);
  }

  private renderNewCommentInList(commentObj: Comment) {
    const list = document.getElementById('commentsList');
    const commentsContainer = document.querySelector('.comments-container');
    if (!commentsContainer) return;

    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment-container';

    const avatarHtml = commentObj.avatar
      ? `<img src="${commentObj.avatar}" alt="Avatar" class="profile-image" />`
      : `<div class="default-avatar default-avatar-header">${commentObj.letter || 'U'}</div>`;

    commentDiv.innerHTML = `
        <div class="profile-avatar-header user-avatar">${avatarHtml}</div>
        <div class="comment-info-container">
            <div class="comment-info-header">
                <div class="comment-author">${commentObj.nickname || 'User'}</div>
                <span class="dot"></span>
                <div class="comment-time">${commentObj.time || 'Только что'}</div>
            </div>
            <div class="comment-text">${commentObj.text}</div>
        </div>
    `;

    if (list) {
      list.prepend(commentDiv);
    } else {
      const form = document.getElementById('createCommentsForm');
      if (form && form.nextSibling) {
        form.parentNode?.insertBefore(commentDiv, form.nextSibling);
      } else {
        commentsContainer.appendChild(commentDiv);
      }
    }
  }

  private setupCommentForm() {
    const form = document.getElementById('createCommentsForm') as HTMLFormElement;
    if (!form) return;

    const newForm = form.cloneNode(true) as HTMLFormElement;
    form.parentNode?.replaceChild(newForm, form);

    const input = newForm.querySelector('#title-comment') as HTMLInputElement;
    const errorDiv = newForm.querySelector('#titleError');

    const submitHandler = (e: Event) => {
      e.preventDefault();
      const text = input.value.trim();

      if (!text) return;

      const success = player.sendComment(text);
      if (success) {
        input.value = '';
        if (errorDiv) errorDiv.textContent = '';
      } else {
        if (errorDiv) errorDiv.textContent = 'Ошибка отправки. Плеер не подключен к комментариям.';
      }
    };

    newForm.addEventListener('submit', submitHandler);
    this.clickHandlers.push({ el: newForm, fn: submitHandler });
  }

  private setupNavigationLinks(): void {
    const authors = document.querySelectorAll('.track-comment-artist, .track-performer');
    authors.forEach((author) => {
      const artistId = (author as HTMLElement).dataset.artistId;
      if (!artistId) return;

      const handler = (e: Event) => {
        e.preventDefault();
        router.navigate(`/artist/${artistId}`);
      };

      author.addEventListener('click', handler);
      this.clickHandlers.push({ el: author, fn: handler });
    });
  }

  private setupPageLogic() {
    if (!this.trackId) return;

    this.updatePageStatus(this.trackId);

    this.boundTrackChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const currentId = customEvent.detail?.current?.id;
      if (this.trackId) {
        this.updatePageStatus(this.trackId, currentId);
      }
    };
    player.addEventListener('trackchange', this.boundTrackChange);

    this.boundTimeUpdate = () => {
      if (document.querySelector('.track-info-comments.active-track')) {
        updateCurrentTimeAndSlider();
      }
    };
    player.audio.addEventListener('timeupdate', this.boundTimeUpdate);

    const container = document.querySelector('.track-info-comments');
    if (container) {
      const clickHandler = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.closest('.prev')) player.prevTrack();
        if (target.closest('.next')) player.nextTrack();
      };
      container.addEventListener('click', clickHandler);
      this.clickHandlers.push({ el: container, fn: clickHandler });
    }
  }

  private updatePageStatus(pageId: string, playingId = player.currentTrack?.id) {
    const container = document.querySelector('.track-info-comments');
    if (!container) return;

    const isCurrent = String(pageId) === String(playingId);

    if (isCurrent) {
      container.classList.add('active-track');
      container.classList.remove('inactive-track');
      updateCurrentTimeAndSlider();
    } else {
      container.classList.remove('active-track');
      container.classList.add('inactive-track');

      const slider = container.querySelector('.remote-slider-comments') as HTMLInputElement;
      if (slider) {
        slider.value = '0';
        slider.style.setProperty('--progress', '0%');
      }
    }
  }

  public destroy(): void {
    if (this.boundOnCommentReceived) {
      window.removeEventListener('comment:received', this.boundOnCommentReceived);
    }

    this.clickHandlers.forEach(({ el, fn }) => el.removeEventListener('click', fn));
    this.clickHandlers = [];

    if (this.boundTrackChange) {
      player.removeEventListener('trackchange', this.boundTrackChange);
      this.boundTrackChange = null;
    }
    if (this.boundTimeUpdate) {
      player.audio.removeEventListener('timeupdate', this.boundTimeUpdate);
      this.boundTimeUpdate = null;
    }

    nowPlayingSlider.destroy();
    scrollbar.destroy();
    this.trackId = null;
  }
}
