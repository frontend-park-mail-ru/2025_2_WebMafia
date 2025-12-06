export function getStaticImagePath(apiPath) {
  const logoImage = document.querySelector('.wave-icon');
  const defaultPlaylist = document.querySelector('.profile-image');
  console.log(apiPath);
  if (logoImage) {
    if (apiPath == 'wave-music.ru') {
      logoImage.src = 'assets/logo-F_j9P4rl.png';
    } else {
      logoImage.src = 'static/img/logo.png';
    }
  }
  if (defaultPlaylist) {
    if (apiPath === 'wave-music.ru') {
      defaultPlaylist.src = 'assets/default-playlist-F_j9P4rl.png';
    } else {
      defaultPlaylist.src = 'static/img/default-playlist.png';
    }
  }
}
