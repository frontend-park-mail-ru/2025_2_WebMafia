import { router } from '../../routing.js';
import { apiServise } from '../../data.js';
import { initPasswordShowing } from '../../eye.js';
import { initScrollbar } from '../../scrollbar.js';
import { durationParser, getValidImage, playsParser } from '../../parsers.js';
import { sidebar } from '../sidebar/sidebar.js';
import { slider } from '../../slider.js';
import { header } from '../header/header.js';
import { setPlayButtonsOnAuth } from '../../setPlayButtonsOnAuth.js';

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
      profile: {},
    };

    const contentTemplate = Handlebars.templates['profilePage.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);
    document.querySelector('head title').textContent = 'Wave music';

    try {
      const data = await apiServise.getProfilePageData();
      const profile = await apiServise.getProfileData();
      pageData.profile.avatar = profile.AvatarURL ? getValidImage(profile.AvatarURL) : profile.AvatarURL;
      pageData.profile.nickname = profile.Login;
      pageData.profile.letter = pageData.profile.nickname ? pageData.profile.nickname[0] : '';
      pageData.profile.email = profile.Email;
      pageData.top_artists = (data.top_artists || []).map((artist) => ({
        id: artist.id,
        name: artist.name,
        listeners: playsParser(artist.play_count) || 0,
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
    this.addEventListeners(pageData.profile);
    initPasswordShowing();
    initScrollbar();
    setPlayButtonsOnAuth();
  }

  addEventListeners(profile) {
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

        document.getElementById('email').value = profile.email;
        document.getElementById('login').value = profile.nickname;
        document.getElementById('password').value = '';
        document.getElementById('passwordConfirm').value = '';

        updateAvatarContainer('avatarEditContainer', profile.avatar, profile.letter, 'profile-edit-avatar');

        selectedAvatarFile = null;
        deleteAvatar = false;

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

    function updateAvatarContainer(containerId, avatarUrl = null, letter = null, className = '') {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.textContent = '';

      if (avatarUrl) {
        const img = document.createElement('img');
        img.src = avatarUrl;
        img.alt = 'Ваш аватар';
        img.className = 'profile-image';
        img.style.objectFit = 'cover';
        container.appendChild(img);
      } else {
        const avatarDiv = document.createElement('div');
        avatarDiv.className = `default-avatar ${className}`;
        avatarDiv.textContent = letter || '';
        container.appendChild(avatarDiv);
      }
    }

    let selectedAvatarFile = null;
    let deleteAvatar = false;
    const editAvatarButtons = document.getElementById('editAvatarButtons');
    if (editAvatarButtons) {
      editAvatarButtons.addEventListener('click', (e) => {
        const target = e.target;

        if (target.id === 'setAvatarButton') {
          e.preventDefault();

          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.click();

          input.addEventListener('change', () => {
            const file = input.files[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
              alert('Файл слишком большой (максимум 5МБ)');
              return;
            }

            selectedAvatarFile = file;
            deleteAvatar = false;

            const reader = new FileReader();
            reader.onload = (event) => {
              updateAvatarContainer('avatarEditContainer', event.target.result);

              if (!document.getElementById('deleteAvatarButton')) {
                editAvatarButtons.insertAdjacentHTML(
                  'beforeend',
                  `<button id="deleteAvatarButton" class="secondary-button save-avatar-button-size">Удалить фото</button>`
                );
              }
            };
            reader.readAsDataURL(file);
          });
        }

        if (target.id === 'deleteAvatarButton') {
          e.preventDefault();

          selectedAvatarFile = null;
          deleteAvatar = true;

          updateAvatarContainer('avatarEditContainer', null, letter, 'profile-edit-avatar');

          target.remove();
        }
      });
    }

    const saveButton = document.getElementById('saveProfileChangesButton');
    if (saveButton) {
      saveButton.addEventListener('click', async (e) => {
        e.preventDefault();

        //const formData = new FormData(document.getElementById('editProfileForm'));

        try {
          if (selectedAvatarFile) {
            const response = await apiServise.uploadAvatar(selectedAvatarFile);
            const newAvatarUrl = getValidImage(response.avatar_url);

            updateAvatarContainer('avatarProfileContainer', newAvatarUrl);
            updateAvatarContainer('avatarHeaderContainer', newAvatarUrl);

            selectedAvatarFile = null;
          }
          else if (deleteAvatar) {
            await apiServise.deleteAvatar();

            updateAvatarContainer('avatarProfileContainer', null, letter, 'default-avatar-profile');
            updateAvatarContainer('avatarHeaderContainer', null, letter, 'default-avatar-header');

            deleteAvatar = false;
          }

          //await apiServise.saveProfile(formData);
        } catch (err) {
          console.error(err);
          alert('Не удалось сохранить изменения');
        }

        editProfileOverlay.classList.remove('active');
      });
    }
  }
}
