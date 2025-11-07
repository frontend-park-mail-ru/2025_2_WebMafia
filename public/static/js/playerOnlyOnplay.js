export function playerOnlyOnPlay() {
  const layout = document.querySelector('.layout');
  const nowPlayingContainer = document.querySelector('.now-playing-container');
  const playerContent = document.querySelector('.player');
  if (nowPlayingContainer) nowPlayingContainer.classList.toggle('none_play');
  layout.classList.toggle('whithout_player');
  if (playerContent) playerContent.classList.toggle('none_playing');
  if (localStorage.getItem('currentTrackId')) {
    if (nowPlayingContainer) nowPlayingContainer.classList.remove('none_play');
    if (playerContent) playerContent.classList.remove('none_playing');
  }
  if (playerContent && !playerContent.classList.contains('none_playing')) {
    layout.classList.toggle('whithout_player');
  }
}
