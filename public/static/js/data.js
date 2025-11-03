const API_BASE_URL = 'http://localhost:8080/api/v1';

export class apiServises {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.csrfToken = null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      method: options.method || 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    if (response.status === 204 || response.headers.get('Content-Length') === '0') {
      return null;
    }

    const data = await response.json();
    console.log(`Success: ${endpoint}`, data);
    return data;
  }

  async getMainPageData() {
    try {
      const [albums, tracks, artists] = await Promise.all([this.request('/albums').catch(() => []), this.request('/tracks').catch(() => []), this.request('/artists').catch(() => [])]);

      return {
        albums: albums || [],
        tracks: tracks || [],
        artists: artists || [],
      };
    } catch (error) {
      console.error('Failed to load main page data:', error);
      throw error;
    }
  }

  async getProfilePageData() {
    return this.request('/profile');
  }

  async loginUser(login, password) {
    return this.request('/login', {
      method: 'POST',
      body: { login, password },
    });
  }

  async registerUser(login, email, password) {
    return this.request('/register', {
      method: 'POST',
      body: { login, email, password },
    });
  }

  async logoutUser() {
    return this.request('/logout', {
      method: 'POST',
    });
  }

  async loadtrack() {
    return {
      track: {
        title: 'Японский сэмпл',
        id: '1',
        imageUrl: 'image1.jpg',
        fileName: 'японский сэмпл 128 бпм.mp3',
        artist: 'Неизвестный исполнитель',
        duration: 185,
        durationFormatted: '3:05',
      },
    };
  }

  async getArtistAlbums(artistId) {
    return {
      artistName: 'Rammstein',
      albums: [
        { id: 1, name: 'Zeit', year: 2022, image: 'static/img/test_cover3.jpg' },
        { id: 2, name: 'Rammstein', year: 2019, image: 'static/img/test_cover1.jpg' },
        { id: 3, name: 'Liebe ist für alle da', year: 2009, image: 'static/img/test_cover4.jpg' },
        { id: 4, name: 'Rosenrot', year: 2005, image: 'static/img/test_cover5.jpg' },
        { id: 5, name: 'Reise, Reise', year: 2004, image: 'static/img/test_cover6.jpg' },
        { id: 6, name: 'Mutter', year: 2001, image: 'static/img/test_cover.jpg' },
        { id: 7, name: 'Sehnsucht', year: 1997, image: 'static/img/test_cover2.jpg' },
      ],
    };
  }

  async getArtistTracks(artistId) {
    return {
      artistName: 'Rammstein',
      tracks: [
        { cover: 'static/img/test_cover.jpg', name: 'Sonne', plays: '727 млн', album: 'Mutter', duration: '4:32' },
        { cover: 'static/img/test_cover2.jpg', name: 'Du hast', plays: '753 млн', album: 'Sehnsucht', duration: '3:55' },
        { cover: 'static/img/test_cover1.jpg', name: 'Deutschland', plays: '601 млн', album: 'Rammstein', duration: '5:22' },
        { cover: 'static/img/test_cover2.jpg', name: 'Engel', plays: '384 млн', album: 'Sehnsucht', duration: '4:24' },
        { cover: 'static/img/test_cover.jpg', name: 'Ich will', plays: '301 млн', album: 'Mutter', duration: '3:37' },
        { cover: 'static/img/test_cover4.jpg', name: 'Pussy', plays: '250 млн', album: 'Liebe ist für alle da', duration: '3:59' },
        { cover: 'static/img/test_cover5.jpg', name: 'Benzin', plays: '180 млн', album: 'Rosenrot', duration: '3:46' },
      ],
    };
  }
}

export const apiServise = new apiServises();
