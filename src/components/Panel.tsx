import { useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { CloseIcon, IconButton, ResetIcon } from './IconButton';
export function Panel({
  title,
  onClose,
  onReset,
  children,
}: {
  title: string;
  onClose: () => void;
  onReset: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const element = dialog.current;
    const opener = document.activeElement;
    if (element && !element.open) {
      element.showModal();
      element.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
    }
    return () => {
      element?.close();
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="panel"
      aria-label={title}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const focusable = [
          ...event.currentTarget.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), [tabindex="0"]'
          ),
        ].filter(
          (element): element is HTMLElement =>
            element instanceof HTMLElement && element.getClientRects().length > 0
        );
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first && last) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last && first) {
          event.preventDefault();
          first.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget || event.detail === 0) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          onClose();
      }}
    >
      <div className="panel-heading">
        <h2>{title}</h2>
        <IconButton name={`Reset ${title.toLowerCase()}`} onClick={onReset}>
          <ResetIcon />
        </IconButton>
        <IconButton name={`Close ${title.toLowerCase()}`} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>
      {children}
    </dialog>
  );
}
