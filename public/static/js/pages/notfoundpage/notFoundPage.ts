export class notFoundPage {
  async render() {
    const contentTemplate = Handlebars.templates['404.hbs'];
    const container = document.getElementById('app') as HTMLElement;
    container.innerHTML = contentTemplate({});
  }
}
