export class Player {
  async render() {
    const contentTemplate = Handlebars.templates['player.hbs'];
    const playerHTML = contentTemplate();

    const section = document.getElementById('section');
    if (section && !document.getElementById('player')) {
      section.insertAdjacentHTML('afterbegin', playerHTML);
    }
    this.volumeRender();
    this.playPauseSwitch();
    this.sliderColorChange();
    this.likeTrack();
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

  playPauseSwitch() {
    const playBtn = document.querySelector('.control-btn.play');
    const pauseBtn = document.querySelector('.control-btn.pause');
    playBtn.classList.add('active');
    pauseBtn.classList.add('disactive');
    playBtn.addEventListener('click', () => {
      playBtn.classList.add('disactive');
      pauseBtn.classList.add('active');
      playBtn.classList.remove('active');
      pauseBtn.classList.remove('disactive');
    });
    pauseBtn.addEventListener('click', () => {
      playBtn.classList.add('active');
      pauseBtn.classList.add('disactive');
      playBtn.classList.remove('disactive');
      pauseBtn.classList.remove('active');
    });
  }

  sliderColorChange() {
    function parseTime(time) {
      const [minutes, seconds] = time.split(':').map(Number);
      return minutes * 60 + seconds;
    }
    const timeRegulator = document.querySelector('.remote-slider');
    timeRegulator.addEventListener('input', function () {
      const value = this.value;
      this.style.setProperty('--progress', value + '%');
      const currTimeElement = document.querySelector('.track-time.current');
      const totalTimeElement = document.querySelector('.track-time.total');
      const totalTimeText = totalTimeElement.textContent;
      const totalTime = parseTime(totalTimeText);
      const currentTime = Math.floor((value / 100) * totalTime);
      const minutes = Math.floor(currentTime / 60);
      const seconds = currentTime % 60;
      currTimeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    });
  }

  likeTrack() {
    const likeBnt = document.querySelector('.like-btn');
    console.log(likeBnt);
    likeBnt.addEventListener('click', () => {
      if (likeBnt.classList.contains('active')) {
        likeBnt.classList.remove('active');
      } else {
        likeBnt.classList.add('active');
      }
    });
  }
}

export const player = new Player();
