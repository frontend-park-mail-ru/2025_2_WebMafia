import { apiServise } from '@/data.js';
import { router } from '@/routing.js';
import { header } from '@/components/header/header.js';
import { sidebar } from '@/components/sidebar/sidebar.js';
import { initScrollbar } from '@/scrollbar.js';
import { durationParser, getValidImage, playsParser } from '@/parsers.js';
import { playTrack } from '@/playTrackBtn.js';
import { playerOnlyOnPlay } from '@/playerOnlyOnplay.js';
import { setPlayButtonsOnAuth } from '@/setPlayButtonsOnAuth.js';
import { likeTrackBtn } from '@/utils/likeTrack.js';
import { createPlaylis } from '@/utils/initCreatePlaylist';

export class ArtistTracksPage {
  async render(artistId) {
    let pageData = {
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
      tracks: [],
      artistName: '',
      artistId: '',
    };

    const contentTemplate = Handlebars.templates['artistTracksPage.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);

    try {
      const data = await apiServise.getArtistTracks(artistId);
      if (data) {
        pageData.artistName = data.artist.name;
        pageData.artistId = data.artist.id;
        pageData.tracks = data.tracks.map((track) => ({
          id: track.id,
          name: track.title,
          plays: playsParser(track.play_count) || 0,
          album: track.album.title,
          album_id: track.album.id,
          duration: durationParser(track.duration_s),
          cover: getValidImage('albums/' + track.album.avatar_url, 'default-album.png'),
          artists: track.artists,
          is_liked: track.is_liked,
        }));
      }
    } catch (error) {
      console.error('Failed to load artist tracks page data:', error);

      if (error.response && error.response.status === 404) {
        router.navigate('/not-found');
        return;
      }

      if (error.message && error.message.includes('Network')) {
        alert('Проблема с подключением. Попробуйте позже.');
        return;
      }

      alert('Не удалось загрузить страницу треков исполнителя.');
      return;
    }

    document.getElementById('app').innerHTML = contentTemplate(pageData);
    playerOnlyOnPlay();
    await Promise.all([header.render(), sidebar.render()]);
    createPlaylis();
    setPlayButtonsOnAuth();
    initScrollbar();
    likeTrackBtn();
    playTrack();
  }
}
