class ModalService {
  showConfirm({
    title,
    description,
    confirmText = 'Удалить',
    cancelText = 'Закрыть',
    onConfirm
  }) {
    const template = Handlebars.templates['confirmationModal.hbs'];
    const div = document.createElement('div');

    div.innerHTML = template({
      title,
      description,
      confirmText,
      cancelText
    });

    const overlay = div.firstElementChild;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });

    const close = () => {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.remove();
      }, 300);
    };

    const confirmBtn = overlay.querySelector('.modal-confirm-btn');
    const cancelBtn = overlay.querySelector('.modal-cancel-btn');
    const closeIcon = overlay.querySelector('.modal-close-btn');

    confirmBtn.onclick = () => {
      if (onConfirm) onConfirm();
      close();
    };

    cancelBtn.onclick = close;
    closeIcon.onclick = close;
    overlay.onclick = (e) => {
      if (e.target === overlay) close();
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        close();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
  }
}

export const confirmation = new ModalService();