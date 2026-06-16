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
        <div className="space-y-1.5">
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-theme-main">{eyebrow}</p> : null}
          <h1 className="text-[1.75rem] font-bold leading-tight text-theme-text">{title}</h1>
          {description ? <p className="text-[15px] leading-7 text-theme-muted">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
