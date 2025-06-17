import { ReactNode } from 'react';

interface ToggleButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  icon?: ReactNode;
  label?: string;
  controls: string;
}

export function ToggleButton({ isOpen, onToggle, icon, label = 'Toggle Navigation', controls }: ToggleButtonProps) {
  return (
    <button
      type="button"
      className="size-8 flex justify-center items-center gap-x-2 border border-gray-200 text-gray-800 hover:text-gray-500 rounded-lg focus:outline-hidden focus:text-gray-500 disabled:opacity-50 disabled:pointer-events-none dark:border-neutral-700 dark:text-neutral-200 dark:hover:text-neutral-500 dark:focus:text-neutral-500"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls={controls}
      aria-label={label}
      onClick={onToggle}
    >
      <span className="sr-only">{label}</span>
      {icon || (
        <svg
          className="shrink-0 size-4"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M15 3v18" />
          <path d="m8 9 3 3-3 3" />
        </svg>
      )}
    </button>
  );
}