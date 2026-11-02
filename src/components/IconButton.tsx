import type { ReactNode } from 'react';
export function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M4 10a8 8 0 1 1 1 8M4 4v6h6" />
    </svg>
  );
}
export function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}
export function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="m9 3-.6 2.4-2 .9L4.2 5l-2 3.5 1.8 1.7v2.5l-1.8 1.8 2 3.5 2.2-1.3 2 .9L9 20h4l.6-2.4 2-.9 2.2 1.3 2-3.5-1.8-1.8v-2.5l1.8-1.7-2-3.5-2.2 1.3-2-.9L13 3Z" />
      <circle cx="11" cy="11.5" r="3" />
    </svg>
  );
}
export function IconButton({
  name,
  onClick,
  children,
}: {
  name: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" className="icon-button" aria-label={name} title={name} onClick={onClick}>
      {children}
    </button>
  );
}
