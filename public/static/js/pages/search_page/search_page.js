import { initScrollbar } from '@/scrollbar.js';
import { apiServise } from '@/data.js';
import { getValidImage, playsParser } from '@/parsers.js';
import { header } from '@/components/header/header.js';
import { sidebar } from '@/components/sidebar/sidebar.js';
import { slider } from '@/slider.js';
import { playTrack } from '@/playTrackBtn.js';
import { setPlayButtonsOnAuth } from '@/setPlayButtonsOnAuth.js';
import { playerOnlyOnPlay } from '@/playerOnlyOnplay.js';

export class SearchPage {
  async render() {
    let pageData = {
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
      best_result: [],
      albums: [],
      tracks: [],
      singls: [],
      artists: [],
    };

    const contentTemplateWithoutData = Handlebars.templates['search_page.hbs'];
    document.getElementById('app').innerHTML = contentTemplateWithoutData(pageData);
    document.querySelector('head title').textContent = 'Wave music';

    try {
      const data = await apiServise.getMainPageData();
      pageData.artists = (data.artists || []).map((artist) => ({
        id: artist.id,
        name: artist.name,
        listeners: playsParser(artist.play_count || 0),
        image: getValidImage('artists/' + artist.avatar_url, 'default-artist.png'),
      }));
      pageData.albums = (data.albums || []).map((album) => ({
        id: album.id,
        name: album.title,
        image: getValidImage('albums/' + album.avatar_url, 'default-album.png'),
        artist: album.artists ? album.artists[0].name : 'Unknown Artist',
        artist_id: album.artists?.[0].id,
        type: album.type,
      }));
    } catch (error) {
      console.error('Failed to load search page data:', error);
    }

    const contentTemplate = Handlebars.templates['search_page.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);
    // document.querySelector('head title').textContent = pageData.name;
    playerOnlyOnPlay();
    await Promise.all([header.render(), sidebar.render()]);

    slider.sliderFunction();
    initScrollbar();
    setPlayButtonsOnAuth();
    playTrack();
  }
}
