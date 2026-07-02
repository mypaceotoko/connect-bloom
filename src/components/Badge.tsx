import type { HTMLAttributes } from 'react';
import { cn } from '../lib/utils';

type BadgeProps = HTMLAttributes<HTMLSpanElement>;

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-theme-border/80 bg-theme-accent-soft/50 px-2.5 py-1 text-xs font-medium leading-none text-theme-main-dark [&_svg]:size-3',
        className,
      )}
      {...props}
    />
  );
}
