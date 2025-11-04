import { router } from '../../routing.js';
import { apiServise } from '../../data.js';
import { initPasswordShowing } from '../../eye.js';
import { initScrollbar } from '../../scrollbar.js';
import { durationParser, getValidImage, playsParser } from "../../parsers.js";
import { header } from "../header/header.js";
import { sidebar } from "../sidebar/sidebar.js";
import { player } from "../player/player.js";
import { slider } from "../../slider.js";

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

    try {
      const data = await apiServise.getProfilePageData();
      pageData.avatar = getValidImage(data.profile.AvatarURL);
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

    await Promise.all([
      header.render(),
      sidebar.render(),
      player.render(),
    ]);

    slider.sliderFunction();
    this.addEventListeners();
    initPasswordShowing();
    initScrollbar();
  }

  addEventListeners() {
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

    const setAvatarButton = document.getElementById('setAvatarButton');
    if (setAvatarButton) {
      setAvatarButton.addEventListener('click', async (e) => {
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

            avatarContainers.forEach(container => {
                const existingImg = container.querySelector('img');
                if (existingImg) {
                    existingImg.src = newAvatarUrl;
                } else {
                    container.innerHTML = `<img src="${newAvatarUrl}" alt="Ваш аватар" class="profile-image" />`;
                }
            });
        } catch (err) {
            console.error('Ошибка загрузки аватара:', err);
            alert('Не удалось загрузить аватар.');
        }
        });
      });
    }
  }
}
