import { useEffect, type ReactNode } from 'react';

interface DialogProps {
  title: string;
  onClose: () => void;
  wide?: boolean;
  children: ReactNode;
}

export function Dialog({ title, onClose, wide, children }: DialogProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={wide ? 'dialog dialog--wide' : 'dialog'} role="dialog" aria-modal="true" aria-label={title}>
        <header className="dialog__header">
          <h2>{title}</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </header>
        <div className="dialog__body">{children}</div>
      </div>
    </div>
  );
}
