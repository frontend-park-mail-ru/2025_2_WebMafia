import { player } from "@/components/player/player";

export function albumPlaylistButtons(): void {
  const getDescriptionButton = document.getElementById('getDescription');
  const getDescriptionOverlay = document.getElementById('descriptionOverlay');
  const closeDescriptionButton = document.getElementById('closeDescriptionButton');

  if (getDescriptionButton && getDescriptionOverlay) {
    getDescriptionButton.addEventListener('click', (e: MouseEvent) => {
      e.preventDefault();
      getDescriptionOverlay.classList.add('active');
    });
  }

  if (closeDescriptionButton && getDescriptionOverlay) {
    closeDescriptionButton.addEventListener('click', (e: MouseEvent) => {
      e.preventDefault();
      getDescriptionOverlay.classList.remove('active');
    });
  }

  if (getDescriptionOverlay) {
    getDescriptionOverlay.addEventListener('click', (e: MouseEvent) => {
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

  const dotsBtn = document.querySelector('.dots') as HTMLElement;
  const menu = document.querySelector('.actions-menu') as HTMLElement;
  if (!dotsBtn || !menu) return;

  dotsBtn.addEventListener('click', (e: MouseEvent) => {
    e.preventDefault();
    menu.classList.toggle('hidden');

    const rect = dotsBtn.getBoundingClientRect();
    const parent = dotsBtn.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();

    const top = rect.top - parentRect.top - menu.offsetHeight - 6;
    const left = rect.left - parentRect.left - 10;

    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
  });

  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as Node;
    if (!menu.contains(target) && !dotsBtn.contains(target)) {
      menu.classList.add('hidden');
    }
  });

  menu.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.actions-item')) {
      menu.classList.add('hidden');
    }
  });
}