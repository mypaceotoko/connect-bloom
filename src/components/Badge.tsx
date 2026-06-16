import type { HTMLAttributes } from 'react';
import { cn } from '../lib/utils';

type BadgeProps = HTMLAttributes<HTMLSpanElement>;

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-theme-border bg-theme-accent-soft/70 px-2.5 py-0.5 text-xs font-semibold text-theme-main-dark [&_svg]:size-3',
        className,
      )}
      {...props}
    />
  );
}
