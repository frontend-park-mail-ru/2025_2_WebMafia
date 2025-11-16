export function playerOnlyOnPlay() {
  const layout = document.querySelector('.layout');
  const nowPlayingContainer = document.querySelector('.now-playing-container');
  const playerContent = document.querySelector('.player');
  if (nowPlayingContainer) nowPlayingContainer.classList.add('none_play');
  if (playerContent) playerContent.classList.add('none_playing');
  if (localStorage.getItem('currentTrackId')) {
    if (nowPlayingContainer) nowPlayingContainer.classList.remove('none_play');
    if (playerContent) playerContent.classList.remove('none_playing');
  }
  if (playerContent && !playerContent.classList.contains('none_playing')) {
    layout.style.marginBottom = '90px';
  }
}
