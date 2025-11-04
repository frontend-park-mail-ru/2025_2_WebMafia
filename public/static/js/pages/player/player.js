import { apiServise } from '../../data.js';

export class Player extends EventTarget {
  constructor() {
    super();
    this.audio = new Audio();
    this.currentTrack = null;
    this.canSaveTime = true;
    this.nextTrackId = null;
    this.prevTrackId = null;
    // this.allData = [
    //   {
    //     title: 'Японский сэмпл',
    //     id: '66666666-6666-6666-6666-666666666666',
    //     imageUrl: 'image1.jpg',
    //     file_url: 'японский сэмпл 128 бпм.mp3',
    //     artist: 'Артём Голубев',
    //     duration_ms: 185000,
    //     durationFormatted: '3:05',
    //   },
    //   {
    //     title: 'HAZARD DUTY PAY!',
    //     id: '77777777-7777-7777-7777-777777777777',
    //     imageUrl: 'image2.jpg',
    //     file_url: 'JPEGMAFIA - HAZARD DUTY PAY! (Instrumental).mp3',
    //     artist: 'JPEGMAFIA',
    //     duration_ms: 157000,
    //     durationFormatted: '2:37',
    //   },
    //   {
    //     title: 'Take on Me',
    //     id: '88888888-8888-8888-8888-888888888888',
    //     imageUrl: 'image3.jpg',
    //     file_url: 'Take on Me.mp3',
    //     artist: 'a-ha',
    //     duration_ms: 227000,
    //     durationFormatted: '3:47',
    //   },
    //   {
    //     title: 'Everything I am (Official Instrumental HQ)',
    //     id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc',
    //     imageUrl: 'image4.jpg',
    //     file_url: 'Kanye West - Everything I am (Official Instrumental HQ).mp3',
    //     artist: 'Kanye West ',
    //     duration_ms: 227000,
    //     durationFormatted: '3:47',
    //   },
    //   {
    //     title: 'HEAVEN-TO-ME',
    //     id: 'dddddddd-dddd-dddd-dddd-ddddddddddde',
    //     imageUrl: 'image5.jpg',
    //     file_url: 'Tyler-The-Creator-HEAVEN-TO-ME-Instrumental-Prod.-By-John-Legend-Kanye-West (1).mp3',
    //     artist: 'Tyler, The Creator',
    //     duration_ms: 230000,
    //     durationFormatted: '3:50',
    //   },
    // ];
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
    if (!track_id) return null;
    const trackData = await apiServise.loadTrackById(track_id);
    return trackData;
    // const trackData = this.allData.find((track) => track.id === track_id);
    // return trackData;
  }

  async loadTrack(trackData) {
    if (!trackData) return;
    this.currentTrack = trackData;
    this.loadTrackInfo(this.currentTrack);
    localStorage.setItem('currentTrackId', this.currentTrack.id);
    this.getPrevAndNextTracks();
  }

  async getPrevAndNextTracks() {
    if (!this.currentTrack || !this.currentTrack.id) {
      console.warn('Невозможно определить соседей: текущий трек не установлен.');
      return;
    }

    try {
      // 1. Загружаем ВЕСЬ список треков.
      // В идеале, здесь должен быть запрос, который возвращает только ID,
      // но для начала сойдет и полный список.
      const allTracks = await apiServise.request('/tracks?limit=4').catch(() => []); // Увеличим лимит

      if (!allTracks || !Array.isArray(allTracks)) {
        console.warn('⚠️ Не удалось получить список треков для определения соседей');
        return;
      }

      // 2. Находим индекс текущего трека в этом списке
      const currentIndex = allTracks.findIndex((t) => t.id === this.currentTrack.id);
      if (currentIndex === -1) {
        console.warn('⚠️ Текущий трек не найден в общем списке треков.');
        // В этом случае мы не можем определить соседей, но это не должно ломать плеер
        this.nextTrackId = null;
        this.prevTrackId = null;
      } else {
        // 3. Определяем соседние объекты
        const nextTrackObject = allTracks[currentIndex + 1];
        const prevTrackObject = allTracks[currentIndex - 1];

        this.nextTrackId = nextTrackObject ? nextTrackObject.id : null;
        this.prevTrackId = prevTrackObject ? prevTrackObject.id : null;
      }

      // 4. Загружаем полные данные для соседних треков
      const [nextTrackData, prevTrackData] = await Promise.all([this.getDataTrackById(this.nextTrackId), this.getDataTrackById(this.prevTrackId)]);

      // 5. Генерируем событие для обновления слайдера
      const event = new CustomEvent('trackchange', {
        detail: { prev: prevTrackData, current: this.currentTrack, next: nextTrackData },
      });
      this.dispatchEvent(event);
    } catch (error) {
      console.error('Ошибка при получении предыдущего/следующего треков:', error);
    }
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
    console.log(track);
    document.querySelector('.track-title').textContent = track.title;
    const artistName = track.artists[1].name; // Иначе, подставляем заглушк
    document.querySelector('.track-artist').textContent = artistName;

    const durationInSeconds = track.duration_s;
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    const durationFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.querySelector('.track-time.total').textContent = durationFormatted;

    const imageUrl = track.album && track.album.avatar_url ? `http://217.16.17.173:8099/music/${track.album.avatar_url}` : 'static/img/default_album_avatar.png';
    document.querySelector('.track-cover-player').src = imageUrl;

    // this.audio.src = `static/music/${track.file_url}`;
    let file_url = track.file_url;
    this.audio.src = file_url ? `http://217.16.17.173:8099/music/tracks/${file_url}` : `static/music/${file_url}`;

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
    const duration_ms = this.currentTrack.duration_s;
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
