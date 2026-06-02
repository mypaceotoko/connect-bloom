import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
};

export function Badge({ className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-theme-accent-soft px-2.5 py-0.5 text-[11px] font-semibold text-theme-text [&_svg]:size-3',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
