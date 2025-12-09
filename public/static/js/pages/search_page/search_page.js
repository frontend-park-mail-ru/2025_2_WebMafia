import { initScrollbar } from '@/scrollbar.js';
import { router } from '@/routing.js';
import { apiServise } from '@/data.js';
import { durationParser, getValidImage, playsParser } from '@/parsers.js';
import { header } from '@/components/header/header.js';
import { sidebar } from '@/components/sidebar/sidebar.js';
import { slider } from '@/slider.js';
import { playTrack } from '@/playTrackBtn.js';
import { setPlayButtonsOnAuth } from '@/setPlayButtonsOnAuth.js';
import { playerOnlyOnPlay } from '@/playerOnlyOnplay.js';
import { likeTrackBtn } from '@/utils/likeTrack';
import { createPlaylis } from '@/utils/initCreatePlaylist';

export class SearchPage {
  async render(name) {
    const decodedName = decodeURIComponent(name);
    let pageData = {
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
      best_result: [],
      albums: [],
      tracks: [],
      singls: [],
      artists: [],
      artist_id: '',
      titleName: decodedName,
    };

    const contentTemplateWithoutData = Handlebars.templates['search_page.hbs'];
    document.getElementById('app').innerHTML = contentTemplateWithoutData(pageData);
    document.querySelector('head title').textContent = 'Wave music';
    await Promise.all([header.render(), sidebar.render()]);

    try {
      const [searchTracktData, searchAlbumData, searchArtistData] = await Promise.all([
        apiServise.searchTrack(name, pageData.isAuthenticated),
        apiServise.searchAlbum(name),
        apiServise.searchArtist(name),
      ]);
      pageData.artists = (searchArtistData || []).map((artist) => ({
        id: artist.id,
        name: artist.name,
        listeners: playsParser(artist.play_count || 0),
        image: getValidImage('artists/' + artist.avatar_url, 'default-artist.png'),
        type: 'Артист',
      }));
      pageData.albums = (searchAlbumData || []).map((album) => ({
        id: album.id,
        name: album.title,
        image: getValidImage('albums/' + album.avatar_url, 'default-album.png'),
        artist: album.artists ? album.artists[0].name : 'Unknown Artist',
        artist_id: album.artists?.[0].id,
        type: album.type,
      }));
      pageData.tracks = (searchTracktData || []).map((track) => ({
        id: track.id,
        name: track.title,
        album_id: track.album.id,
        duration: durationParser(track.duration_s),
        image: getValidImage('albums/' + track.album.avatar_url, 'default-album.png'),
        artist: track.artists ? track.artists[0].name : 'Unknown Artist',
        artist_id: track.album.artists?.[0].id,
        type: 'Трек',
        is_liked: track.is_liked,
      }));

      if (pageData.artists.length > 0) {
        pageData.best_result = pageData.artists[0];
      } else if (pageData.albums.length > 0) {
        pageData.best_result = pageData.albums[0];
      } else if (pageData.tracks.length > 0) {
        pageData.best_result = pageData.tracks[0];
      }
    } catch (error) {
      console.error('Failed to load search page data:', error);
    }

    const contentTemplate = Handlebars.templates['search_page.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);
    document.querySelector('head title').textContent = pageData.titleName;
    const searchValue = pageData.titleName;
    playerOnlyOnPlay();
    await Promise.all([header.render(searchValue), sidebar.render()]);

    const searchInput = document.getElementById('searchInput');
    searchInput.value = decodedName;

    slider.sliderFunction();
    initScrollbar();
    this.addEventListeners();
    setPlayButtonsOnAuth();
    likeTrackBtn();
    createPlaylis();
    playTrack();
  }

  addEventListeners() {
    document.querySelectorAll('.click-event-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('a')) {
          router.navigate(card.dataset.href);
        }
      });
    });
  }
}
