export class Player {
  async render() {
    const contentTemplate = Handlebars.templates['player.hbs'];
    const headerHTML = contentTemplate();

    const section = document.getElementById('section');
    if (section && !document.getElementById('player')) {
      section.insertAdjacentHTML('afterbegin', headerHTML);
    }
    this.volumeRender();
    this.playPauseSwitch();
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
}

export const player = new Player();
