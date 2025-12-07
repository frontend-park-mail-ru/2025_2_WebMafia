export function getStaticImagePath() {
  const logoImage = document.querySelector('.wave-icon');
  const defaultPlaylist = document.querySelector('.profile-image.create-playlist');
  if (logoImage) {
    if (import.meta.env.DEV) {
      logoImage.src = 'static/img/logo.png';
    } else {
      logoImage.src = 'assets/logo-F_j9P4rl.png';
    }
  }
  if (defaultPlaylist) {
    if (import.meta.env.DEV) {
      defaultPlaylist.src = 'static/img/default-playlist.png';
    } else {
      defaultPlaylist.src = 'assets/default-playlist-F_j9P4rl.png';
    }
  }
}
