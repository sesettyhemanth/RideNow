import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon.jsx';

function Modal({ title, subtitle, onClose, children, footer, size = 'md' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    const previousOverflow = document.body.style.overflow;
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div className="admin-theme ad-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`ad-modal ad-modal--${size}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="ad-modal__header">
          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="ad-icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="x" size={16} />
          </button>
        </header>
        <div className="ad-modal__body">{children}</div>
        {footer && <footer className="ad-modal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
