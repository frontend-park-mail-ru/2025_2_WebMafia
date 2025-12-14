export interface ConfirmModalOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
}

class ModalService {
  showConfirm({
    title,
    description,
    confirmText = 'Удалить',
    cancelText = 'Закрыть',
    onConfirm
  }: ConfirmModalOptions) {
    const template = Handlebars.templates['confirmationModal.hbs'];

    const div = document.createElement('div');
    div.innerHTML = template({
      title,
      description,
      confirmText,
      cancelText
    });

    const overlay = div.firstElementChild as HTMLElement;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); }
    };

    const close = () => {
      overlay.classList.remove('active');
      document.removeEventListener('keydown', handleEsc);
      setTimeout(() => {
        overlay.remove();
      }, 300);
    };

    const confirmBtn = overlay.querySelector('.modal-confirm-btn') as HTMLButtonElement;
    const cancelBtn = overlay.querySelector('.modal-cancel-btn') as HTMLButtonElement;

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        if (onConfirm) onConfirm();
        close();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => close());
    }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        close();
      }
    });

    document.addEventListener('keydown', handleEsc);
  }
}

export const confirmation = new ModalService();
