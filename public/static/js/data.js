const API_BASE_URL = 'http://localhost:8080/api/v1';
const API_Data_URL = 'http://localhost:8081/api/v1';
const API_PLAYLIST_URL = 'http://localhost:8082/api/v1';
export const API_AVATARS_URL = 'http://217.16.17.173:8099/avatars';
export const API_TRACKS_URL = 'http://217.16.17.173:8099/music/tracks';

export class apiServises {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.dataURL = API_Data_URL;
    this.playlistURL = API_PLAYLIST_URL;
    this.csrfToken = null;
    this.userRoutes = ['/login', '/register', '/csrf-token', '/logout', '/avatar', '/profile', '/me'];
    this.tracksArtistAlbumRoutes = [
      '/artists/search',
      '/artists',
      '/artists/:id',
      '/albums/search',
      '/albums',
      '/albums/:id',
      '/artists/:id/albums',
      '/tracks/search',
      '/tracks',
      '/tracks/:id',
      '/artists/:id/tracks',
      '/albums/:id/tracks',
      '/genres/:id/tracks',
      '/tracks/:id/listen',
    ];
    this.playlistRoutes = [
      '/playlists/favorite',
      '/playlists/favorite/add-track',
      '/playlists/:id',
      '/users/:id/playlists',
      '/playlists',
      '/playlists/:id',
      '/playlists/:id',
      '/playlists/:id/avatar',
      '/playlists/:id/avatar',
      '/playlists/my',
      '/playlists/:id/tracks',
      '/playlists/:id/tracks',
    ];
    this.PlaylistId = null;
  }

  async request(endpoint, options = {}) {
    let url = '';
    const endpointWithoutQuery = endpoint.split('?')[0];
    const endpointPattern = endpointWithoutQuery.replace(/[a-fA-F0-9-]{36}/g, ':id');

    if (this.userRoutes.includes(endpointPattern)) {
      url = `${this.baseURL}${endpoint}`;
    } else if (this.tracksArtistAlbumRoutes.includes(endpointPattern)) {
      url = `${this.dataURL}${endpoint}`;
    } else if (this.playlistRoutes.includes(endpointPattern)) {
      url = `${this.playlistURL}${endpoint}`;
    } else {
      console.warn(`Роут ${endpoint} не найден в доступных маршрутах`);
      throw new Error(`Unknown route: ${endpoint}`);
    }
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
      const [albums, tracks, artists] = await Promise.all([
        this.request('/albums?limit=20').catch(() => []),
        this.request('/tracks?limit=30').catch(() => []),
        this.request('/artists?limit=20').catch(() => []),
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
      const [albums, popular_tracks, artist, similar_artists, favorite_tracks] = await Promise.all([
        this.request(`/artists/${id}/albums?limit=10`).catch(() => []),
        this.request(`/artists/${id}/tracks?limit=5`).catch(() => []),
        this.request(`/artists/${id}`).catch(() => []),
        this.request('/artists?limit=10').catch(() => []),
        this.getFavoriteTrackIds().catch(() => []),
      ]);

      const popular_tracks_with_likes = (popular_tracks || []).map((track) => ({
        ...track,
        is_liked: favorite_tracks.includes(track.id),
      }));

      return {
        albums: albums || [],
        popular_tracks: popular_tracks_with_likes || [],
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
      const [albums, artist] = await Promise.all([
        this.request(`/artists/${id}/albums`).catch(() => []),
        this.request(`/artists/${id}`).catch(() => []),
      ]);
      return { albums: albums, artist: artist };
    } catch (error) {
      console.error('Failed to load artist albums page data:', error);
      throw error;
    }
  }

  async getArtistTracks(id) {
    try {
      const [tracks, artist, favorite_tracks] = await Promise.all([
        this.request(`/artists/${id}/tracks`).catch(() => []),
        this.request(`/artists/${id}`).catch(() => []),
        this.getFavoriteTrackIds().catch(() => []),
      ]);
      const tracks_with_likes = (tracks || []).map((track) => ({
        ...track,
        is_liked: favorite_tracks.includes(track.id),
      }));
      return { tracks: tracks_with_likes, artist: artist };
    } catch (error) {
      console.error('Failed to load artist albums page data:', error);
      throw error;
    }
  }

  async getProfilePageData() {
    try {
      const [artists, top_tracks, favorite_tracks] = await Promise.all([
        this.request('/artists?limit=10').catch(() => []),
        this.request(`/tracks?limit=5`).catch(() => []),
        this.getFavoriteTrackIds().catch(() => []),
      ]);

      const tracks_with_likes = (top_tracks || []).map((track) => ({
        ...track,
        is_liked: favorite_tracks.includes(track.id),
      }));

      return {
        top_artists: artists || [],
        top_tracks: tracks_with_likes || [],
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

  async uploadPlaylistAvatar(file, id) {
    /*const csrfToken = await this.getCSRFToken();

    const playlist = await this.request(`/playlist/${id}`);

    if (playlist.AvatarURL) {
      await this.request(`/playlist/${id}/avatar`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      });
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const data = await this.request(`/playlist/${id}/avatar`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken,
      },
      body: formData,
    });

    return data;*/
  }

  async createPlaylist(title, description) {
    /*const csrfToken = await this.getCSRFToken();

    return this.request('/create_playlist', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken,
      },
      body: { title, description },
    });*/
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
      const [album, tracks, favorite_tracks] = await Promise.all([
        this.request(`/albums/${id}`).catch(() => []),
        this.request(`/albums/${id}/tracks`).catch(() => []),
        this.getFavoriteTrackIds().catch(() => []),
      ]);

      const tracks_with_likes = (tracks || []).map((track) => ({
        ...track,
        is_liked: favorite_tracks.includes(track.id),
      }));

      return { album: album || {}, tracks: tracks_with_likes || [] };
    } catch (error) {
      console.error('Failed to load album page data:', error);
      throw error;
    }
  }

  async getPlaylistPageData(id) {
    try {
      /*const [playlist, tracks] = await Promise.all([
        this.request(`/library/playlists/${id}`).catch(() => []),
        this.request(`/library/playlists/${id}/tracks`).catch(() => []),
      ]);*/
      const playlist = {
        id: 42,
        title: 'Midnight Chill Vibes',
        created_at: '2024-03-15T12:00:00.000Z',
        avatar_url: '',
        description: 'Коллекция атмосферных треков для позднего вечера.',
      };
      const tracks = [
        {
          id: 101,
          title: 'Night Breeze',
          play_count: 1234,
          duration_s: 204,
          album: {
            id: 3,
            title: 'Night Compilation',
          },
          artists: [
            {
              id: 7,
              name: 'Luma Drift',
            },
          ],
        },
        {
          id: 102,
          title: 'Soft Neon Lights',
          play_count: 842,
          duration_s: 250,
          album: {
            id: 3,
            title: 'Night Compilation',
          },
          artists: [
            {
              id: 7,
              name: 'Luma Drift',
            },
            {
              id: 9,
              name: 'Synthia Waves',
            },
          ],
        },
        {
          id: 103,
          title: 'Moonflow',
          play_count: 2100,
          duration_s: 178,
          album: {
            id: 8,
            title: 'Moon Echoes',
          },
          artists: [
            {
              id: 12,
              name: 'Echo Pulse',
            },
          ],
        },
      ];
      return { playlist: playlist || {}, tracks: tracks || [] };
    } catch (error) {
      console.error('Failed to load playlist page data:', error);
      throw error;
    }
  }

  async getLibraryPageData() {
    try {
      const [albums, playlists, artists, tracks] = await Promise.all([
        // this.request(`/library/albums`).catch(() => []),
        this.request(`/playlists/my`).catch(() => []),
        // this.request('/library/artists').catch(() => []),
        this.request('/playlists/favorite').catch(() => []),
      ]);

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

  async getFavoriteTrackIds() {
    try {
      const favoriteTracks = await this.request('/playlists/favorite');
      console.log(favoriteTracks);
      return favoriteTracks.tracks;
    } catch (error) {
      console.error('Failed to load favorite tracks:', error);
      return [];
    }
  }

  async getPlaylist() {
    if (this.PlaylistId) {
      return this.PlaylistId;
    }
    try {
      const allPlaylists = await this.request('/playlists/my');
      const favoritePlaylist = allPlaylists.find((p) => p.is_favorite === true);

      if (favoritePlaylist && favoritePlaylist.id) {
        this.PlaylistId = favoritePlaylist.id;
        return this.PlaylistId;
      }
    } catch (error) {
      console.error('Failed to load favorite tracks:', error);
      return [];
    }
  }

  async likeTrack(track_Id) {
    if (!track_Id) return;
    try {
      await this.request('/playlists/favorite/add-track', {
        method: 'POST',
        body: { track_Id },
      });
    } catch (error) {
      console.error(`Failed to like track ${track_Id}:`, error);
    }
  }

  async unLikeTrack(track_Id) {
    const playlist_id = await this.getPlaylist();
    try {
      await this.request(`/playlists/${playlist_id}/tracks`, {
        method: 'DELETE',
        body: { track_Id },
      });
    } catch (error) {
      console.error(`Failed to unlike track`, error);
    }
  }

  async searchTrack(name) {
    const [tracks, favorite_tracks] = await Promise.all([
      this.request(`/tracks/search?q=${name}&limit=5`).catch(() => []),
      this.getFavoriteTrackIds().catch(() => []),
    ]);
    const tracks_with_likes = (tracks || []).map((track) => ({
      ...track,
      is_liked: favorite_tracks.includes(track.id),
    }));
    return tracks_with_likes;
  }

  async searchAlbum(name) {
    const album = this.request(`/albums/search?q=${name}&limit=5`).catch(() => []);
    return album;
  }

  async searchArtist(name) {
    const artist = this.request(`/artists/search?q=${name}&limit=5`).catch(() => []);
    return artist;
  }
}

export const apiServise = new apiServises();
