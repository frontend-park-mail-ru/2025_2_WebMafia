export const API_AVATARS_URL = 'https://wave-music.ru/avatars';
export const API_TRACKS_URL = `https://wave-music.ru/music/tracks`;
import { userRoutes, tracksArtistAlbumRoutes, playlistRoutes } from '@/devRoutesConfig';
import { Artist, Album, Track, Playlist, UserProfile, Avatar, WebSocketHandlers, Comment } from '@/models';
import { CommentsSocket } from '@/utils/webSocketConnect';

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: BodyInit | Record<string, unknown> | null;
}

export class apiService {
  private baseURL: string;
  private dataURL: string;
  private wsBaseURL: string;
  private playlistURL: string;
  private csrfToken: string | null = null;
  private playlistIdCache: string | null = null;

  private userRoutes: string[] = [];
  private tracksArtistAlbumRoutes: string[] = [];
  private playlistRoutes: string[] = [];

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL as string;
    this.dataURL = import.meta.env.VITE_API_DATA_URL as string;
    this.wsBaseURL = import.meta.env.VITE_API_WS_URL as string;
    this.playlistURL = import.meta.env.VITE_API_PLAYLIST_URL as string;

    if (import.meta.env.DEV) {
      this.userRoutes = userRoutes;
      this.tracksArtistAlbumRoutes = tracksArtistAlbumRoutes;
      this.playlistRoutes = playlistRoutes;
    }
  }

  private async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
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

    const headers: HeadersInit = {
      ...options.headers,
    };

    if (!isFormData) {
      (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
      method: options.method || 'GET',
      credentials: 'include',
      headers,
      ...options,
      body: undefined,
    };

    if (options.body) {
      if (isFormData || typeof options.body === 'string' || options.body instanceof Blob) {
        config.body = options.body as BodyInit;
      } else {
        config.body = JSON.stringify(options.body);
      }
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    if (response.status === 204 || response.headers.get('Content-Length') === '0') {
      return {} as T;
    }

    return (await response.json()) as Promise<T>;
  }

  async getCSRFToken(): Promise<string> {
    if (this.csrfToken) return this.csrfToken;
    try {
      const data = await this.request<{ csrf_token: string }>('/csrf-token');
      this.csrfToken = data.csrf_token;
      return this.csrfToken;
    } catch (e) {
      console.error('Failed to get CSRF token', e);
      return '';
    }
  }

  async getMainPageData() {
    try {
      const [albums, tracks, artists] = await Promise.all([
        this.request<Album[]>('/albums?limit=20').catch(() => []),
        this.request<Track[]>('/tracks?limit=30').catch(() => []),
        this.request<Artist[]>('/artists?limit=20').catch(() => []),
      ]);

      return { albums, tracks, artists };
    } catch (error) {
      console.error('Failed to load main page data:', error);
      throw error;
    }
  }

  async getArtistPageData(id: string, isAuthenticated: boolean) {
    try {
      const [albums, popularTracks, artist, similarArtists] = await Promise.all([
        this.request<Album[]>(`/artists/${id}/albums?limit=10`).catch(() => []),
        this.request<Track[]>(`/artists/${id}/tracks?limit=5`).catch(() => []),
        this.request<Artist>(`/artists/${id}`).catch(() => ({}) as Artist),
        this.request<Artist[]>('/artists?limit=10').catch(() => []),
      ]);

      const result = {
        albums,
        popular_tracks: popularTracks,
        artist,
        similar_artists: similarArtists,
      };

      if (!isAuthenticated) return result;

      const [favoriteTrackIds, favoriteArtists] = await Promise.all([
        this.getFavoriteTrackIds(),
        this.request<Artist[]>('/favorite/artists').catch(() => []),
      ]);

      if (favoriteArtists.some((a: Artist) => a.id === artist.id)) {
        result.artist.isSubscribed = true;
      }

      if (favoriteTrackIds) {
        result.popular_tracks = popularTracks.map((track: Track) => ({
          ...track,
          is_liked: favoriteTrackIds.has(track.id),
        }));
      }

      return result;
    } catch (error) {
      console.error('Failed to load artist page data:', error);
      throw error;
    }
  }

  async getArtistAlbums(id: string) {
    try {
      const [albums, artist] = await Promise.all([
        this.request<Album[]>(`/artists/${id}/albums`).catch(() => []),
        this.request<Artist>(`/artists/${id}`).catch(() => ({}) as Artist),
      ]);
      return { albums, artist };
    } catch (error) {
      console.error('Failed to load artist albums page data:', error);
      throw error;
    }
  }

  async getArtistTracks(id: string, isAuthenticated: boolean) {
    try {
      const [tracks, artist] = await Promise.all([
        this.request<Track[]>(`/artists/${id}/tracks`).catch(() => []),
        this.request<Artist>(`/artists/${id}`).catch(() => ({}) as Artist),
      ]);

      let processedTracks = tracks;

      if (isAuthenticated) {
        const likedTrackIds = await this.getFavoriteTrackIds();
        if (likedTrackIds) {
          processedTracks = tracks.map((track: Track) => ({
            ...track,
            is_liked: likedTrackIds.has(track.id),
          }));
        }
      }

      return { tracks: processedTracks, artist };
    } catch (error) {
      console.error('Failed to load artist albums page data:', error);
      throw error;
    }
  }

  async getProfilePageData() {
    try {
      const [artists, topTracks, likedIds] = await Promise.all([
        this.request<Artist[]>('/artists?limit=10').catch(() => []),
        this.request<Track[]>(`/tracks?limit=5`).catch(() => []),
        this.getFavoriteTrackIds(),
      ]);

      let processedTracks = topTracks;
      if (likedIds) {
        processedTracks = topTracks.map((track: Track) => ({
          ...track,
          is_liked: likedIds.has(track.id),
        }));
      }

      return {
        top_artists: artists,
        top_tracks: processedTracks,
        recent: artists,
      };
    } catch (error) {
      console.error('Failed to load profile page data:', error);
      throw error;
    }
  }

  async getProfileData() {
    return await this.request<UserProfile>('/me');
  }

  async loadTrackById(id: string) {
    if (!id) return null;
    try {
      const track = await this.request<Track>(`/tracks/${id}`);
      const likedTrackIds = await this.getFavoriteTrackIds();
      if (likedTrackIds && track) {
        track.is_liked = likedTrackIds.has(track.id);
      }
      return track;
    } catch (error) {
      console.error('Failed to load track:', error);
      throw error;
    }
  }

  async uploadAvatar(file: File) {
    const csrfToken = await this.getCSRFToken();
    const profile = await this.getProfileData();

    if (profile.AvatarURL) {
      await this.deleteAvatar();
    }

    const formData = new FormData();
    formData.append('avatar', file);

    return await this.request<Avatar>('/avatar', {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken },
      body: formData,
    });
  }

  async updatePlaylist(title: string, description: string, playlistId: string) {
    const csrfToken = await this.getCSRFToken();
    return this.request<Playlist>(`/playlists/${playlistId}`, {
      method: 'PUT',
      body: { title, description },
      headers: { 'X-CSRF-Token': csrfToken },
    });
  }

  async deletePlaylistAvatar(playlistId: string) {
    const csrfToken = await this.getCSRFToken();
    await this.request(`/playlists/${playlistId}/avatar`, {
      method: 'DELETE',
      headers: { 'X-CSRF-Token': csrfToken },
    });
  }

  async uploadPlaylistAvatar(file: File, playlistId: string) {
    const csrfToken = await this.getCSRFToken();

    const playlist = await this.request<Playlist>(`/playlists/${playlistId}`).catch(() => ({}) as Playlist);
    if (playlist.avatar_url) {
      await this.deletePlaylistAvatar(playlistId);
    }

    const formData = new FormData();
    formData.append('avatar', file);

    return await this.request<Avatar>(`/playlists/${playlistId}/avatar`, {
      method: 'POST',
      body: formData,
      headers: { 'X-CSRF-Token': csrfToken },
    });
  }

  async createPlaylist(title: string, description: string) {
    const csrfToken = await this.getCSRFToken();
    return this.request<Playlist>('/playlists', {
      method: 'POST',
      body: { title, description },
      headers: { 'X-CSRF-Token': csrfToken },
    });
  }

  async deleteAvatar() {
    const csrfToken = await this.getCSRFToken();
    await this.request('/avatar', {
      method: 'DELETE',
      headers: { 'X-CSRF-Token': csrfToken },
    });
  }

  async getAlbumPageData(id: string, isAuthenticated: boolean) {
    try {
      const [album, tracks] = await Promise.all([
        this.request<Album>(`/albums/${id}`).catch(() => ({}) as Album),
        this.request<Track[]>(`/albums/${id}/tracks`).catch(() => []),
      ]);

      const result = { album, tracks };
      if (!isAuthenticated) return result;

      const [likedTracks, likedAlbums] = await Promise.all([
        this.getFavoriteTrackIds(),
        this.request<Album[]>('/favorite/albums').catch(() => []),
      ]);

      if (likedAlbums.some((a) => a.id === album.id)) {
        result.album.is_liked = true;
      }
      if (likedTracks) {
        result.tracks = tracks.map((t) => ({ ...t, is_liked: likedTracks.has(t.id) }));
      }
      return result;
    } catch (error) {
      console.error('Failed to load album page data:', error);
      throw error;
    }
  }

  async getPlaylistPageData(id: string, isAuthenticated: boolean) {
    try {
      if (id === 'LM') return await this.request<Playlist>('/playlists/favorite').catch(() => ({}) as Playlist);

      const playlist = await this.request<Playlist>(`/playlists/${id}`).catch(() => ({}) as Playlist);

      if (!isAuthenticated) return playlist;

      const likedTrackIds = await this.getFavoriteTrackIds();
      if (likedTrackIds && playlist.tracks) {
        playlist.tracks = playlist.tracks.map((track) => ({
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
      const [playlists, artists, albums, favoritePlaylist] = await Promise.all([
        this.request<Playlist[]>('/playlists/my').catch(() => []),
        this.request<Artist[]>('/favorite/artists').catch(() => []),
        this.request<Album[]>('/favorite/albums').catch(() => []),
        this.request<{ tracks: Track[] }>('/playlists/favorite').catch(() => ({ tracks: [] })),
      ]);

      return {
        playlists: playlists || [],
        artists: artists || [],
        albums: albums || [],
        favourite_tracks: favoritePlaylist.tracks || [],
      };
    } catch (error) {
      console.error('Failed to load library page data:', error);
      throw error;
    }
  }

  async loginUser(login: string, password: string) {
    this.csrfToken = null;
    this.playlistIdCache = null;
    return this.request<{ id: string }>('/login', {
      method: 'POST',
      body: { login, password },
    });
  }

  async registerUser(login: string, email: string, password: string) {
    this.csrfToken = null;
    this.playlistIdCache = null;
    return this.request<{ id: string }>('/register', {
      method: 'POST',
      body: { login, email, password },
    });
  }

  async editUser(login?: string, email?: string, password?: string) {
    return this.request<UserProfile>('/profile', {
      method: 'PUT',
      body: { login, email, password },
    });
  }

  async logoutUser() {
    const csrfToken = await this.getCSRFToken();
    try {
      await this.request('/logout', {
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfToken },
      });
    } finally {
      this.csrfToken = null;
      this.playlistIdCache = null;
    }
  }

  async incrementTrackListenCount(id: string) {
    if (!id) return;
    const csrfToken = await this.getCSRFToken();
    await this.request(`/tracks/${id}/listen`, {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken },
    });
  }

  private async getFavoriteTrackIds(): Promise<Set<string> | null> {
    try {
      const favorite_tracks = await this.request<{ tracks: Track[] }>('/playlists/favorite').catch(() => null);
      if (favorite_tracks && favorite_tracks.tracks) {
        return new Set(favorite_tracks.tracks.map((t) => t.id));
      }
      return null;
    } catch (error) {
      console.error('Failed to load favorite tracks:', error);
      return new Set();
    }
  }

  async getFavoritePlaylistId() {
    if (this.playlistIdCache) return this.playlistIdCache;

    try {
      const all = await this.request<Playlist[]>('/playlists/my');
      const fav = all.find((p) => p.is_favorite);
      if (fav) {
        this.playlistIdCache = fav.id;
        return fav.id;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }

  async deletePlaylist(id: string) {
    const csrfToken = await this.getCSRFToken();
    return this.request(`/playlists/${id}`, {
      method: 'DELETE',
      headers: { 'X-CSRF-Token': csrfToken },
    });
  }

  async addTrackToPlaylist(track_id: string, playlist_id: string) {
    const csrfToken = await this.getCSRFToken();
    return this.request(`/playlists/${playlist_id}/tracks`, {
      method: 'POST',
      body: { track_id },
      headers: { 'X-CSRF-Token': csrfToken },
    });
  }

  async deleteTrackFromPlaylist(track_id: string, playlist_id: string) {
    const csrfToken = await this.getCSRFToken();
    return this.request(`/playlists/${playlist_id}/tracks`, {
      method: 'DELETE',
      body: { track_id },
      headers: { 'X-CSRF-Token': csrfToken },
    });
  }

  async likeTrack(track_id: string) {
    if (!track_id) return;
    try {
      const csrfToken = await this.getCSRFToken();

      await this.request('/playlists/favorite/add-track', {
        method: 'POST',
        body: { track_id },
        headers: { 'X-CSRF-Token': csrfToken },
      });
    } catch (error) {
      console.error(`Failed to like track ${track_id}:`, error);
    }
  }

  async unLikeTrack(track_id: string) {
    if (!track_id) return;
    try {
      const favId = await this.getFavoritePlaylistId();
      if (!favId) return;

      const csrfToken = await this.getCSRFToken();
      await this.request(`/playlists/${favId}/tracks`, {
        method: 'DELETE',
        body: { track_id },
        headers: { 'X-CSRF-Token': csrfToken },
      });
    } catch (error) {
      console.error(`Failed to unlike track`, error);
    }
  }

  async searchTrack(name: string, isAuthenticated: boolean) {
    let tracks = await this.request<Track[]>(`/tracks/search?q=${name}&limit=5`).catch(() => []);

    if (!isAuthenticated) return tracks;

    const likedTrackIds = await this.getFavoriteTrackIds();
    if (likedTrackIds) {
      tracks = tracks.map((track: Track) => ({
        ...track,
        is_liked: likedTrackIds.has(track.id),
      }));
    }

    return tracks;
  }

  async searchAlbum(name: string) {
    return await this.request<Album[]>(`/albums/search?q=${name}&limit=5`).catch(() => []);
  }

  async searchArtist(name: string) {
    return await this.request<Artist[]>(`/artists/search?q=${name}&limit=5`).catch(() => []);
  }

  async toggleSubscribeToArtist(id: string, subscribe: boolean) {
    const csrfToken = await this.getCSRFToken();
    await this.request(`/favorite/artists/${id}`, {
      method: subscribe ? 'POST' : 'DELETE',
      headers: { 'X-CSRF-Token': csrfToken },
    });
  }

  async toggleAlbumLike(id: string, like: boolean) {
    const csrfToken = await this.getCSRFToken();
    await this.request(`/favorite/albums/${id}`, {
      method: like ? 'POST' : 'DELETE',
      headers: { 'X-CSRF-Token': csrfToken },
    });
  }

  async getTrackCommentsPageData(trackId: string, isAuthenticated: boolean) {
    try {
      const [track, comments] = await Promise.all([
        this.loadTrackById(trackId),
        this.request<Comment[]>(`/comments/tracks/${trackId}`).catch(() => []),
      ]);

      if (!track || !track.id) {
        throw new Error('Track not found');
      }

      const artistId = track.artists?.[0]?.id;
      let artist = {} as Artist;

      if (artistId) {
        const artistData = await this.request<Artist>(`/artists/${artistId}`).catch(() => ({}) as Artist);
        artist = artistData;

        if (isAuthenticated) {
          const favoriteArtists = await this.request<Artist[]>('/favorite/artists').catch(() => []);
          const isSubscribed = favoriteArtists.some((a) => a.id === artist.id);
          artist.isSubscribed = isSubscribed;
        }
      }

      return {
        track,
        comments: comments || [],
        artist,
      };
    } catch (error) {
      console.error('Failed to load track comments page data:', error);
      throw error;
    }
  }

  createTrackSocket(trackId: string, token: string, handlers: WebSocketHandlers) {
    const wsUrl = `${this.wsBaseURL}/ws/comments/tracks/${trackId}`;
    return new CommentsSocket<Comment>(wsUrl, token, handlers);
  }

  async generatePlaylistDescription(id: string) {
    try {
      const csrfToken = await this.getCSRFToken();
      return this.request<{ title: string; description: string }>(`/playlists/${id}/generate`, {
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfToken },
      });
    } catch (error) {
      console.error('Failed to generate description:', error);
      throw error;
    }
  }
}

export const apiServise = new apiService();
