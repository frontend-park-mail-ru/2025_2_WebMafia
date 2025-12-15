import { images } from '@/assets';

export class nowPlayingCards {
  async render() {
    let pageData = {
      playlistImage: images.defaultPlaylistPath,
    };
    const contentTemplate = Handlebars.templates['nowPlayingCards.hbs'];
    const sidebarHTML = contentTemplate();

    const page = document.getElementById('scrollContent');
    if (page && !document.getElementById('nowPlayingCards')) {
      page.insertAdjacentHTML('afterbegin', sidebarHTML);
    }
    document.getElementById('nowPlayingCards').outerHTML = contentTemplate(pageData);
  }
}

export const nowPlayingcards = new nowPlayingCards();
