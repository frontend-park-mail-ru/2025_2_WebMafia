class ModalService {
  showConfirm({ title, description, confirmText = 'Удалить', cancelText = 'Закрыть', onConfirm }) {
    const template = Handlebars.templates['confirmationModal.hbs'];
    const div = document.createElement('div');

    div.innerHTML = template({
      title,
      description,
      confirmText,
      cancelText,
    });

    const overlay = div.firstElementChild;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });

    const close = () => {
      overlay.classList.remove('active');
      document.removeEventListener('keydown', handleEsc);
      setTimeout(() => {
        overlay.remove();
      }, 300);
    };

    const confirmBtn = overlay.querySelector('.modal-confirm-btn');
    const cancelBtn = overlay.querySelector('.modal-cancel-btn');

    confirmBtn.onclick = () => {
      if (onConfirm) onConfirm();
      close();
    };

    cancelBtn.onclick = close;
    overlay.onclick = (e) => {
      if (e.target === overlay) close();
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') { close(); }
    };
    document.addEventListener('keydown', handleEsc);
  }
}

export const confirmation = new ModalService();
