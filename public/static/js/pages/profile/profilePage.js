import { router } from '../../routing.js';
import { apiServise } from '../../data.js';
import { initPasswordShowing } from '../../eye.js';
import { initScrollbar } from '../../scrollbar.js';
import { durationParser, getValidImage, playsParser } from '../../parsers.js';
import { sidebar } from '../sidebar/sidebar.js';
import { slider } from '../../slider.js';
import { player } from '../player/player.js';
import { header } from '../header/header.js';

export class ProfilePage {
  async render() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      router.navigate('/login');
      return;
    }

    let pageData = {
      isAuthenticated: true,
      top_artists: [],
      top_tracks: [],
      recent: [],
    };

    const contentTemplate = Handlebars.templates['profilePage.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);
    document.querySelector('head title').textContent = 'Wave music';

    try {
      const data = await apiServise.getProfilePageData();
      pageData.avatar = data.profile.AvatarURL ? getValidImage(data.profile.AvatarURL) : data.profile.AvatarURL;
      pageData.nickname = data.profile.Login;
      pageData.letter = pageData.nickname ? pageData.nickname[0] : '';
      pageData.email = data.profile.Email;
      pageData.top_artists = (data.top_artists || []).map((artist) => ({
        id: artist.id,
        name: artist.name,
        image: getValidImage('artists/' + artist.avatar_url, 'default-artist.png'),
      }));
      pageData.top_tracks = (data.top_tracks || []).map((track) => ({
        id: track.id,
        name: track.title,
        plays: playsParser(track.play_count) || 0,
        album: track.album.title,
        album_id: track.album.id,
        duration: durationParser(track.duration_s),
        cover: getValidImage('albums/' + track.album.avatar_url, 'default-album.png'),
        artists: track.artists,
      }));
      pageData.recent = (data.recent || []).map((artist) => ({
        id: artist.id,
        name: artist.name,
        image: getValidImage('artists/' + artist.avatar_url, 'default-artist.png'),
      }));
    } catch (error) {
      console.error('Failed to load profile page data:', error);
      localStorage.removeItem('isAuthenticated');
      router.navigate('/');
      return;
    }

    document.getElementById('app').innerHTML = contentTemplate(pageData);
    document.querySelector('head title').textContent = pageData.nickname;

    await Promise.all([header.render(), sidebar.render()]);

    slider.sliderFunction();
    this.addEventListeners(pageData.letter);
    initPasswordShowing();
    initScrollbar();
  }

  addEventListeners(letter) {
    const editProfileButton = document.getElementById('editProfileBtn');
    const editProfileOverlay = document.getElementById('editProfileOverlay');

    if (editProfileButton && editProfileOverlay) {
      editProfileButton.addEventListener('click', (e) => {
        e.preventDefault();
        editProfileOverlay.classList.add('active');
      });
    }

    const closeEditButton = document.getElementById('closeEditButton');
    if (closeEditButton && editProfileOverlay) {
      closeEditButton.addEventListener('click', (e) => {
        e.preventDefault();
        editProfileOverlay.classList.remove('active');
      });
    }

    if (editProfileOverlay) {
      editProfileOverlay.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target === editProfileOverlay) {
          editProfileOverlay.classList.remove('active');
        }
      });
    }

    const editAvatarButtons = document.getElementById('editAvatarButtons');
    if (editAvatarButtons) {
      editAvatarButtons.addEventListener('click', async (e) => {
        const target = e.target;

        if (target.id === 'setAvatarButton') {
          e.preventDefault();

          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.click();

          input.addEventListener('change', async () => {
            const file = input.files[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
              alert('Файл слишком большой (максимум 5МБ)');
              return;
            }

            try {
              const response = await apiServise.uploadAvatar(file);
              const newAvatarUrl = getValidImage(response.avatar_url);

              const avatarContainers = document.querySelectorAll('.user-avatar');

              avatarContainers.forEach((container) => {
                let img = container.querySelector('img');
                if (!img) {
                  img = document.createElement('img');
                  img.alt = 'Ваш аватар';
                  img.className = 'profile-image';
                  img.style.objectFit = 'cover';
                  container.textContent = '';
                  container.appendChild(img);
                }
                img.src = newAvatarUrl;
              });

              if (!document.getElementById('deleteAvatarButton')) {
                editAvatarButtons.insertAdjacentHTML('beforeend', `<button id="deleteAvatarButton" class="secondary-button save-avatar-button-size">Удалить фото</button>`);
              }
            } catch (err) {
              console.error('Ошибка загрузки аватара:', err);
              alert('Не удалось загрузить аватар.');
            }
          });
        }

        if (target.id === 'deleteAvatarButton') {
          e.preventDefault();

          if (!confirm('Вы уверены, что хотите удалить аватар?')) return;

          try {
            await apiServise.deleteAvatar();

            function updateAvatarContainer(containerId, letter, className) {
              const container = document.getElementById(containerId);
              if (!container) return;

              container.textContent = '';

              const avatarDiv = document.createElement('div');
              avatarDiv.className = `default-avatar ${className}`;
              avatarDiv.textContent = letter;

              container.appendChild(avatarDiv);
            }

            updateAvatarContainer('avatarProfileContainer', letter, 'default-avatar-profile');
            updateAvatarContainer('avatarEditContainer', letter, 'profile-edit-avatar');
            updateAvatarContainer('avatarHeaderContainer', letter, 'default-avatar-header');

            target.remove();
          } catch (err) {
            console.error('Ошибка при удалении аватара:', err);
            alert('Не удалось удалить аватар.');
          }
        }
      });
    }
  }
}
