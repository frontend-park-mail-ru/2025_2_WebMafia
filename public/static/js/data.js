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
      }

      if (!isAuthenticated)
        return result;

      const [favorite_tracks, favorite_artists] = await Promise.all([
        this.getFavoriteTrackIds().catch(() => []),
        this.request('/favorite/artists').catch(() => []),
      ]);

      result.popular_tracks = (popular_tracks || []).map((track) => ({
        ...track,
        is_liked: Array.isArray(favorite_tracks) ? favorite_tracks.includes(track.id) : false,
      }));
      result.artist.isSubscribed = favorite_artists.map(a => a.id).includes(artist.id);

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

  async getArtistTracks(id) {
    try {
      const [tracks, artist, favorite_tracks] = await Promise.all([
        this.request(`/artists/${id}/tracks`).catch(() => []),
        this.request(`/artists/${id}`).catch(() => []),
        this.getFavoriteTrackIds().catch(() => []),
      ]);
      let tracks_with_likes;
      if (favorite_tracks) {
        tracks_with_likes = (tracks || []).map((track) => ({
          ...track,
          is_liked: favorite_tracks.includes(track.id),
        }));
      } else {
        tracks_with_likes = (tracks || []).map((track) => ({
          ...track,
        }));
      }
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
      let tracks_with_likes;
      if (favorite_tracks) {
        tracks_with_likes = (top_tracks || []).map((track) => ({
          ...track,
          is_liked: favorite_tracks.includes(track.id),
        }));
      } else {
        tracks_with_likes = (top_tracks || []).map((track) => ({
          ...track,
        }));
      }

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
      const [track, favorite_tracks] = await Promise.all([
        this.request(`/tracks/${id}`).catch(() => []),
        this.getFavoriteTrackIds().catch(() => []),
      ]);
      const tracks_with_likes = track
        ? {
            ...track,
            is_liked: Array.isArray(favorite_tracks) ? favorite_tracks.includes(track.id) : false,
          }
        : null;

      return tracks_with_likes;
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
    const csrfToken = await this.getCSRFToken();

    return this.request(`/playlists/${playlistId}/avatar`, {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': csrfToken,
      },
    });
  }

  async uploadPlaylistAvatar(file, id) {
    const formData = new FormData();
    formData.append('avatar', file);
    const csrfToken = await this.getCSRFToken();

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

  async getAlbumPageData(id) {
    try {
      const [album, tracks, favorite_tracks] = await Promise.all([
        this.request(`/albums/${id}`).catch(() => []),
        this.request(`/albums/${id}/tracks`).catch(() => []),
        this.getFavoriteTrackIds().catch(() => []),
      ]);

      let tracks_with_likes;
      if (favorite_tracks) {
        tracks_with_likes = (tracks || []).map((track) => ({
          ...track,
          is_liked: favorite_tracks.includes(track.id),
        }));
      } else {
        tracks_with_likes = (tracks || []).map((track) => ({
          ...track,
        }));
      }

      return { album: album || {}, tracks: tracks_with_likes || [] };
    } catch (error) {
      console.error('Failed to load album page data:', error);
      throw error;
    }
  }

  async getPlaylistPageData(id) {
    try {
      if (id === 'LM') {
        const favourite = await this.request('/playlists/favorite').catch(() => []);
        return {playlist: {}, tracks: favourite.tracks || []};
      }

      const [playlist, favorite_tracks] = await Promise.all([
        this.request(`/playlists/${id}`).catch(() => []),
        this.getFavoriteTrackIds().catch(() => []),
      ]);

      let tracks_with_likes;
      if (favorite_tracks) {
        tracks_with_likes = (playlist.tracks || []).map((track) => ({
          ...track,
          is_liked: favorite_tracks.includes(track.id),
        }));
      } else {
        tracks_with_likes = (playlist.tracks || []).map((track) => ({
          ...track,
        }));
      }
      return { playlist: playlist || {}, tracks: tracks_with_likes || [] };
    } catch (error) {
      console.error('Failed to load playlist page data:', error);
      throw error;
    }
  }

  async getLibraryPageData() {
    try {
      const [playlists, favourite] = await Promise.all([
        this.request(`/playlists/my`).catch(() => []),
        this.request('/playlists/favorite').catch(() => []),
      ]);

      return {
        playlists: playlists || [],
        favourite: favourite || {},
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
      const favoriteTracks = await this.request('/playlists/favorite');
      if (!favoriteTracks || !Array.isArray(favoriteTracks.tracks)) {
        return [];
      }
      const trackIds = favoriteTracks.tracks.map((track) => track.id);
      return trackIds;
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

  async addTrackToPlaylist(track_Id, id) {
    try {
      const csrfToken = await this.getCSRFToken();

      return this.request(`/playlists/${id}/tracks`, {
        method: 'POST',
        body: { track_Id },
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      });
    } catch {
      console.error(`Failed to add track ${track_Id}:`);
      return [];
    }
  }

  async deleteTrackFromPlaylist(track_Id, playlist_id) {
    try {
      const csrfToken = await this.getCSRFToken();

      await this.request(`/playlists/${playlist_id}/tracks`, {
        method: 'DELETE',
        body: { track_Id },
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      });
    } catch (error) {
      console.error(`Failed to delete track from playlist with id: ${playlist_id}`, error);
    }
  }

  async likeTrack(track_Id) {
    if (!track_Id) return;
    try {
      const csrfToken = await this.getCSRFToken();

      await this.request('/playlists/favorite/add-track', {
        method: 'POST',
        body: { track_Id },
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      });
    } catch (error) {
      console.error(`Failed to like track ${track_Id}:`, error);
    }
  }

  async unLikeTrack(track_Id) {
    const playlist_id = await this.getPlaylist();
    try {
      const csrfToken = await this.getCSRFToken();

      await this.request(`/playlists/${playlist_id}/tracks`, {
        method: 'DELETE',
        body: { track_Id },
        headers: {
          'X-CSRF-Token': csrfToken,
        },
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
}

export const apiServise = new apiServises();
