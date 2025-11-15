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
    // console.log(`Success: ${endpoint}`, data);
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

  async getLibraryPageData() {
    try {
      const [albums, playlists, artists, tracks] = [
        // === ALBUMS ===
        [
          {
            id: 1,
            title: 'Город Огней',
            avatar_url: 'city-lights.jpg',
            created_at: '2024-12-01T14:20:00Z',
            type: 'Альбом',
            artists: [{ id: 1, name: 'Александр Волков' }],
          },
          {
            id: 2,
            title: 'Мелодии Севера',
            avatar_url: 'northern-melodies.png',
            created_at: '2025-01-15T10:00:00Z',
            type: 'EP',
            artists: [{ id: 2, name: 'ArcticSound' }],
          },
          {
            id: 3,
            title: 'Вечерние волны',
            avatar_url: 'evening-waves.jpg',
            created_at: '2025-03-20T19:30:00Z',
            type: 'Сингл',
            artists: [{ id: 3, name: 'Luna Waves' }],
          },
        ],

        // === PLAYLISTS ===
        [
          {
            id: 101,
            title: 'Лучшее 2025',
            avatar_url: 'best-2025.jpg',
            created_at: '2025-02-10T08:00:00Z',
            tracks: [
              { id: 1, title: 'Трек 1' },
              { id: 2, title: 'Трек 2' },
              { id: 3, title: 'Трек 3' },
            ],
          },
          {
            id: 102,
            title: 'Утренний Чилл',
            avatar_url: 'morning-chill.jpg',
            created_at: '2025-04-01T11:00:00Z',
            tracks: [
              { id: 4, title: 'Пробуждение' },
              { id: 5, title: 'Солнечный свет' },
            ],
          },
          {
            id: 103,
            title: 'Workout Energy',
            avatar_url: 'workout-energy.png',
            created_at: '2025-05-25T18:45:00Z',
            tracks: [
              { id: 6, title: 'Пульс' },
              { id: 7, title: 'Скорость' },
              { id: 8, title: 'Финиш' },
              { id: 9, title: 'Отдых' },
            ],
          },
        ],

        // === ARTISTS ===
        [
          {
            id: 1,
            name: 'Александр Волков',
            avatar_url: 'alex-volkov.jpg',
            created_at: '2024-11-15T12:00:00Z',
            play_count: 12800,
          },
          {
            id: 2,
            name: 'ArcticSound',
            avatar_url: 'arctic-sound.png',
            created_at: '2024-10-05T09:30:00Z',
            play_count: 5400,
          },
          {
            id: 3,
            name: 'Luna Waves',
            avatar_url: 'luna-waves.jpg',
            created_at: '2025-02-20T17:15:00Z',
            play_count: 9600,
          },
        ],
        // === TRACKS ===
        {
          id: 104,
          tracks: [
            { id: 10, title: 'Класс' },
            { id: 11, title: 'Круто' },
            { id: 12, title: 'Замечательно' },
            { id: 13, title: 'Потрясающе' },
          ],
        },
      ];

      /*await Promise.all([
        this.request(`/library/albums`).catch(() => []),
        this.request(`/library/playlists`).catch(() => []),
        this.request('/library/artists').catch(() => []),
        this.request('/library/tracks').catch(() => []),
      ]);*/

      return {
        albums: albums || [],
        playlists: playlists || [],
        artists: artists || [],
        tracks: tracks || {},
      };
    } catch (error) {
      console.error('Failed to load artist page data:', error);
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
