import { router } from '../../routing.js';
import { initScrollbar } from '../../scrollbar.js';
import { apiServise } from '../../data.js';
import { durationParser, getValidImage, playsParser } from '../../parsers.js';
import { header } from '../header/header.js';
import { sidebar } from '../sidebar/sidebar.js';
import { slider } from '../../slider.js';
import { playTrack } from '../../playTrackBtn.js';
import { setPlayButtonsOnAuth } from '../../setPlayButtonsOnAuth.js';
import { playerOnlyOnPlay } from '../../playerOnlyOnplay.js';

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

    try {
      const [searchTracktData, searchAlbumData, searchArtistData] = await Promise.all([apiServise.searchTrack(name), apiServise.searchAlbum(name), apiServise.searchArtist(name)]);
      console.log(searchTracktData, searchAlbumData, searchArtistData);
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
        type: 'Трэк',
      }));
      console.log(pageData, 'pagedata');

      if (pageData.artists.length > 0) {
        pageData.best_result = pageData.artists;
      } else if (pageData.albums.length > 0) {
        pageData.best_result = pageData.albums;
      } else if (pageData.tracks.length > 0) {
        pageData.best_result = pageData.tracks;
      }

      // pageData.titleName = pageData.best_result[0].name;
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

    if (searchInput && searchInput.value) {
      searchInput.classList.add('is-highlighted');
    }

    slider.sliderFunction();
    initScrollbar();
    this.addEventListeners();
    setPlayButtonsOnAuth();
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
