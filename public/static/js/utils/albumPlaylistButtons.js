import { player } from "@/components/player/player.js";

export function albumPlaylistButtons() {
  const getDescriptionButton = document.getElementById('getDescription');
  const getDescriptionOverlay = document.getElementById('descriptionOverlay');
  const closeDescriptionButton = document.getElementById('closeDescriptionButton');

  if (getDescriptionButton && getDescriptionOverlay) {
    getDescriptionButton.addEventListener('click', (e) => {
      e.preventDefault();
      getDescriptionOverlay.classList.add('active');
    });
  }

  if (closeDescriptionButton && getDescriptionOverlay) {
    closeDescriptionButton.addEventListener('click', (e) => {
      e.preventDefault();
      getDescriptionOverlay.classList.remove('active');
    });
  }

  if (getDescriptionOverlay) {
    getDescriptionOverlay.addEventListener('click', (e) => {
      e.preventDefault();
      if (e.target === getDescriptionOverlay) {
        getDescriptionOverlay.classList.remove('active');
      }
    });
  }

  const shuffleBtn = document.querySelector('.album-buttons .control-btn.shuffle-album');
  if (shuffleBtn) {
    if (player.isShaffle) {
      shuffleBtn.classList.add('active');
    }
    shuffleBtn.addEventListener('click', () => {
      player.handleShaffleClick();
    });
  }

  const dotsBtn = document.querySelector('.dots');
  const menu = document.querySelector('.actions-menu');

  if (dotsBtn && menu) {
    dotsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      menu.classList.toggle('hidden');

      const rect = dotsBtn.getBoundingClientRect();
      const parentRect = dotsBtn.parentElement.getBoundingClientRect();

      const top = rect.top - parentRect.top - menu.offsetHeight - 6;
      const left = rect.left - parentRect.left - 10;

      menu.style.top = `${top}px`;
      menu.style.left = `${left}px`;
    });

    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !dotsBtn.contains(e.target)) {
        menu.classList.add('hidden');
      }
    });

    menu.addEventListener('click', (e) => {
      if (e.target.closest('.actions-item')) {
        menu.classList.add('hidden');
      }
    });
  }
}