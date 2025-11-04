const API_BASE_URL = 'http://localhost:8080/api/v1';
const MINIO_ENDPOINT = 'http://localhost:8099'; // Ваш публичный адрес MinIO
const MINIO_AVATAR_BUCKET = 'avatars'; // Название бакета для аватаров

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
        this.request(`/artists/${id}/albums`).catch(() => []),
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

  async getProfilePageData() {
    return this.request('/profile');
  }

  async getUserData() {
    return this.request('/me');
  }

  // async uploadAvatar(file) {
  //   // Генерируем уникальное имя файла, чтобы избежать перезаписи
  //   const fileExtension = file.name.split('.').pop();
  //   const uniqueFileName = `${crypto.randomUUID()}.${fileExtension}`;

  //   // Формируем полный URL для загрузки
  //   const uploadUrl = `${MINIO_ENDPOINT}/${MINIO_AVATAR_BUCKET}/${uniqueFileName}`;

  //   console.log(`Uploading to: ${uploadUrl}`);

  //   const response = await fetch(uploadUrl, {
  //     method: 'PUT',
  //     body: file,
  //     headers: {
  //       credentials: 'include',
  //       'Content-Type': file.type,
  //     },
  //   });

  //   if (!response.ok) {
  //     throw new Error('Не удалось загрузить файл напрямую в хранилище.');
  //   }

  //   // Возвращаем публичный URL, по которому будет доступен файл
  //   return uploadUrl;
  // }

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
