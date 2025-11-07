import { apiServise, API_TRACKS_URL } from '../../data.js';
import { getValidImage } from "../../parsers.js";

export class Player extends EventTarget {
  constructor() {
    super();
    this.audio = new Audio();
    this.currentTrack = null;
    this.canSaveTime = true;
    this.nextTrackId = null;
    this.prevTrackId = null;
  }

  async init() {
    // window.addEventListener('popstate', () => this.updateVisibility());
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      window.addEventListener('va-navigate', () => this.updateVisibility());
    }
    await this.updateVisibility();
    this.trackSwitching();
    this.likeTrack();
    this.soundChange();
    this.playPauseSwitch();
  }

  async updateVisibility() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const path = window.location.pathname;
    const isAuthPage = path === '/login' || path === '/register';

    if (isAuthenticated && !isAuthPage) {
      if (!document.getElementById('player')) {
        await this.render(); // только если плеера ещё нет
      }
    }
    if (!isAuthPage) {
      if (!document.getElementById('player')) {
        await this.renderWithoutData();
      }
    } else {
      await this.destroy();
    }
  }

  async renderWithoutData() {
    const contentTemplate = Handlebars.templates['player.hbs'];
    const playerHTML = contentTemplate();

    const playerContainer = document.getElementById('player-container');
    if (playerContainer && !document.getElementById('player')) {
      playerContainer.insertAdjacentHTML('afterbegin', playerHTML);
    }

    this.volumeRender();
    this.playPauseSwitch();
    this.sliderColorChange();
    this.likeTrack();
    this.soundChange();
  }

  async destroy() {
    const playerElement = document.querySelector('.player');
    if (playerElement) {
      playerElement.remove();
    }
    this.audio.pause();
    this.audio.src = '';
    this.currentTrack = null;
    this.canSaveTime = true;
    this.nextTrackId = null;
    this.prevTrackId = null;
  }

  async getDataTrackById(track_id) {
    if (!track_id) return null;
    const trackData = await apiServise.loadTrackById(track_id);
    return trackData;
  }

  async loadTrack(trackData) {
    if (!trackData) return;
    this.currentTrack = trackData;
    console.log('curtrack', this.currentTrack.id);
    this.loadTrackInfo(this.currentTrack);
    localStorage.setItem('currentTrackId', this.currentTrack.id);
    await this.getPrevAndNextTracks();
  }

  async getPrevAndNextTracks() {
    if (!this.currentTrack || !this.currentTrack.id) {
      console.warn('Невозможно определить соседей: текущий трек не установлен.');
      return;
    }

    try {
      const allTracks = await apiServise.request('/tracks?limit=1000').catch(() => []); // Увеличим лимит

      const currentIndex = allTracks.findIndex((t) => t.id === this.currentTrack.id);
      if (currentIndex === -1) {
        console.warn('Текущий трек не найден в общем списке треков.');
        this.nextTrackId = null;
        this.prevTrackId = null;
      } else {
        const nextTrackObject = allTracks[currentIndex + 1];
        const prevTrackObject = allTracks[currentIndex - 1];

        this.nextTrackId = nextTrackObject ? nextTrackObject.id : null;
        this.prevTrackId = prevTrackObject ? prevTrackObject.id : null;
      }

      const [nextTrackData, prevTrackData] = await Promise.all([this.getDataTrackById(this.nextTrackId), this.getDataTrackById(this.prevTrackId)]);
      const event = new CustomEvent('trackchange', {
        detail: { prev: prevTrackData ? prevTrackData : null, current: this.currentTrack, next: nextTrackData ? nextTrackData : null },
      });
      this.dispatchEvent(event);
    } catch (error) {
      console.error('Ошибка при получении предыдущего/следующего треков:', error);
    }
  }

  async render() {
    await this.renderWithoutData();

    this.audio.addEventListener('timeupdate', () => {
      this.updateCurrentTimeAndSlider();
    });

    const storedTrackId = localStorage.getItem('currentTrackId');
    let storedTrackData = await this.getDataTrackById(storedTrackId);

    await Promise.all([this.loadTrack(storedTrackData), this.getPrevAndNextTracks()]);

    this.setInitialVolume();
    this.setInitialPLayTime();

    this.audio.addEventListener('ended', () => {
      this.nextTrack();
    });
  }

  async loadAndPlayTrackById(trackId) {
    const trackData = await this.getDataTrackById(trackId);

    if (!trackData) {
      console.error(`Трек с ID ${trackId} не найден.`);
      return;
    }

    await Promise.all([this.loadTrack(trackData), this.audio.play()]);

    this.togglePlayPauseSwitch(true);
    localStorage.setItem('isPlaying', 'true');
  }

  loadTrackInfo(track) {
    document.querySelector('.track-title').textContent = track.title;
    const artistName = track.artists?.[0]?.name;
    document.querySelector('.track-artist').textContent = artistName;

    const durationInSeconds = track.duration_s;
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    const durationFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.querySelector('.track-time.total').textContent = durationFormatted;

    document.querySelector('.track-cover-player').src = getValidImage(track?.album?.avatar_url, 'default-album.png');

    let file_url = track.file_url;
    this.audio.src = file_url ? `${API_TRACKS_URL}/${file_url}` : `static/music/${file_url}`;

    this.audio.load();
  }

  updateCurrentTimeAndSlider() {
    const currentTime = this.audio.currentTime;
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

    if (this.canSaveTime) {
      this.canSaveTime = false;

      localStorage.setItem('playTime', currentTime.toFixed(1));

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

      if (volume === 0) {
        volumeIcon.classList.add('level-0');
      } else if (volume <= 35) {
        volumeIcon.classList.add('level-1');
      } else if (volume <= 75) {
        volumeIcon.classList.add('level-2');
      } else {
        volumeIcon.classList.add('level-3');
      }
    }

    volumeSlider.addEventListener('wheel', function (e) {
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
    });

    updateVolumeSlider(volumeSlider.value);
    volumeSlider.addEventListener('input', function () {
      updateVolumeSlider(this.value);
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
      // Если стоит на паузе, запускаем
      await this.audio.play();
      localStorage.setItem('isPlaying', 'true');
      this.togglePlayPauseSwitch(true);
    } else {
      // Если играет, ставим на паузу
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

  likeTrack() {
    const likeBnt = document.querySelector('.like-btn');
    likeBnt.addEventListener('click', () => {
      if (likeBnt.classList.contains('active')) {
        likeBnt.classList.remove('active');
      } else {
        likeBnt.classList.add('active');
      }
    });
  }

  soundChange() {
    const volumeRegulator = document.querySelector('.volume-slider');

    volumeRegulator.addEventListener('input', (event) => {
      const sliderElement = event.target;
      const value = sliderElement.value;
      sliderElement.style.setProperty('--progress', value + '%');
      this.audio.volume = value / 100;
    });

    //чтобы сохранялась гросмкость на будущее
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
    await this.loadAndPlayTrackById(this.nextTrackId);
  }

  async prevTrack() {
    await this.loadAndPlayTrackById(this.prevTrackId);
  }
}

export const player = new Player();
