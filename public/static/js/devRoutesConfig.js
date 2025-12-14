export const userRoutes = [
  '/login',
  '/register',
  '/csrf-token',
  '/logout',
  '/avatar',
  '/profile',
  '/me'
];

export const tracksArtistAlbumRoutes = [
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
  '/comments/tracks/:id',
];

export const playlistRoutes = [
  '/playlists/favorite',
  '/playlists/favorite/add-track',
  '/users/:id/playlists',
  '/playlists',
  '/playlists/:id',
  '/playlists/:id/avatar',
  '/playlists/my',
  '/playlists/:id/tracks',
  '/favorite/artists',
  '/favorite/artists/:id',
  '/favorite/albums',
  '/favorite/albums/:id'
];
