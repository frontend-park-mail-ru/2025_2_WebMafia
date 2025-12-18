import { router } from '@/routing';
import { apiServise } from '@/data';
import { scrollbar } from '@/utils/scrollbar';
import { durationParser, getValidImage, playsParser } from '@/utils/parsers.ts';
import { slider } from '@/utils/slider';
import { setPlayButtonsOnAuth } from '@/setPlayButtonsOnAuth.js';
import { playerOnlyOnPlay } from '@/playerOnlyOnplay.js';
import { playTrack } from '@/playTrackBtn.js';
import { likeTrackBtn } from '@/utils/likeTrack.js';
import { setupMarquees } from '@/utils/marquee';
import { images } from '@/assets';
import { BasePage } from '@/pages/base/basePage.ts';
import { ProfileModalData, profileModal } from '@/components/modal/profileModal.ts';
import { Artist, Track } from '@/models.ts';

interface ProfilePageData {
  isAuthenticated: boolean;
  profile?: { nickname: string; email: string; avatar: string | null; letter: string };
  top_artists: Array<{ id: string; name: string; listeners: string; image: string }>;
  top_tracks: Array<any>;
  recent: Array<{ id: string; name: string; listeners: string; image: string }>;
}

export class ProfilePage extends BasePage {
  private currentProfileData: ProfileModalData | null = null;

  protected async renderContent(contentContainer: HTMLElement) {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const pageData: ProfilePageData = {
      isAuthenticated,
      top_artists: [],
      top_tracks: [],
      recent: [],
    };

    const contentTemplate = Handlebars.templates['profilePage.hbs'];
    contentContainer.innerHTML = contentTemplate(pageData);
    const titleEl = document.querySelector('head title');
    if (titleEl) titleEl.textContent = 'Wave Music';

    if (!isAuthenticated) return;

    try {
      const [data, profile] = await Promise.all([apiServise.getProfilePageData(), apiServise.getProfileData()]);
      this.currentProfileData = {
        nickname: profile.Login,
        email: profile.Email,
        avatar: profile.AvatarURL ? getValidImage(profile.AvatarURL) : null,
        letter: profile.Login ? profile.Login[0].toUpperCase() : '?',
      };
      pageData.profile = { ...this.currentProfileData };
      pageData.top_artists = (data.top_artists || []).map((artist: Artist) => ({
        id: artist.id,
        name: artist.name,
        listeners: playsParser(artist.play_count || 0),
        image: getValidImage(`artists/${artist.avatar_url}`, images.defaultArtistPath),
      }));
      pageData.top_tracks = (data.top_tracks || []).map((track: Track) => ({
        id: track.id,
        name: track.title,
        plays: playsParser(track.play_count || 0),
        album: track.album.title,
        album_id: track.album.id,
        duration: durationParser(track.duration_s),
        cover: getValidImage(`albums/${track.album?.avatar_url}`, images.defaultAlbumPath),
        artists: track.artists,
        is_liked: track.is_liked,
      }));
      pageData.recent = (data.recent || []).map((artist: Artist) => ({
        id: artist.id,
        name: artist.name,
        listeners: playsParser(artist.play_count || 0),
        image: getValidImage(`artists/${artist.avatar_url}`, images.defaultArtistPath),
      }));
    } catch (error) {
      console.error('Failed to load profile page data:', error);
      localStorage.removeItem('isAuthenticated');
      router.navigate('/');
      return;
    }

    contentContainer.innerHTML = contentTemplate(pageData);
    if (pageData.profile.nickname && titleEl) {
      titleEl.textContent = pageData.profile.nickname;
    }

    this.initComponents();
  }

  private initComponents() {
    playerOnlyOnPlay();
    slider.init();
    scrollbar.init();
    setPlayButtonsOnAuth();
    likeTrackBtn();
    playTrack();
    setupMarquees();

    this.initEditButton();
  }

  private initEditButton() {
    const editProfileButton = document.getElementById('editProfileBtn');

    if (editProfileButton && this.currentProfileData) {
      editProfileButton.addEventListener('click', (e) => {
        e.preventDefault();

        if (this.currentProfileData) {
          profileModal.open(this.currentProfileData, (newData) => {
            this.handleProfileUpdate(newData);
          });
        }
      });
    }
  }

  private handleProfileUpdate(newData: ProfileModalData) {
    this.currentProfileData = newData;

    const profileUsername = document.querySelectorAll('.profile-username');
    profileUsername.forEach((el) => (el.textContent = newData.nickname));

    const headerUsername = document.querySelector('.header-username');
    if (headerUsername) headerUsername.textContent = newData.nickname;

    const profileAvatarContainer = document.getElementById('avatarProfileContainer');
    if (profileAvatarContainer) {
      this.renderAvatar(profileAvatarContainer, newData, 'default-avatar-profile');
    }

    const headerAvatarContainer = document.getElementById('avatarHeaderContainer');
    if (headerAvatarContainer) {
      this.renderAvatar(headerAvatarContainer, newData, 'default-avatar-header');
    }

    document.querySelector('head title')!.textContent = newData.nickname;
    setupMarquees();
  }

  private renderAvatar(container: HTMLElement, data: ProfileModalData, defaultClass: string) {
    container.innerHTML = '';

    if (data.avatar) {
      const img = document.createElement('img');
      img.src = data.avatar;
      img.alt = 'Ваш аватар';
      img.className = 'profile-image';
      container.appendChild(img);
    } else {
      const div = document.createElement('div');
      div.className = `default-avatar ${defaultClass}`;
      div.textContent = data.letter;
      container.appendChild(div);
    }
  }
}
