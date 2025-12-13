import { header } from '@/components/header/header.ts';
import { sidebar } from '@/components/sidebar/sidebar.ts';

export abstract class BasePage {
  public async render(slug?: string): Promise<void> {
    const app = document.getElementById('app');
    if (!app) return;

    const isLayoutRendered = document.getElementById('section');

    if (!isLayoutRendered) {
      const baseTemplate = Handlebars.templates['basePage.hbs'];
      app.innerHTML = baseTemplate({});
    }

    await Promise.all([header.render(), sidebar.render()]);

    const contentContainer = document.getElementById('page-content');
    if (contentContainer) {
      await this.renderContent(contentContainer, slug);
    }
  }

  protected abstract renderContent(container: HTMLElement, slug?: string): Promise<void>;
}