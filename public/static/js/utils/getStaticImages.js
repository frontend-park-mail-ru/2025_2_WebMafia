export function getStaticImagePath(apiPath) {
  const logoImage = document.querySelector('.wave-icon');
  const defaultPlaylist = document.querySelector('.profile-image');
  if (logoImage) {
    if (apiPath === 'wave-music.ru') {
      logoImage.src = 'assets/logo-F_j9P4rl.png';
    }
    logoImage.src = 'static/img/logo.png';
  }
  if (defaultPlaylist) {
    if (apiPath === 'wave-music.ru') {
      defaultPlaylist.src = 'default-playlist-F_j9P4rl.png';
    }
    defaultPlaylist.src = 'static/img/default-playlist.png';
  }
}
