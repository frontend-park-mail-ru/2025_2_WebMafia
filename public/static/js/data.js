export const API_AVATARS_URL = 'https://wave-music.ru/avatars';
export const API_TRACKS_URL = `https://wave-music.ru/music/tracks`;
import { userRoutes, tracksArtistAlbumRoutes, playlistRoutes } from '@/devRoutesConfig.js';

export class apiServises {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL;
    this.dataURL = import.meta.env.VITE_API_DATA_URL;
    this.playlistURL = import.meta.env.VITE_API_PLAYLIST_URL;
    this.csrfToken = null;
    this.PlaylistId = null;

    this.userRoutes = [];
    this.tracksArtistAlbumRoutes = [];
    this.playlistRoutes = [];

    if (import.meta.env.DEV) {
      this.userRoutes = userRoutes;
      this.tracksArtistAlbumRoutes = tracksArtistAlbumRoutes;
      this.playlistRoutes = playlistRoutes;
    }
  }

  async request(endpoint, options = {}) {
    let url = '';

    if (import.meta.env.DEV) {
      const endpointWithoutQuery = endpoint.split('?')[0];
      const endpointPattern = endpointWithoutQuery.replace(/[a-fA-F0-9-]{36}/g, ':id');

      if (this.userRoutes.includes(endpointPattern)) {
        url = `${this.baseURL}${endpoint}`;
      } else if (this.tracksArtistAlbumRoutes.includes(endpointPattern)) {
        url = `${this.dataURL}${endpoint}`;
      } else if (this.playlistRoutes.includes(endpointPattern)) {
        url = `${this.playlistURL}${endpoint}`;
      } else {
        console.warn(`Роут ${endpoint} не найден в доступных маршрутах (DEV mode)`);
        throw new Error(`Unknown route: ${endpoint}`);
      }
    } else {
      url = `${this.baseURL}${endpoint}`;
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

  async getArtistPageData(id, isAuthenticated) {
    try {
      const [albums, popular_tracks, artist, similar_artists] = await Promise.all([
        this.request(`/artists/${id}/albums?limit=10`).catch(() => []),
        this.request(`/artists/${id}/tracks?limit=5`).catch(() => []),
        this.request(`/artists/${id}`).catch(() => []),
        this.request('/artists?limit=10').catch(() => []),
      ]);

      const result = {
        albums: albums || [],
        popular_tracks: popular_tracks || [],
        artist: artist || {},
        similar_artists: similar_artists || [],
      };

      if (!isAuthenticated) return result;

      const [favorite_tracks, favorite_artists] = await Promise.all([
        this.getFavoriteTrackIds(),
        this.request('/favorite/artists').catch(() => []),
      ]);

      const subscribedArtistIds = new Set(favorite_artists.map((a) => a.id));
      result.artist.isSubscribed = subscribedArtistIds.has(artist.id);

      if (favorite_tracks) {
        result.popular_tracks = (popular_tracks || []).map((track) => ({
          ...track,
          is_liked: favorite_tracks.has(track.id),
        }));
      }

      return result;
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

  async getArtistTracks(id, isAuthenticated) {
    try {
      const [tracks, artist] = await Promise.all([
        this.request(`/artists/${id}/tracks`).catch(() => []),
        this.request(`/artists/${id}`).catch(() => []),
      ]);

      const result = { tracks: tracks || [], artist: artist || {} };
      if (!isAuthenticated) return result;

      const likedTrackIds = await this.getFavoriteTrackIds();

      if (likedTrackIds) {
        result.tracks = (tracks || []).map((track) => ({
          ...track,
          is_liked: likedTrackIds.has(track.id),
        }));
      }
      return result;
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
        this.getFavoriteTrackIds(),
      ]);

      const result = {
        top_artists: artists || [],
        top_tracks: top_tracks || [],
        recent: artists || [],
      };

      if (favorite_tracks) {
        result.top_tracks = (top_tracks || []).map((track) => ({
          ...track,
          is_liked: favorite_tracks.has(track.id),
        }));
      }

      return result;
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
      const track = await this.request(`/tracks/${id}`).catch(() => []);

      const likedTrackIds = await this.getFavoriteTrackIds();
      if (likedTrackIds) track.is_liked = likedTrackIds.has(track.id);

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

  async updatePlaylist(title, description, playlistId) {
    const csrfToken = await this.getCSRFToken();

    return this.request(`/playlists/${playlistId}`, {
      method: 'PUT',
      body: { title, description },
      headers: {
        'X-CSRF-Token': csrfToken,
      },
    });
  }

  async deletePlaylistAvatar(playlistId) {
    try {
      const csrfToken = await this.getCSRFToken();
      return await this.request(`/playlists/${playlistId}/avatar`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      });
    } catch (error) {
      console.error('Ошибка при удалении аватара плейлиста:', error);
      throw error;
    }
  }

  async uploadPlaylistAvatar(file, id) {
    const csrfToken = await this.getCSRFToken();

    const playlist = await this.request(`/playlists/${id}`).catch(() => []);

    if (playlist.avatar_url) {
      await this.request(`/playlists/${id}/avatar`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      });
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const data = await this.request(`/playlists/${id}/avatar`, {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRF-Token': csrfToken,
      },
    });

    return data;
  }

  async createPlaylist(title, description) {
    const csrfToken = await this.getCSRFToken();

    return this.request('/playlists', {
      method: 'POST',
      body: { title, description },
      headers: {
        'X-CSRF-Token': csrfToken,
      },
    });
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

  async getAlbumPageData(id, isAuthenticated) {
    try {
      const [album, tracks] = await Promise.all([
        this.request(`/albums/${id}`).catch(() => []),
        this.request(`/albums/${id}/tracks`).catch(() => []),
      ]);

      const result = { album: album || {}, tracks: tracks || [] };

      if (!isAuthenticated) return result;

      const [favorite_tracks, favorite_albums] = await Promise.all([
        this.getFavoriteTrackIds(),
        this.request('/favorite/albums').catch(() => []),
      ]);

      const subscribedAlbumsIds = new Set(favorite_albums.map((a) => a.id));
      result.album.is_liked = subscribedAlbumsIds.has(album.id);

      if (favorite_tracks) {
        result.tracks = (tracks || []).map((track) => ({
          ...track,
          is_liked: favorite_tracks.has(track.id),
        }));
      }

      return result;
    } catch (error) {
      console.error('Failed to load album page data:', error);
      throw error;
    }
  }

  async getPlaylistPageData(id, isAuthenticated) {
    try {
      if (id === 'LM') return await this.request('/playlists/favorite').catch(() => []);

      const playlist = await this.request(`/playlists/${id}`).catch(() => []);

      if (!isAuthenticated) return playlist;

      const likedTrackIds = await this.getFavoriteTrackIds();
      if (likedTrackIds) {
        playlist.tracks = (playlist.tracks || []).map((track) => ({
          ...track,
          is_liked: likedTrackIds.has(track.id),
        }));
      }

      return playlist;
    } catch (error) {
      console.error('Failed to load playlist page data:', error);
      throw error;
    }
  }

  async getLibraryPageData() {
    try {
      const [playlists, artists, albums, favourite] = await Promise.all([
        this.request(`/playlists/my`).catch(() => []),
        this.request('/favorite/artists').catch(() => []),
        this.request('/favorite/albums').catch(() => []),
        this.request('/playlists/favorite').catch(() => []),
      ]);

      return {
        playlists: playlists || [],
        artists: artists || [],
        albums: albums || [],
        favourite_tracks: favourite.tracks || {},
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

  async incrementTrackListenCount(id) {
    if (!id) return;
    const csrfToken = await this.getCSRFToken();
    await this.request(`/tracks/${id}/listen`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken,
      },
    });
  }

  async getFavoriteTrackIds() {
    try {
      const favorite_tracks = await this.request('/playlists/favorite').catch(() => []);

      if (favorite_tracks.tracks) return new Set(favorite_tracks.tracks.map((t) => t.id));

      return null;
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

  async deletePlaylist(id) {
    try {
      const csrfToken = await this.getCSRFToken();

      return this.request(`/playlists/${id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      });
    } catch {
      console.error('Failed to delete playlist:');
      return [];
    }
  }

  async addTrackToPlaylist(track_id, id) {
    try {
      const csrfToken = await this.getCSRFToken();

      return this.request(`/playlists/${id}/tracks`, {
        method: 'POST',
        body: { track_id },
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      });
    } catch {
      console.error(`Failed to add track ${track_id}:`);
      return [];
    }
  }

  async deleteTrackFromPlaylist(track_id, playlist_id) {
    try {
      const csrfToken = await this.getCSRFToken();

      await this.request(`/playlists/${playlist_id}/tracks`, {
        method: 'DELETE',
        body: { track_id },
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      });
    } catch (error) {
      console.error(`Failed to delete track from playlist with id: ${playlist_id}`, error);
    }
  }

  async likeTrack(track_id) {
    if (!track_id) return;
    try {
      const csrfToken = await this.getCSRFToken();

      await this.request('/playlists/favorite/add-track', {
        method: 'POST',
        body: { track_id },
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      });
    } catch (error) {
      console.error(`Failed to like track ${track_id}:`, error);
    }
  }

  async unLikeTrack(track_id) {
    const playlist_id = await this.getPlaylist();
    try {
      const csrfToken = await this.getCSRFToken();

      await this.request(`/playlists/${playlist_id}/tracks`, {
        method: 'DELETE',
        body: { track_id },
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      });
    } catch (error) {
      console.error(`Failed to unlike track`, error);
    }
  }

  async searchTrack(name, isAuthenticated) {
    let tracks = await this.request(`/tracks/search?q=${name}&limit=5`).catch(() => []);

    if (!isAuthenticated) return tracks;

    const likedTrackIds = await this.getFavoriteTrackIds();
    if (likedTrackIds) {
      tracks = (tracks || []).map((track) => ({
        ...track,
        is_liked: likedTrackIds.has(track.id),
      }));
    }

    return tracks;
  }

  async searchAlbum(name) {
    return await this.request(`/albums/search?q=${name}&limit=5`).catch(() => []);
  }

  async searchArtist(name) {
    return await this.request(`/artists/search?q=${name}&limit=5`).catch(() => []);
  }

  async toggleSubscribeToArtist(id, subscribe) {
    try {
      const csrfToken = await this.getCSRFToken();

      return this.request(`/favorite/artists/${id}`, {
        method: subscribe ? 'POST' : 'DELETE',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      });
    } catch {
      console.error('Failed to subscribe to artist');
      return [];
    }
  }

  async toggleAlbumLike(id, like) {
    try {
      const csrfToken = await this.getCSRFToken();

      return this.request(`/favorite/albums/${id}`, {
        method: like ? 'POST' : 'DELETE',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      });
    } catch {
      console.error('Failed to subscribe to artist');
      return [];
    }
  }
}

export const apiServise = new apiServises();
