// import { apiServise } from '../../data';

export class Player extends EventTarget {
  constructor() {
    super();
    this.audio = new Audio();
    this.currentTrack = null;
    this.canSaveTime = true;
    this.nextTrackId = null;
    this.prevTrackId = null;
    this.allData = [
      {
        title: 'Японский сэмпл',
        id: '91f5c6a7-abab-4e6b-a65c-7a143f82c2b7',
        imageUrl: 'image1.jpg',
        file_url: 'японский сэмпл 128 бпм.mp3',
        artist: 'Артём Голубев',
        duration_ms: 185000,
        durationFormatted: '3:05',
      },
      {
        title: 'HAZARD DUTY PAY!',
        id: 'aecde8e4-349a-48ae-b0fb-6bc739e4602a',
        imageUrl: 'image2.jpg',
        file_url: 'JPEGMAFIA - HAZARD DUTY PAY! (Instrumental).mp3',
        artist: 'JPEGMAFIA',
        duration_ms: 157000,
        durationFormatted: '2:37',
      },
      {
        title: 'Take on Me',
        id: 'aee6fd92-8036-4b41-bc3d-030f80846704',
        imageUrl: 'image3.jpg',
        file_url: 'Take on Me.mp3',
        artist: 'a-ha',
        duration_ms: 227000,
        durationFormatted: '3:47',
      },
      {
        title: 'Everything I am (Official Instrumental HQ)',
        id: '7e4f2ebf-2ff0-4e4d-9fbc-d0904a32be55',
        imageUrl: 'image4.jpg',
        file_url: 'Kanye West - Everything I am (Official Instrumental HQ).mp3',
        artist: 'Kanye West ',
        duration_ms: 227000,
        durationFormatted: '3:47',
      },
      {
        title: 'HEAVEN-TO-ME',
        id: 'a2840de3-563c-439d-853d-5b2d40112754',
        imageUrl: 'image5.jpg',
        file_url: 'Tyler-The-Creator-HEAVEN-TO-ME-Instrumental-Prod.-By-John-Legend-Kanye-West (1).mp3',
        artist: 'Tyler, The Creator',
        duration_ms: 230000,
        durationFormatted: '3:50',
      },
    ];
  }

  async init() {
    // this.checkAuth();
    // Мы подписываемся на события, которые генерирует ваш роутер,
    // чтобы знать, когда URL меняется.
    // window.addEventListener('popstate', () => this.updateVisibility());
    // Также нам нужен способ "подслушать" вызовы `router.navigate()`.
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    // Создадим кастомное событие для этого.
    if (!isAuthenticated) {
      window.addEventListener('va-navigate', () => this.updateVisibility());
    }
    // Запускаем проверку один раз при первоначальной загрузке
    this.updateVisibility();
    this.trackSwitching();
    this.likeTrack();
  }

  updateVisibility() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const path = window.location.pathname;
    const isAuthPage = path === '/login' || path === '/register';

