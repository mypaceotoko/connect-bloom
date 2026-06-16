import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary: 'btn-primary bg-gradient-to-r from-theme-yellow/80 via-theme-cyan/60 to-theme-sky/75 text-theme-main-dark shadow-sm shadow-theme-sky/20 hover:saturate-105',
  secondary: 'border border-theme-border bg-theme-card text-theme-main-dark hover:bg-theme-accent-soft/70',
  ghost: 'bg-transparent text-theme-main-dark hover:bg-theme-accent-soft/70',
  danger: 'bg-red-50 text-red-600 hover:bg-red-100',
};

export function Button({ className, variant = 'primary', children, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
        variants[variant],
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
