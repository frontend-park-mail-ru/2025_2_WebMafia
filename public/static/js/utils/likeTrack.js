export function likeTrackBtn() {
  const likeBnt = document.querySelectorAll('.like-btn-track');
  likeBnt.forEach((button) => {
    button.addEventListener('click', () => {
      if (button.classList.contains('active')) {
        button.classList.remove('active');
      } else {
        button.classList.add('active');
      }
    });
  });
}