    if (isAuthenticated && !isAuthPage) {
      this.render();
    }
    if (!isAuthPage) {
      this.renderWhithoutData();
    } else {
      this.destroy();
    }
  }

  async renderWhithoutData() {
    const contentTemplate = Handlebars.templates['player.hbs'];
    const playerHTML = contentTemplate();

    const playerСontainer = document.getElementById('player-container');
    if (playerСontainer && !document.getElementById('player')) {
      playerСontainer.insertAdjacentHTML('afterbegin', playerHTML);
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
    // const trackData = await apiServise.loadTrackById(track_id);
    // return trackData;
    if (!track_id) return null;
    const trackData = this.allData.find((track) => track.id === track_id);
    return trackData;
  }

  async loadTrack(trackData) {
    if (!trackData) return;
    this.currentTrack = trackData;
    this.loadTrackInfo(this.currentTrack);
    localStorage.setItem('currentTrackId', this.currentTrack.id);
    this.getPrevAndNextTracks();
  }

  async getPrevAndNextTracks() {
    const currentIndex = this.allData.findIndex((track) => track.id === this.currentTrack.id);
    const nextTrackObject = this.allData[currentIndex + 1];
    this.nextTrackId = nextTrackObject ? nextTrackObject.id : null;
    const prevTrackObject = this.allData[currentIndex - 1];
    this.prevTrackId = prevTrackObject ? prevTrackObject.id : null;

    const [nextTrackData, prevTrackData] = await Promise.all([this.getDataTrackById(this.nextTrackId), this.getDataTrackById(this.prevTrackId)]);

    const event = new CustomEvent('trackchange', {
      detail: {
        prev: prevTrackData,
        current: this.currentTrack,
        next: nextTrackData,
      },
    });
    this.dispatchEvent(event);
  }

  async render() {
    const contentTemplate = Handlebars.templates['player.hbs'];
    const playerHTML = contentTemplate();

    const playerСontainer = document.getElementById('player-container');
    if (playerСontainer && !document.getElementById('player')) {
      playerСontainer.insertAdjacentHTML('afterbegin', playerHTML);
    }

    this.volumeRender();
    this.playPauseSwitch();
    this.sliderColorChange();
    this.likeTrack();
    this.soundChange();

    this.audio.addEventListener('timeupdate', () => {
      this.updateCurrentTimeAndSlider();
    });

    const storedTrackId = localStorage.getItem('currentTrackId');
    let storedTrackData = await this.getDataTrackById(storedTrackId);

    this.loadTrack(storedTrackData);
    this.getPrevAndNextTracks();
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

    this.loadTrack(trackData);
    this.audio.play();
    this.togglePlayPauseSwitch(true);
    localStorage.setItem('isPlaying', 'true');
  }

  loadTrackInfo(track) {
    document.querySelector('.track-title').textContent = track.title;
    document.querySelector('.track-artist').textContent = track.artist;
    // document.querySelector('.track-time.total').textContent = track.durationFormatted;
    const durationInSeconds = Math.round(track.duration_ms / 1000);
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    const durationFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.querySelector('.track-time.total').textContent = durationFormatted;

    document.querySelector('.track-cover-player').src = `static/img/${track.imageUrl}`;

    this.audio.src = `static/music/${track.file_url}`;
    // let file_url = track.file_url;
    // this.audio.src = file_url ? `http://localhost:8099/music/tracks/${file_url}.webm` : `static/music/${file_url}`;

    this.audio.load();
  }

  updateCurrentTimeAndSlider() {
    const currentTime = this.audio.currentTime;
    const duration_ms = Math.round(this.currentTrack.duration_ms / 1000);
    const duration_s = duration_ms / 1000;

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
    playBtn.addEventListener('click', () => {
      this.audio.play();
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

  togglePlayPause() {
    if (this.audio.paused) {
      // Если стоит на паузе, запускаем
      this.audio.play();
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
        const duration_ms = Math.round(this.currentTrack.duration_ms / 1000);
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
    const duration_ms = Math.round(this.currentTrack.duration_ms / 1000);
    const duration_s = duration_ms / 1000;
    const timeRegulator = document.querySelector('.remote-slider');
    const storedTime = parseFloat(localStorage.getItem('playTime'));
    timeRegulator.value = storedTime;
    this.audio.currentTime = storedTime;
    const percent = (storedTime / duration_ms) * 100;
    timeRegulator.style.setProperty('--progress', percent + '%');
  }

  trackSwitching() {
    const nextBtn = document.querySelector('.control-btn.next');
    const prevBtn = document.querySelector('.control-btn.prev');

    nextBtn.addEventListener('click', () => {
      this.nextTrack();
    });

    prevBtn.addEventListener('click', () => {
      this.prevTrack();
    });
  }

  nextTrack() {
    this.loadAndPlayTrackById(this.nextTrackId);
  }

  prevTrack() {
    this.loadAndPlayTrackById(this.prevTrackId);
  }
}

export const player = new Player();
