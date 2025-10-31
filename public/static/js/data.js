const API_BASE_URL = 'http://localhost:8080/api/v1';

export class apiServises {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.csrfToken = null;
  }

  async getCsrfToken() {
    try {
      const response = await this.request('/csrf-token');
      const token = response.token || response.csrfToken;
      this.csrfToken = token;
      console.log('CSRF token fetched and stored:', this.csrfToken);
      return this.csrfToken;
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      this.csrfToken = null;
      throw error;
    }
  }

  async ensureCsrfToken() {
    if (!this.csrfToken) {
      await this.getScrfToken();
    }
  }

  async request(endpoint, options = {}) {
    const isCsrfRequest = endpoint === '/csrf-token';
    const url = `${this.baseURL}${endpoint}`;
    const method = options.method || 'GET';

    if (!['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase()) && !isCsrfRequest) {
      await this.ensureCsrfToken();

      if (this.csrfToken) {
        if (!options.headers) {
          options.headers = {};
        }
        options.headers['X-CSRF-Token'] = this.csrfToken;
      }
    }

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
}

export const apiServise = new apiServises();
