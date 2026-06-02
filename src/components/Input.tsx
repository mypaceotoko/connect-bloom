import type { InputHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ className, label, id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block space-y-2 text-sm font-semibold text-theme-text" htmlFor={inputId}>
      {label ? <span>{label}</span> : null}
      <input
        className={cn(
          'theme-input min-h-12 w-full rounded-2xl border px-4 outline-none transition',
          className,
        )}
        id={inputId}
        {...props}
      />
    </label>
  );
}
