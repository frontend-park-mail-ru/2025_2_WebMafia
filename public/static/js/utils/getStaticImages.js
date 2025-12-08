import logoPath from '../../img/logo.png';
import defaultPlaylistPath from '../../img/default-playlist.png';
import defaultAlbumPath from '../../img/default-album.png';
import defaultArtistPath from '../../img/default-artist.png';
import likedTracksPath from '../../img/liked_tracks.png';

export function getStaticImagePath(item) {
  const logoImage = document.querySelector('.wave-icon');
  const defaultPlaylist = document.querySelector('.profile-image.create-playlist');
  const defaultAlbum = document.querySelector('.album-cover ');
  const libraryCover = document.querySelector('.playlist-cover');
  if (logoImage) {
    if (import.meta.env.DEV) {
      logoImage.src = logoPath;
    } else {
      logoImage.src = 'assets/logo-F_j9P4rl.png';
    }
  }
  if (defaultPlaylist) {
    if (import.meta.env.DEV) {
      defaultPlaylist.src = defaultPlaylistPath;
    } else {
      defaultPlaylist.src = 'assets/default-playlist-F_j9P4rl.png';
    }
  }
  if (item) {
    if (defaultAlbum && item.title === 'Понравившиеся треки') {
      if (import.meta.env.DEV) {
        defaultAlbum.src = likedTracksPath;
      } else {
        defaultAlbum.src = 'assets/liked_tracks-BOykAi0T.png';
      }
    }
    if (defaultAlbum && item.cover === defaultPlaylistPath) {
      if (import.meta.env.DEV) {
        defaultAlbum.src = defaultPlaylistPath;
      } else {
        defaultAlbum.src = 'assets/default-playlist-F_j9P4rl.png';
      }
    }
  }

  if (item) {
    if (libraryCover && item.library[0].name === 'Понравившиеся треки') {
      if (import.meta.env.DEV) {
        libraryCover.src = likedTracksPath;
      } else {
        libraryCover.src = 'assets/liked_tracks-BOykAi0T.png';
      }
    }
  }
}
