// import { apiServise } from '../../data';

export class Player {
  constructor() {
    // Создаем аудиоэлемент, который будет проигрывать музыку
    this.audio = new Audio();
    this.currentTrack = null;
  }
  async render() {
    const contentTemplate = Handlebars.templates['player.hbs'];
    const playerHTML = contentTemplate();

    const section = document.getElementById('section');
    if (section && !document.getElementById('player')) {
      section.insertAdjacentHTML('afterbegin', playerHTML);
    }
    const data = {
      track: {
        title: 'Японский сэмпл',
        id: '1',
        imageUrl: 'image1.jpg',
        fileName: 'японский сэмпл 128 бпм.mp3',
        artist: 'Артём Голубев',
        duration: 185,
        durationFormatted: '3:05',
      },
    };

    const storedTrack = localStorage.getItem('currentTrackId');
    let trackLoad = null;
    if (storedTrack) {
      // const data = await apiServise.loadtrack().track;
      trackLoad = data.track;
    } else {
      // const data = await apiServise.loadtrack().track;
      trackLoad = data.track;
    }
    this.currentTrack = trackLoad;
    const track = this.currentTrack;
    this.loadTrackInfo(track);

    this.volumeRender();
    this.playPauseSwitch();
    this.sliderColorChange();
    this.likeTrack();
    this.soundChange();
    this.setInitialVolume();
    this.setInitialPLayTime();
    this.togglePlayPause();

    // Добавляем обработчик события 'loadedmetadata', чтобы установить общее время и обновить слайдер
    this.audio.addEventListener('loadedmetadata', () => {
      this.audio.duration;
    });

    // Добавляем обработчик 'timeupdate' для обновления текущего времени и слайдера
    this.audio.addEventListener('timeupdate', () => {
      this.updateCurrentTimeAndSlider();
    });

    const storedTrackStatus = localStorage.getItem('isPlaying') === 'true';
    if (storedTrackStatus) {
      this.audio.play().catch((e) => {
        this._toggleplayPauseSwitch(false);
        localStorage.setItem('isPlaying', 'false');
      });
      this._toggleplayPauseSwitch(true);
    } else {
      this._toggleplayPauseSwitch(false);
    }
  }

  loadTrackInfo(track) {
    document.querySelector('.track-title').textContent = track.title;
    document.querySelector('.track-artist').textContent = track.artist;
    document.querySelector('.track-time.total').textContent = track.durationFormatted;

    document.querySelector('.track-cover').src = `static/img/${track.imageUrl}`;

    this.audio.src = `static/music/${track.fileName}`;
    this.audio.load();
  }

  updateCurrentTimeAndSlider() {
    const currentTime = this.audio.currentTime;
    const duration = this.currentTrack.duration;

    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);

    document.querySelector('.track-time.current').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    localStorage.setItem('playTime', currentTime.toFixed(1));

    const percent = (currentTime / duration) * 100;
    const timeRegulator = document.querySelector('.remote-slider');
    if (timeRegulator) {
      timeRegulator.value = percent;
      timeRegulator.style.setProperty('--progress', percent + '%');
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

  _toggleplayPauseSwitch(isPlaying) {
    const playBtn = document.querySelector('.control-btn.play');
    const pauseBtn = document.querySelector('.control-btn.pause');
    if (isPlaying) {
      this.audio.play();
      playBtn.classList.add('disactive');
      pauseBtn.classList.add('active');
      playBtn.classList.remove('active');
      pauseBtn.classList.remove('disactive');
    } else {
      this.audio.pause();
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
      this._toggleplayPauseSwitch(true);
    });
    pauseBtn.addEventListener('click', () => {
      this.audio.pause();
      localStorage.setItem('isPlaying', 'false');
      this._toggleplayPauseSwitch(false);
    });
  }

  togglePlayPause() {
    if (this.audio.paused) {
      // Если стоит на паузе, запускаем
      this.audio.play().catch((e) => console.error('Ошибка play():', e));
      localStorage.setItem('isPlaying', 'true');
      this._toggleplayPauseSwitch(true);
    } else {
      // Если играет, ставим на паузу
      this.audio.pause();
      localStorage.setItem('isPlaying', 'false');
      this._toggleplayPauseSwitch(false);
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
}

export const player = new Player();
