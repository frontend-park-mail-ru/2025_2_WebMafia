import { apiServise, API_TRACKS_URL } from '@/data';
import { getValidImage } from '@/utils/parsers.ts';
import { likeChange } from '@/utils/likeTrack';
import { setupMarquees } from '@/utils/marquee';

export class Player extends EventTarget {
  constructor() {
    super();
    this.audio = new Audio();
    this.currentTrack = null;
    this.canSaveTime = true;
    this.nextTrackId = null;
    this.prevTrackId = null;

    this.listenIncrementTimeout = null;

    this.isShaffle = false;
    this.repeatMode = 0;
    this.originalQueue = [];
    this.playQueue = [];
    this.currentContext = null;

    this.channel = new BroadcastChannel('music_channel_api');

    this.channel.onmessage = (event) => {
      const { type } = event.data;

      if (type === 'PLAYING') {
        this.audio.pause();
        this.togglePlayPauseSwitch(false);
        localStorage.setItem('isPLaying', 'false');
      }
    };
  }

  async init() {
    await this.updateVisibility();
  }

  async updateVisibility() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const path = window.location.pathname;
    const isAuthPage = path === '/login' || path === '/register';

    if (isAuthenticated && !isAuthPage) {
      if (!document.getElementById('player')) {
        await this.render();
      }
    } else {
      await this.destroy();
    }
  }

  async destroy() {
    const playerElement = document.querySelector('.player');
    if (playerElement) {
      this.audio.removeEventListener('timeupdate', this.handleTimeUpdate);
      this.audio.removeEventListener('ended', this.handleTrackEnd);
      playerElement.querySelector('.control-btn.play')?.removeEventListener('click', this.handlePlayClick);
      playerElement.querySelector('.control-btn.pause')?.removeEventListener('click', this.handlePauseClick);
      playerElement.querySelector('.control-btn.next')?.removeEventListener('click', this.handleNextClick);
      playerElement.querySelector('.control-btn.prev')?.removeEventListener('click', this.handlePrevClick);
      playerElement.querySelector('.like-btn')?.removeEventListener('click', this.handleLikeClick);
      playerElement.querySelector('.remote-slider')?.removeEventListener('input', this.handleSliderInput);
      const likeBtn = playerElement.querySelector('.like-btn');
      if (likeBtn && this.onLikeClickBound) {
        likeBtn.removeEventListener('click', this.onLikeClickBound);
      }
      if (this.channel) {
        this.channel.close();
        this.channel = null;
      }
      playerElement.remove();
    }
    if (this.listenIncrementTimeout) {
      clearTimeout(this.listenIncrementTimeout);
    }
    this.audio.pause();
    this.audio.src = '';
    this.currentTrack = null;
    this.canSaveTime = true;
    this.nextTrackId = null;
    this.prevTrackId = null;
    this.currentContext = null;
  }

  async getDataTrackById(track_id) {
    if (!track_id) return null;
    const trackData = await apiServise.loadTrackById(track_id);
    return trackData;
  }

  async loadTrack(trackData, context) {
    if (!trackData) return;
    if (this.listenIncrementTimeout) {
      clearTimeout(this.listenIncrementTimeout);
    }
    this.currentTrack = trackData;
    this.loadTrackInfo(this.currentTrack);
    localStorage.setItem('currentTrackId', this.currentTrack.id);
    const LISTEN_DELAY = 15000;
    this.listenIncrementTimeout = setTimeout(() => {
      apiServise.incrementTrackListenCount(this.currentTrack.id);
    }, LISTEN_DELAY);
    await this.getPrevAndNextTracks(context);
  }

  async getPrevAndNextTracks(context) {
    if (!this.currentTrack || !this.currentTrack.id) {
      console.warn('Невозможно определить соседей: текущий трек не установлен.');
      return;
    }
    const isNewContext = context && JSON.stringify(context) !== JSON.stringify(this.currentContext);

    try {
      if (isNewContext) {
        this.currentContext = context;
        localStorage.setItem('playerContext', JSON.stringify(context));
        let tracks = [];
        let result = {};
        try {
          switch (context.type) {
            case 'artist-popular':
              tracks = await apiServise.request(`/artists/${context.id}/tracks?limit=5`);
              break;
            case 'album-tracks':
              tracks = await apiServise.request(`/albums/${context.id}/tracks`);
              break;
            case 'artist_tracks':
              tracks = await apiServise.request(`/artists/${context.id}/tracks`);
              break;
            case 'playlist-tracks':
              result = await apiServise.getPlaylistPageData(context.id, true);
              tracks = result.tracks;
              break;
            case 'all-tracks':
            default:
              tracks = await apiServise.request('/tracks?limit=30');
              break;
          }
          this.originalQueue = tracks;
          if (this.isShaffle) {
            this.playQueue = [...this.originalQueue];
            this.shuffleQueue();
          } else {
            this.playQueue = tracks;
          }
          // this.playQueue = tracks;
        } catch (error) {
          this.playQueue = [];
          this.originalQueue = [];
        }
      }

      const currentIndex = this.playQueue.findIndex((t) => t.id === this.currentTrack.id);
      if (currentIndex === -1) {
        this.nextTrackId = null;
        this.prevTrackId = null;
      } else {
        const nextTrackObject = this.playQueue[currentIndex + 1];
        const prevTrackObject = this.playQueue[currentIndex - 1];

        this.nextTrackId = nextTrackObject ? nextTrackObject.id : null;
        this.prevTrackId = prevTrackObject ? prevTrackObject.id : null;
      }

      const [nextTrackData, prevTrackData] = await Promise.all([
        this.getDataTrackById(this.nextTrackId),
        this.getDataTrackById(this.prevTrackId),
      ]);
      const event = new CustomEvent('trackchange', {
        detail: {
          prev: prevTrackData ? prevTrackData : null,
          current: this.currentTrack,
          next: nextTrackData ? nextTrackData : null,
        },
      });
      this.dispatchEvent(event);
    } catch (error) {
      console.error('Ошибка при получении предыдущего/следующего треков:', error);
    }
  }

  async render() {
    const contentTemplate = Handlebars.templates['player.hbs'];
    const playerHTML = contentTemplate();
    const playerContainer = document.getElementById('player-container');
    if (playerContainer && !document.getElementById('player')) {
      playerContainer.insertAdjacentHTML('afterbegin', playerHTML);
    }

    this.setupExpandOnClick();
    this.volumeRender();
    this.playPauseSwitch();
    this.sliderColorChange();
    this.soundChange();
    this.trackSwitching();
    this.initShaffleBtn();
    this.initRepeatBtn();

    const storedTrackId = localStorage.getItem('currentTrackId');
    let storedTrackData = await this.getDataTrackById(storedTrackId);
    const storedContextString = localStorage.getItem('playerContext');
    const storedContext = storedContextString ? JSON.parse(storedContextString) : null;

    await Promise.all([this.loadTrack(storedTrackData, storedContext), this.getPrevAndNextTracks()]);

    const likeBtn = document.querySelector('.player .like-btn');
    if (likeBtn) {
      this.onLikeClickBound = this.handleLikeClick.bind(this);
      likeBtn.addEventListener('click', this.onLikeClickBound);
    }
    this.audio.addEventListener('timeupdate', () => {
      this.updateCurrentTimeAndSlider();
    });
    this.setInitialVolume();
    this.setInitialPLayTime();

    this.audio.addEventListener('ended', () => {
      this.handletrackEnd();
    });
  }

  handletrackEnd() {
    if (this.repeatMode == 2) {
      this.audio.currentTime = 0;
      this.audio.play();
    } else {
      this.nextTrack();
    }
  }

  async loadAndPlayTrackById(trackId, context) {
    const trackData = await this.getDataTrackById(trackId);

    if (!trackData) {
      console.error(`Трек с ID ${trackId} не найден.`);
      return;
    }

    await Promise.all([this.loadTrack(trackData, context), this.audio.play()]);

    this.channel.postMessage({ type: 'PLAYING' });

    this.togglePlayPauseSwitch(true);
    localStorage.setItem('isPlaying', 'true');
  }

  loadTrackInfo(track) {
    const titlePlacements = document.querySelectorAll('.track-title');
    titlePlacements.forEach((titlePlacement) => {
      titlePlacement.textContent = track.title;
      titlePlacement.parentNode.parentNode.href = `/album/${track.album?.id}`;
    });
    const artist = track.artists?.[0];
    const artistPlacement = document.querySelector('.track-artist');
    if (artistPlacement) {
      artistPlacement.textContent = artist?.name;
      artistPlacement.href = `/artist/${artist?.id}`;
    }
    setupMarquees();

    const durationInSeconds = track.duration_s;
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    const durationFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    const trackTimeTotal = document.querySelector('.track-time.total');
    if (trackTimeTotal) {
      trackTimeTotal.textContent = durationFormatted;
    }

    const trackImage = document.querySelector('.track-cover-player');
    if (trackImage) {
      trackImage.src = getValidImage('albums/' + track?.album?.avatar_url, 'default-album.png');
    }

    const likeBtn = document.querySelector('.player .like-btn');
    if (likeBtn) {
      likeBtn.dataset.trackId = track.id;
      if (track.is_liked) {
        likeBtn.classList.add('active');
      } else {
        likeBtn.classList.remove('active');
      }
    }

    let file_url = track.file_url;
    this.audio.src = file_url ? `${API_TRACKS_URL}/${file_url}` : `static/music/${file_url}`;

    this.audio.load();
  }

  async handleLikeClick(event) {
    const p_btn = event.target.closest('.like-btn');
    if (!p_btn || !this.currentTrack) return;

    event.stopPropagation();

    const trackId = this.currentTrack.id;

    try {
      if (this.currentTrack.is_liked) {
        await apiServise.unLikeTrack(trackId);
        this.currentTrack.is_liked = false;
        // p_btn.classList.remove('active');
        likeChange(trackId, false);
      } else {
        await apiServise.likeTrack(trackId);
        this.currentTrack.is_liked = true;
        // p_btn.classList.add('active');
        likeChange(trackId, true);
      }

      const eventChange = new CustomEvent('player-like-changed', {
        detail: {
          id: trackId,
          isLiked: this.currentTrack.is_liked,
        },
      });
      window.dispatchEvent(eventChange);
    } catch (error) {
      console.error('Ошибка при изменении лайка:', error);
    }
  }

  initRepeatBtn() {
    const repeatBtn = document.querySelector('.control-btn.repeat');
    if (!repeatBtn) return;
    const storedRepeatMode = localStorage.getItem('repeatMode');
    this.repeatMode = storedRepeatMode ? parseInt(storedRepeatMode) : 0;

    this.updateRepeatBtnUi();

    repeatBtn.addEventListener('click', this.handleRepeatClick.bind(this));
  }

  handleRepeatClick() {
    this.repeatMode = (this.repeatMode + 1) % 3;
    localStorage.setItem('repeatMode', this.repeatMode);
    this.updateRepeatBtnUi();
    this.updatePrevAndNextTrackId();
  }

  updateRepeatBtnUi() {
    const repeatBtn = document.querySelector('.control-btn.repeat');
    if (!repeatBtn) return;

    const svg = repeatBtn.querySelector('svg');
    if (!svg) return;

    const prevText = svg.querySelector('text');
    if (prevText) prevText.remove();

    if (this.repeatMode === 1) {
      repeatBtn.classList.add('active');
    } else if (this.repeatMode === 2) {
      svg.insertAdjacentHTML(
        'beforeend',
        `
        <text x="20" y="25" text-anchor="middle" font-size="14" font-weight="400" stroke-width="1">1</text>
      `
      );
    } else {
      if (repeatBtn.classList.contains('active')) repeatBtn.classList.remove('active');
    }
  }

  initShaffleBtn() {
    const ShuffleBtnPlayer = document.querySelector('.control-btn.shuffle');
    if (!ShuffleBtnPlayer) return;
    const isShaffle = localStorage.getItem('isShuffle') === 'true';

    this.isShaffle = isShaffle;

    if (this.isShaffle) {
      ShuffleBtnPlayer.classList.add('active');
      if (this.playQueue.length > 0) {
        this.shuffleQueue();
      }
    }
    ShuffleBtnPlayer.removeEventListener('click', this.boundShuffleHandler);
    this.boundShuffleHandler = this.handleShaffleClick.bind(this);
    ShuffleBtnPlayer.addEventListener('click', this.boundShuffleHandler);
  }

  handleShaffleClick() {
    this.isShaffle = !this.isShaffle;
    const ShuffleBtnPlayer = document.querySelector('.control-btn.shuffle');
    const ShuffleBtnAlbum = document.querySelector('.control-btn.shuffle-album');
    if (this.isShaffle) {
      ShuffleBtnPlayer.classList.add('active');
      if (ShuffleBtnAlbum) ShuffleBtnAlbum.classList.add('active');
      this.shuffleQueue();
    } else {
      ShuffleBtnPlayer.classList.remove('active');
      if (ShuffleBtnAlbum) ShuffleBtnAlbum.classList.remove('active');
      this.restoreQueue();
    }

    localStorage.setItem('isShuffle', this.isShaffle);
    this.updatePrevAndNextTrackId();
  }

  shuffleQueue() {
    if (!this.originalQueue.length) return;

    if (this.originalQueue.length === 0 && this.playQueue.length > 0) {
      this.originalQueue = [...this.playQueue];
    }

    let shaffleQueueArr = [...this.originalQueue];

    for (let i = shaffleQueueArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shaffleQueueArr[i], shaffleQueueArr[j]] = [shaffleQueueArr[j], shaffleQueueArr[i]];
    }

    this.playQueue = shaffleQueueArr;
  }

  restoreQueue() {
    if (this.originalQueue.length > 0) {
      this.playQueue = [...this.originalQueue];
    }
  }

  async updatePrevAndNextTrackId() {
    if (!this.currentTrack) return;

    const currentIndex = this.playQueue.findIndex((t) => t.id === this.currentTrack.id);

    if (currentIndex === -1) {
      this.nextTrackId = null;
      this.prevTrackId = null;
    } else {
      let nextTrackObject = this.playQueue[currentIndex + 1];
      let prevTrackObject = this.playQueue[currentIndex - 1];

      if (!nextTrackObject && this.repeatMode === 1) {
        nextTrackObject = this.playQueue[0];
      }

      if (!prevTrackObject && this.repeatMode === 1) {
        prevTrackObject = this.playQueue[this.playQueue.length - 1];
      }

      // if (!nextTrackObject && (this.repeatMode === 1 || this.repeatMode === 2)) {
      //   nextTrackObject = this.playQueue[0];
      //   prevTrackObject = this.playQueue[this.playQueue.length - 1];
      // }

      this.nextTrackId = nextTrackObject ? nextTrackObject.id : null;
      this.prevTrackId = prevTrackObject ? prevTrackObject.id : null;
    }

    const [nextTrackData, prevTrackData] = await Promise.all([
      await apiServise.loadTrackById(this.nextTrackId),
      await apiServise.loadTrackById(this.prevTrackId),
    ]);
    const event = new CustomEvent('trackchange', {
      detail: {
        prev: prevTrackData ? prevTrackData : null,
        current: this.currentTrack,
        next: nextTrackData ? nextTrackData : null,
      },
    });
    this.dispatchEvent(event);
  }

  updateCurrentTimeAndSlider() {
    const currentTime = this.audio.currentTime;
    if (this.currentTrack) {
      const duration_ms = this.currentTrack.duration_s;

      const minutes = Math.floor(currentTime / 60);
      const seconds = Math.floor(currentTime % 60);

      document.querySelector('.track-time.current').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      const percent = (currentTime / duration_ms) * 100;
      const timeRegulator = document.querySelector('.remote-slider');
      if (timeRegulator) {
        timeRegulator.value = percent;
        timeRegulator.style.setProperty('--progress', percent + '%');
      }
    }

    if (this.canSaveTime) {
      this.canSaveTime = false;
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      if (isAuthenticated) {
        localStorage.setItem('playTime', currentTime.toFixed(1));
      }

      setTimeout(() => {
        this.canSaveTime = true;
      }, 1000);
    }
  }

  volumeRender() {
    const volumeSlider = document.querySelector('.volume-slider');
    const volumeIcon = document.querySelector('.volume-icon');
    if (!volumeSlider || !volumeIcon) {
      console.error('Volume elements not found!');
      return;
    }

    function updateVolumeSlider(volume) {
      volumeIcon.classList.remove('level-0', 'level-1', 'level-2', 'level-3');

      if (volume == 0) {
        volumeIcon.classList.add('level-0');
      } else if (volume <= 35) {
        volumeIcon.classList.add('level-1');
      } else if (volume <= 75) {
        volumeIcon.classList.add('level-2');
      } else {
        volumeIcon.classList.add('level-3');
      }
    }

    volumeSlider.addEventListener(
      'wheel',
      function (e) {
        e.preventDefault();
        e.stopPropagation();

        const step = 5;
        const delta = Math.sign(e.deltaY) * -step; // Инвертируем направление
        const currentVolume = parseInt(volumeSlider.value);
        const newVolume = Math.max(0, Math.min(100, currentVolume + delta));

        volumeSlider.value = newVolume;
        updateVolumeSlider(newVolume);

        volumeSlider.dispatchEvent(new Event('input'));
        volumeSlider.dispatchEvent(new Event('change'));
      },
      { passive: true }
    );

    updateVolumeSlider(volumeSlider.value);
    volumeSlider.addEventListener('input', function () {
      updateVolumeSlider(this.value);
    });

    volumeIcon.addEventListener('click', () => {
      const preval = volumeSlider.value;
      if (volumeSlider.value === 0) {
        const volumeToRestore = preval > 0 ? preval : 20;
        volumeSlider.value = volumeToRestore;
        updateVolumeSlider(volumeToRestore);
      } else {
        volumeIcon.classList.add('level-0');
        volumeSlider.value = 0;
        updateVolumeSlider(0);
      }
      volumeSlider.dispatchEvent(new Event('input'));
      volumeSlider.dispatchEvent(new Event('change'));
    });
  }

  togglePlayPauseSwitch(isPlaying) {
    const playBtn = document.querySelector('.control-btn.play');
    const pauseBtn = document.querySelector('.control-btn.pause');
    if (isPlaying) {
      // this.audio.play();
      playBtn.classList.add('disactive');
      pauseBtn.classList.add('active');
      playBtn.classList.remove('active');
      pauseBtn.classList.remove('disactive');
    } else {
      // this.audio.pause();
      playBtn.classList.add('active');
      pauseBtn.classList.add('disactive');
      playBtn.classList.remove('disactive');
      pauseBtn.classList.remove('active');
    }
  }

  playPauseSwitch() {
    const playBtn = document.querySelector('.control-btn.play');
    const pauseBtn = document.querySelector('.control-btn.pause');
    playBtn.classList.add('active');
    pauseBtn.classList.add('disactive');
    playBtn.addEventListener('click', async () => {
      await this.audio.play();

      this.channel.postMessage({ type: 'PLAYING' });

      localStorage.setItem('isPlaying', 'true');
      localStorage.setItem('currentTrackId', this.currentTrack.id);
      this.togglePlayPauseSwitch(true);
    });
    pauseBtn.addEventListener('click', () => {
      this.audio.pause();
      localStorage.setItem('isPlaying', 'false');
      this.togglePlayPauseSwitch(false);
    });
  }

  async togglePlayPause() {
    if (this.audio.paused) {
      await this.audio.play();

      this.channel.postMessage({ type: 'PLAYING' });

      localStorage.setItem('isPlaying', 'true');
      this.togglePlayPauseSwitch(true);
    } else {
      this.audio.pause();
      localStorage.setItem('isPlaying', 'false');
      this.togglePlayPauseSwitch(false);
    }
  }

  sliderColorChange() {
    const timeRegulator = document.querySelector('.remote-slider');
    timeRegulator.addEventListener(
      'input',
      function () {
        const sliderElement = timeRegulator;
        const value = sliderElement.value;
        sliderElement.style.setProperty('--progress', value + '%');
        const duration_ms = this.currentTrack.duration_s;
        const newTime = (value / 100) * duration_ms;
        this.audio.currentTime = newTime;
      }.bind(this)
    );
  }

  soundChange() {
    const volumeRegulator = document.querySelector('.volume-slider');

    volumeRegulator.addEventListener('input', (event) => {
      const sliderElement = event.target;
      const value = sliderElement.value;
      sliderElement.style.setProperty('--progress', value + '%');
      this.audio.volume = value / 100;
    });

    volumeRegulator.addEventListener('change', function () {
      const value = this.value;
      localStorage.setItem('volume', value);
    });
  }

  setInitialVolume() {
    const volumeRegulator = document.querySelector('.volume-slider');
    const storedVolume = localStorage.getItem('volume') || 50;
    volumeRegulator.value = storedVolume;
    volumeRegulator.style.setProperty('--progress', storedVolume + '%');
    this.audio.volume = storedVolume / 100;
    this.volumeRender();
  }

  setInitialPLayTime() {
    const duration_ms = this.currentTrack.duration_s;
    const timeRegulator = document.querySelector('.remote-slider');
    const storedTime = parseFloat(localStorage.getItem('playTime'));
    timeRegulator.value = storedTime;
    this.audio.currentTime = storedTime;
    const percent = (storedTime / duration_ms) * 100;
    timeRegulator.style.setProperty('--progress', percent + '%');
    this.updateCurrentTimeAndSlider();
  }

  trackSwitching() {
    const nextBtn = document.querySelector('.control-btn.next');
    const prevBtn = document.querySelector('.control-btn.prev');

    nextBtn.addEventListener('click', async () => {
      await this.nextTrack();
    });

    prevBtn.addEventListener('click', async () => {
      await this.prevTrack();
    });
  }

  async nextTrack() {
    await this.updatePrevAndNextTrackId();
    await this.loadAndPlayTrackById(this.nextTrackId);
  }

  async prevTrack() {
    await this.updatePrevAndNextTrackId();
    await this.loadAndPlayTrackById(this.prevTrackId);
  }

  setupExpandOnClick() {
    const player = document.getElementById('player');
    const closeBtn = document.querySelector('.player-close');
    const slider = document.querySelector('.remote-slider');

    if (!player) return;

    const minHeight = 60;
    let maxHeight = calcMaxHeight();
    let isDraggingSlider = false;
    const closeThreshold = 100;
    let startY = 0;
    let startHeight = 0;

    function calcMaxHeight() {
      return window.innerHeight - 80 - 64 + 4;
    }

    player.addEventListener('click', (e) => {
      if (window.innerWidth > 800 || player.classList.contains('expanded')) return;

      if (e.target.closest('.control-btn') || e.target.closest('.like-btn')) return;

      player.classList.add('expanded');
      player.style.height = maxHeight + 'px';

      setupMarquees();
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        if (player.classList.contains('expanded')) {
          e.stopPropagation();
          player.classList.remove('expanded');
          player.style.height = minHeight + 'px';
          setupMarquees();
        }
      });
    }

    slider.addEventListener(
      'touchstart',
      () => {
        isDraggingSlider = true;
      },
      { passive: true }
    );

    slider.addEventListener('touchend', () => {
      isDraggingSlider = false;
    });

    player.addEventListener(
      'touchstart',
      (e) => {
        if (isDraggingSlider) return;
        startY = e.touches[0].clientY;
        startHeight = player.offsetHeight;
      },
      { passive: true }
    );

    player.addEventListener(
      'touchmove',
      (e) => {
        if (isDraggingSlider) return;
        const dy = e.touches[0].clientY - startY;
        let newHeight = startHeight - dy;
        newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
        player.style.height = newHeight + 'px';
      },
      { passive: true }
    );

    player.addEventListener('touchend', (e) => {
      if (isDraggingSlider) return;
      const dy = e.changedTouches[0].clientY - startY;

      if (dy > closeThreshold || player.offsetHeight < maxHeight / 2) {
        player.classList.remove('expanded');
        player.style.height = minHeight + 'px';
      } else {
        player.classList.add('expanded');
        player.style.height = maxHeight + 'px';
      }

      setupMarquees();
    });
  }
}

export const player = new Player();
