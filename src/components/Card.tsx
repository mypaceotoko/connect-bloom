import type { HTMLAttributes } from 'react';
import { cn } from '../lib/utils';

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return <div className={cn('rounded-2xl border border-theme-border bg-theme-card/95 p-5 shadow-[0_8px_24px_rgba(16,42,67,0.05)] backdrop-blur-sm', className)} {...props} />;
}
