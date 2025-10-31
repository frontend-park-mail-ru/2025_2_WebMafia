// import { apiServise } from '../../data';

export class Player {
  constructor() {
    // Создаем аудиоэлемент, который будет проигрывать музыку
    this.audio = new Audio();
    this.currentTrack = null;
    this.canSaveTime = true;
    this.nextTrackId = null;
    this.prevTrackId = null;
  }

  async init() {
    this.render();

    this.volumeRender();
    this.playPauseSwitch();
    this.sliderColorChange();
    this.likeTrack();
    this.soundChange();
  }

  async getDataTrackById(track_id) {
    // const trackData = await apiServise.loadTrackById(track_id);
    // return trackData;
    const data = [
      {
        title: 'Японский сэмпл',
        id: '66666666-6666-6666-6666-666666666666',
        imageUrl: 'image1.jpg',
        fileName: 'японский сэмпл 128 бпм.mp3',
        artist: 'Артём Голубев',
        duration: 185,
        durationFormatted: '3:05',
      },
      {
        title: 'Японский бит',
        id: '77777777-7777-7777-7777-777777777777',
        imageUrl: 'image2.jpg',
        fileName: 'японский сэмпл 128 бпм.mp3',
        artist: 'НИГА что ты тут делаешь',
        duration: 185,
        durationFormatted: '3:05',
      },
      {
        title: 'Япония уээ эээ ээ эээээээ ээээээээээ ээээээээээээээээээээ эээээээээээээээээ',
        id: '88888888-8888-8888-8888-888888888888',
        imageUrl: 'image3.jpg',
        fileName: 'японский сэмпл 128 бпм.mp3',
        artist: 'Я играю в иииигры ыоврлоыфп лыфовр лфыово рфыловр ',
        duration: 185,
        durationFormatted: '3:05',
      },
      {
        title: 'Япония уээ эээ ээ эээээээ ээээээээээ ээээээээээээээээээээ эээээээээээээээээ',
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc',
        imageUrl: 'image4.jpg',
        fileName: 'японский сэмпл 128 бпм.mp3',
        artist: 'Я играю в иииигры ыоврлоыфп лыфовр лфыово рфыловр ',
        duration: 185,
        durationFormatted: '3:05',
      },
      {
        title: 'Япония уээ эээ ээ эээээээ ээээээээээ ээээээээээээээээээээ эээээээээээээээээ',
        id: 'dddddddd-dddd-dddd-dddd-ddddddddddde',
        imageUrl: 'image5.jpg',
        fileName: 'японский сэмпл 128 бпм.mp3',
        artist: 'Я играю в иииигры ыоврлоыфп лыфовр лфыово рфыловр ',
        duration: 185,
        durationFormatted: '3:05',
      },
    ];
    const trackData = data.find((track) => track.id === track_id);
    const currentIndex = data.findIndex((track) => track.id === track_id);
    const nextTrackObject = data[currentIndex + 1];
    this.nextTrackId = nextTrackObject ? nextTrackObject.id : null;
    const prevTrackObject = data[currentIndex - 1];
    this.prevTrackId = prevTrackObject ? prevTrackObject.id : null;
    return trackData;
  }

  loadTrack(trackData) {
    this.currentTrack = trackData;
    this.loadTrackInfo(this.currentTrack);
    localStorage.setItem('currentTrackId', this.currentTrack.id);
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
    this.setInitialVolume();
    this.setInitialPLayTime();
    this.trackSwitching();

    const storedTrackStatus = localStorage.getItem('isPlaying');
    if (storedTrackStatus === 'true') {
      this.audio.play().catch((e) => {
        this.togglePlayPauseSwitch(false);
        localStorage.setItem('isPlaying', 'false');
      });
      this.togglePlayPauseSwitch(true);
    } else {
      this.audio.pause();
      this.togglePlayPauseSwitch(false);
    }
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
    document.querySelector('.track-time.total').textContent = track.durationFormatted;

    document.querySelector('.track-cover-player').src = `static/img/${track.imageUrl}`;

    this.audio.src = `static/music/${track.fileName}`;
    this.audio.load();
  }

  updateCurrentTimeAndSlider() {
    const currentTime = this.audio.currentTime;
    const duration = this.currentTrack.duration;

    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);

    document.querySelector('.track-time.current').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const percent = (currentTime / duration) * 100;
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
        const duration = this.currentTrack.duration;
        const newTime = (value / 100) * duration;
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
    const duration = this.currentTrack.duration;
    const timeRegulator = document.querySelector('.remote-slider');
    const storedTime = parseFloat(localStorage.getItem('playTime'));
    timeRegulator.value = storedTime;
    this.audio.currentTime = storedTime;
    const percent = (storedTime / duration) * 100;
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
