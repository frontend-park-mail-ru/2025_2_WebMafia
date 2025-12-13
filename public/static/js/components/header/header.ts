import { apiServise } from '@/data.js';
import { router } from '@/routing.js';
import { getValidImage } from '@/utils/parsers.ts';
import { player } from '@/components/player/player.js';
import { confirmation } from '@/components/confirmation_modal/confirmationModal.js';
import { images } from '@/assets';

class Header {
  private boundDocumentClick: ((e: Event) => void) | null = null;

  async render(searchValue = '') {
    const container = document.getElementById('header');
    if (!container || container.innerHTML.trim() !== '') return;

    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    let pageData: any = {
      isAuthenticated: isAuthenticated,
      searchValue: searchValue,
      logoImage: images.logoPath,
    };

    const contentTemplate = Handlebars.templates['header.hbs'];
    container.innerHTML = contentTemplate(pageData);

    if (!isAuthenticated) {
      this.addEventListeners();
      return;
    }

    try {
      const data = await apiServise.getProfileData();
      pageData.avatar = data.AvatarURL ? getValidImage(data.AvatarURL) : data.AvatarURL;
      pageData.nickname = data.Login;
      pageData.letter = pageData.nickname ? pageData.nickname[0].toUpperCase() : '';
    } catch (error) {
      console.error('Failed to load header user data:', error);
      return;
    }

    container.innerHTML = contentTemplate(pageData);

    this.addEventListeners();
    this.profileDropdown();
  }

  public destroy() {
    if (this.boundDocumentClick) {
      document.removeEventListener('click', this.boundDocumentClick);
      this.boundDocumentClick = null;
    }
  }

  addEventListeners() {
    const logoutButton = document.getElementById('logoutBtn');
    const searchWindow = document.getElementById('searchInput') as HTMLInputElement;
    if (searchWindow) {
      searchWindow.addEventListener('keydown', (e) => {
        if (e.code === 'Enter' || e.key === 'Enter') {
          e.preventDefault();
          const searchVal = searchWindow.value;
          if (searchVal === '') return;
          searchWindow.value = searchVal;
          router.navigate(`/search/${searchVal}`);
        }
      });
    }

    if (logoutButton) {
      logoutButton.addEventListener('click', (e) => {
        e.preventDefault();

        confirmation.showConfirm({
          title: 'Выход из аккаунта',
          description: 'Вы уверены, что хотите выйти из аккаунта <b>Wave Music</b>?',
          confirmText: 'Выйти',
          cancelText: 'Отмена',
          onConfirm: async () => {
            try {
              await apiServise.logoutUser();
            } catch (error: any) {
              console.error('Logout request failed:', error.message);
            } finally {
              localStorage.clear();
              this.destroy();

              const headerContainer = document.getElementById('header');
              if (headerContainer) headerContainer.innerHTML = '';

              player.destroy();
              router.navigate('/');
            }
          },
        });
      });
    }

    this.initSearchToggle();
  }

  private initSearchToggle() {
    const searchToggle = document.getElementById('searchToggle');
    const searchContainer = document.getElementById('header-search-container');
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    const inputCloseButton = document.querySelector('.input-close-button');
    const headLeft = document.querySelector('.head-left') as HTMLElement;

    if (!searchToggle || !searchContainer || !searchInput || !inputCloseButton || !headLeft)
      return;

    searchToggle.addEventListener('click', (e) => {
      e.preventDefault();

      setTimeout(() => {
        searchToggle.classList.add('hidden');
        headLeft.style.visibility = 'hidden';
        searchContainer.classList.add('active');
      }, 100);

      setTimeout(() => searchInput.focus(), 200);
    });

    inputCloseButton.addEventListener('click', (e) => {
      e.preventDefault();

      searchContainer.classList.remove('active');
      searchToggle.classList.remove('hidden');
      headLeft.style.visibility = 'visible';
    });
  }

  private profileDropdown() {
    const profileBtn = document.querySelector('.profile-btn');
    const dropDownMenu = document.querySelector('.dropdown-menu');

    if (!profileBtn || !dropDownMenu)
      return;

    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropDownMenu.classList.toggle('show');
    });

    this.boundDocumentClick = (e: Event) => {
      const target = e.target as Node;
      const isClickInside = profileBtn.contains(target) || dropDownMenu.contains(target);
      if (!isClickInside) {
        dropDownMenu.classList.remove('show');
      }
    };

    document.addEventListener('click', this.boundDocumentClick);
  }
}

export const header = new Header();
