const API_BASE_URL = 'http://localhost:8080/api/v1';

export class apiServises {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.csrfToken = null;
  }

  async request(endpoint, options = {}) {
    console.log(options);
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
      const [albums, tracks, artists] = await Promise.all([
        this.request('/albums?limit=20').catch(() => []),
        this.request('/tracks?limit=30').catch(() => []),
        this.request('/artists?limit=20').catch(() => [])
      ]);

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

  async getArtistPageData(id) {
    try {
      const [albums, popular_tracks, artist, similar_artists] = await Promise.all([
        this.request(`/artists/${id}/albums`).catch(() => []),
        this.request(`/artists/${id}/tracks?limit=5`).catch(() => []),
        this.request(`/artists/${id}`).catch(() => []),
        this.request('/artists?limit=10').catch(() => [])
      ]);

      return {
        albums: albums || [],
        popular_tracks: popular_tracks || [],
        artist: artist || {},
        similar_artists: similar_artists || []
      };
    } catch (error) {
      console.error('Failed to load artist page data:', error);
      throw error;
    }
  }

  async getProfilePageData() {
    try {
      const [artists, top_tracks] = await Promise.all([
        this.request('/artists?limit=10').catch(() => []),
        this.request(`/tracks?limit=5`).catch(() => []),
      ]);

      return {
        top_artists: artists || [],
        top_tracks: top_tracks || [],
        recent: artists || [],
      };
    } catch (error) {
      console.error('Failed to load profile page data:', error);
      throw error;
    }
  }

  async getProfileData(ID) {
    try {
      console.log(localStorage);
      const [profile, avatar] = await Promise.all([
        this.request('/profile', { method: 'PUT', body: { ID } }).catch(() => []),
        this.request(`/avatar`, { method: 'POST', body: { ID } }).catch(() => []),
      ]);

      console.log(profile, avatar);

      return {
        profile: profile,
        avatar: avatar,
      };
    } catch (error) {
      console.error('Failed to load profile data:', error);
      throw error;
    }
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
}

export const apiServise = new apiServises();
