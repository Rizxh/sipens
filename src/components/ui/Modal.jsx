import { useEffect } from 'react';
import { Icon } from '../icons';
import Button from './Button';

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) {
  useEffect(() => {
    if (!open) return;

    function handleEscape(e) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-label="Tutup modal"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={[
          'relative w-full bg-white rounded-2xl shadow-xl border border-slate-200',
          'max-h-[90vh] flex flex-col',
          sizes[size] ?? sizes.md,
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Tutup"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ModalFooter({ onCancel, onSubmit, submitLabel, loading, submitVariant = 'primary' }) {
  return (
    <>
      <Button variant="secondary" onClick={onCancel} disabled={loading}>
        Batal
      </Button>
      <Button variant={submitVariant} onClick={onSubmit} loading={loading}>
        {submitLabel}
      </Button>
    </>
  );
}
