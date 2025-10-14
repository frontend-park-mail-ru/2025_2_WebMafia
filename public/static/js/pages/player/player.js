export class Player {
  async render() {
    const contentTemplate = Handlebars.templates['player.hbs'];
    const headerHTML = contentTemplate();

    const section = document.getElementById('section');
    if (section && !document.getElementById('player')) {
      section.insertAdjacentHTML('afterbegin', headerHTML);
    }
  }
}

export const player = new Player();
