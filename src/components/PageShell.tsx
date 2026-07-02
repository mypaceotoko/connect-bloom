import type { ReactNode } from 'react';
import { BackToSettingsLink } from './BackToSettingsLink';

type PageShellProps = {
  title?: string;
  eyebrow?: string;
  description?: ReactNode;
  children: ReactNode;
};

export function PageShell({ title, eyebrow, description, children }: PageShellProps) {
  return (
    <section className="space-y-5 px-4 pb-[calc(var(--bottom-nav-safe-space)+env(safe-area-inset-bottom))] pt-4">
      <BackToSettingsLink />
      {title ? (
        <div className="space-y-1.5 pt-1">
          {eyebrow ? (
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-theme-link">
              <span aria-hidden className="inline-block size-1.5 rounded-full bg-theme-yellow ring-1 ring-theme-main-dark/10" />
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-[1.65rem] font-bold leading-tight tracking-[-0.01em] text-theme-text">{title}</h1>
          {description ? <p className="max-w-prose text-[15px] leading-7 text-theme-muted">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
