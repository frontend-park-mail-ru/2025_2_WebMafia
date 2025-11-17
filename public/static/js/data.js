const API_BASE_URL = 'http://localhost:8080/api/v1';
export const API_AVATARS_URL = 'http://217.16.17.173:8099/avatars';
export const API_TRACKS_URL = 'http://217.16.17.173:8099/music/tracks';

export class apiServises {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.csrfToken = null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const isFormData = options.body instanceof FormData;

    const config = {
      method: options.method || 'GET',
      credentials: 'include',
      headers: {
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
      ...options,
    };

    if (options.body) {
      config.body = isFormData ? options.body : JSON.stringify(options.body);
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
    return data;
  }

  async getMainPageData() {
    try {
      const [albums, tracks, artists] = await Promise.all([this.request('/albums?limit=20').catch(() => []), this.request('/tracks?limit=30').catch(() => []), this.request('/artists?limit=20').catch(() => [])]);

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
        this.request(`/artists/${id}/albums?limit=10`).catch(() => []),
        this.request(`/artists/${id}/tracks?limit=5`).catch(() => []),
        this.request(`/artists/${id}`).catch(() => []),
        this.request('/artists?limit=10').catch(() => []),
      ]);

      return {
        albums: albums || [],
        popular_tracks: popular_tracks || [],
        artist: artist || {},
        similar_artists: similar_artists || [],
      };
    } catch (error) {
      console.error('Failed to load artist page data:', error);
      throw error;
    }
  }

  async getArtistAlbums(id) {
    try {
      const [albums, artist] = await Promise.all([this.request(`/artists/${id}/albums`).catch(() => []), this.request(`/artists/${id}`).catch(() => [])]);
      return { albums: albums, artist: artist };
    } catch (error) {
      console.error('Failed to load artist albums page data:', error);
      throw error;
    }
  }

  async getArtistTracks(id) {
    try {
      const [tracks, artist] = await Promise.all([this.request(`/artists/${id}/tracks`).catch(() => []), this.request(`/artists/${id}`).catch(() => [])]);
      return { tracks: tracks, artist: artist };
    } catch (error) {
      console.error('Failed to load artist albums page data:', error);
      throw error;
    }
  }

  async getProfilePageData() {
    try {
      const [artists, top_tracks] = await Promise.all([this.request('/artists?limit=10').catch(() => []), this.request(`/tracks?limit=5`).catch(() => [])]);

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

  async getProfileData() {
    try {
      const profile = await this.request('/me');
      return profile;
    } catch (error) {
      console.error('Failed to load profile data:', error);
      throw error;
    }
  }

  async getCSRFToken() {
    if (this.csrfToken) return this.csrfToken;

    const data = await this.request('/csrf-token');
    this.csrfToken = data.csrf_token;
    return this.csrfToken;
  }

  async loadTrackById(id) {
    if (!id) return null;
    try {
      const track = this.request(`/tracks/${id}`).catch(() => []);
      return track;
    } catch (error) {
      console.error('Failed to load artist page data:', error);
      throw error;
    }
  }

  async uploadAvatar(file) {
    const csrfToken = await this.getCSRFToken();

    const profile = await this.request(`/me`);

    if (profile.AvatarURL) {
      await this.request('/avatar', {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      });
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const data = await this.request('/avatar', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken,
      },
      body: formData,
    });

    return data;
  }

  async deleteAvatar() {
    try {
      const csrfToken = await this.getCSRFToken();
      return await this.request('/avatar', {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      });
    } catch (error) {
      console.error('Ошибка при удалении аватара:', error);
      throw error;
    }
  }

  async getAlbumPageData(id) {
    try {
      const [album, tracks] = await Promise.all([this.request(`/albums/${id}`).catch(() => []), this.request(`/albums/${id}/tracks`).catch(() => [])]);
      return { album: album || {}, tracks: tracks || [] };
    } catch (error) {
      console.error('Failed to load album page data:', error);
      throw error;
    }
  }

  async getPlaylistPageData(id) {
    try {
      const [/*playlist, tracks, */profile] = await Promise.all([
        /*this.request(`/playlist/${id}`).catch(() => []),
        this.request(`/playlist/${id}/tracks`).catch(() => []),*/
        this.request('/me'),
      ]);
      const playlist = {
        "id": 42,
        "title": "Midnight Chill Vibes",
        "created_at": "2024-03-15T12:00:00.000Z",
        "avatar_url": "",
        "description": "Коллекция атмосферных треков для позднего вечера."
      };
      const tracks = [
        {
          "id": 101,
          "title": "Night Breeze",
          "play_count": 1234,
          "duration_s": 204,
          "album": {
            "id": 3,
            "title": "Night Compilation"
          },
          "artists": [
            {
              "id": 7,
              "name": "Luma Drift"
            }
          ]
        },
        {
          "id": 102,
          "title": "Soft Neon Lights",
          "play_count": 842,
          "duration_s": 250,
          "album": {
            "id": 3,
            "title": "Night Compilation"
          },
          "artists": [
            {
              "id": 7,
              "name": "Luma Drift"
            },
            {
              "id": 9,
              "name": "Synthia Waves"
            }
          ]
        },
        {
          "id": 103,
          "title": "Moonflow",
          "play_count": 2100,
          "duration_s": 178,
          "album": {
            "id": 8,
            "title": "Moon Echoes"
          },
          "artists": [
            {
              "id": 12,
              "name": "Echo Pulse"
            }
          ]
        }
      ]
      return { playlist: playlist || {}, tracks: tracks || [], profile: profile || {} };
    } catch (error) {
      console.error('Failed to load playlist page data:', error);
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

  async editUser(login, email, password) {
    return this.request('/profile', {
      method: 'PUT',
      body: { login, email, password },
    });
  }

  async logoutUser() {
    const csrfToken = await this.getCSRFToken();
    return this.request('/logout', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken,
      },
    });
  }

  async incrementTrackListenCount(trackId) {
    if (!trackId) return;
    const csrfToken = await this.getCSRFToken();
    try {
      await this.request(`/tracks/${trackId}/listen`, {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      });
    } catch (error) {
      console.error(`Failed to increment listen count for track ${trackId}:`, error);
    }
  }
}

export const apiServise = new apiServises();
