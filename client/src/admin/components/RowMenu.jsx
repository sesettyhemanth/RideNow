import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon.jsx';

function RowMenu({ items, label = 'More actions' }) {
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [pos, setPos] = useState(null);
  const visible = items.filter((item) => item && !item.hidden);

  useEffect(() => {
    if (!pos) return undefined;
    const close = () => setPos(null);
    const onDown = (e) => {
      if (menuRef.current?.contains(e.target) || buttonRef.current?.contains(e.target)) return;
      close();
    };
    const onKey = (e) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [pos]);

  const toggle = () => {
    if (pos) {
      setPos(null);
      return;
    }
    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = visible.length * 40 + 16;
    const flip = rect.bottom + menuHeight > window.innerHeight - 8;
    setPos({
      right: Math.max(8, window.innerWidth - rect.right),
      ...(flip ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 }),
    });
  };

  if (visible.length === 0) return null;

  return (
    <>
      <button ref={buttonRef} type="button" className="ad-icon-btn" onClick={toggle} aria-label={label} aria-haspopup="menu" aria-expanded={!!pos}>
        <Icon name="more" size={16} />
      </button>
      {pos &&
        createPortal(
          <div ref={menuRef} className="admin-theme ad-row-menu" style={pos} role="menu">
            {visible.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={item.tone === 'danger' ? 'is-danger' : ''}
                onClick={() => {
                  setPos(null);
                  item.onClick();
                }}
              >
                {item.icon && <Icon name={item.icon} size={15} />}
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}

export default RowMenu;
