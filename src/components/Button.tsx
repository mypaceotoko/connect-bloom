import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'border border-theme-border bg-theme-card text-theme-main-dark shadow-[0_1px_2px_rgba(16,42,67,0.04)] hover:border-theme-sky/50 hover:bg-theme-accent-soft/50',
  ghost: 'bg-transparent text-theme-main-dark hover:bg-theme-accent-soft/60',
  danger: 'border border-red-100 bg-red-50/80 text-red-600 hover:bg-red-100/80',
};

export function Button({ className, variant = 'primary', children, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold transition duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
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
