import type { HTMLAttributes } from 'react';
import { cn } from '../lib/utils';

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return <div className={cn('rounded-[1.4rem] border border-theme-border bg-theme-card/95 p-5 shadow-[var(--shadow-card)] backdrop-blur-sm', className)} {...props} />;
}
