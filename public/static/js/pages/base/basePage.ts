import { header } from '@/components/header/header.ts';
import { sidebar } from '@/components/sidebar/sidebar.ts';

export abstract class BasePage {
  public async render(): Promise<void> {
    const app = document.getElementById('app');
    if (!app) return;

    const isLayoutRendered = document.getElementById('sidebar');

    if (!isLayoutRendered) {
      const baseTemplate = Handlebars.templates['basePage.hbs'];
      app.innerHTML = baseTemplate({});
      await Promise.all([header.render(), sidebar.render()]);
    }

    const contentContainer = document.getElementById('page-content');
    if (contentContainer) {
      await this.renderContent(contentContainer);
    }
  }

  protected abstract renderContent(container: HTMLElement): Promise<void>;
}