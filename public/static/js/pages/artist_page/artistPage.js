import { router } from '../../routing.js';
import { initScrollbar } from '../../scrollbar.js';

export class ArtistPage {
  playsParser(plays) {
    if (plays > 1_000_000_000) {
      const value = plays / 1_000_000_000;
      plays = (value < 10 ? value.toFixed(1) : value.toFixed(0)).replace('.', ',') + ' млрд';
    } else if (plays > 1_000_000) {
      const value = plays / 1_000_000;
      plays = (value < 10 ? value.toFixed(1) : value.toFixed(0)).replace('.', ',') + ' млн';
    } else if (plays > 1_000) {
      const value = plays / 1_000;
      plays = (value < 10 ? value.toFixed(1) : value.toFixed(0)).replace('.', ',') + ' тыс';
    }

    return plays;
  }

  async render() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      router.navigate('/login');
      return;
    }

    let pageData = {
      isAuthenticated: true,
      albums: [
        {
          name: "Zeit",
          cover: "static/img/test_cover3.jpg",
          year: 2022,
        },
        {
          name: "Rammstein",
          cover: "static/img/test_cover1.jpg",
          year: 2019,
        },
        {
          name: "Liebe ist für ale da",
          cover: "static/img/test_cover4.jpg",
          year: 2009,
        },
        {
          name: "Rosenrot",
          cover: "static/img/test_cover5.jpg",
          year: 2005,
        },
        {
          name: "Reise, reise",
          cover: "static/img/test_cover6.jpg",
          year: 2004,
        },
      ],
      popular_tracks: [
        {
          cover: 'static/img/test_cover.jpg',
          name: 'Sonne',
          performers: ['Rammstein'],
          plays: 727345807,
          album: 'Mutter',
          duration: '4:32',
        },
        {
          cover: 'static/img/test_cover2.jpg',
          name: 'Du hast',
          performers: ['Rammstein'],
          plays: 753636278,
          album: 'Sehnsucht',
          duration: '3:55',
        },
        {
          cover: 'static/img/test_cover1.jpg',
          name: 'Deutschland',
          performers: ['Rammstein'],
          plays: 601994443,
          album: 'Rammstein',
          duration: '5:22',
        },
        {
          cover: 'static/img/test_cover2.jpg',
          name: 'Engel',
          performers: ['Rammstein'],
          plays: 384388389,
          album: 'Sehnsucht',
          duration: '4:24',
        },
        {
          cover: 'static/img/test_cover.jpg',
          name: 'Ich will',
          performers: ['Rammstein'],
          plays: 301004704,
          album: 'Mutter',
          duration: '3:37',
        },
      ],
      singls: [],
      similar_artists: [
        {
          name: "Metallica",
          artist_avatar: "/static/img/test_artist_image.jpg",
          listeners: 30143696,
        }
      ],
      name: 'Rammstein',
      artist_avatar: '/static/img/test_artist_header.jpg',
      listeners: 13267225,
      description: `Rammstein — немецкая метал-группа, образованная в январе 1994 года в Берлине.
              Музыкальный стиль группы относится к жанру индастриал-метала.
              Основные черты творчества группы: специфический ритм, в котором выдержана большая часть композиций, и эпатирующие тексты песен.
              Особую известность группе принесли сценические выступления, часто сопровождаемые использованием пиротехники,
              получившие признание в музыкальной среде. Состав группы ни разу не менялся. По состоянию на 2018 год она продала около 20 млн копий альбомов.`,
    };

    /*try {
      const data = await apiServise.getArtistPageData();
      pageData.artists = (data.artists || []).map((artist) => ({
        id: artist.artist_id,
        name: artist.name,
        image: `static/img/${artist.avatar_url || 'default-artist.png'}`,
      }));
      pageData.albums = (data.albums || []).map((album) => ({
        id: album.album_id,
        name: album.title,
        image: `static/img/${album.avatar_url || 'default-album.png'}`,
        artist: album.artist ? album.artist.name : 'Unknown Artist',
      }));
      pageData.tracks = (data.tracks || []).map((track) => ({
        id: track.track_id,
        name: track.title,
        image: `static/img/${track.album.avatar_url || 'default-album.png'}`,
        artists: track.artists,
      }));
    } catch (error) {
      console.error('Failed to load main page data:', error.message);
      localStorage.removeItem('isAuthenticated');
      router.navigate('/login');
      return;
    }*/

    pageData.popular_tracks = pageData.popular_tracks.map((track) => ({
      ...track,
      plays: this.playsParser(track.plays),
    }));
    pageData.listeners = this.playsParser(pageData.listeners);
    Handlebars.registerHelper('numeration', function (value) {
      return parseInt(value) + 1;
    });
    const contentTemplate = Handlebars.templates['artistPage.hbs'];
    document.getElementById('app').innerHTML = contentTemplate(pageData);

    initScrollbar();
    this.addEventListeners();
  }

  addEventListeners() {
    const showInfoBtn = document.getElementById('showArtistDescription');
    const container = document.querySelector('.artist-container');

    if (showInfoBtn && container) {
      showInfoBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const wrapper = container.querySelector('.artist-description');

        if (container.classList.contains('expanded')) {
          wrapper.style.maxHeight = '35px';
          container.style.minHeight = '450px';
          setTimeout(() => {
            wrapper.style.removeProperty('-webkit-line-clamp');
            wrapper.style.setProperty('-webkit-line-clamp', '2');
            wrapper.style.removeProperty('white-space');
          }, 600);
        } else {
          wrapper.style.setProperty('-webkit-line-clamp', 'unset');
          const newHeight = 450 + wrapper.scrollHeight - 35;
          wrapper.style.maxHeight = wrapper.scrollHeight + 'px';
          container.style.minHeight = newHeight + 'px';
        }

        container.classList.toggle('expanded');
      });
    }
  }
}
