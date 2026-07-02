import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-theme-border/80 bg-theme-card/90 px-4 py-2 shadow-[0_8px_24px_-16px_rgba(16,42,67,0.25)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        <Link aria-label="ホームへ戻る" className="logo-plate min-w-0 overflow-hidden px-2 py-1" to="/home">
          <BrandLogo
            className="w-full max-w-[184px]"
            imageClassName="max-h-11 drop-shadow-none"
            variant="default"
          />
        </Link>
        <Link
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-theme-border bg-theme-card px-3.5 py-1.5 text-xs font-semibold text-theme-main-dark transition hover:border-theme-sky/50 hover:bg-theme-accent-soft/50"
          to="/safety"
        >
          <ShieldCheck className="text-theme-link" size={14} />
          安心ガイド
        </Link>
      </div>
    </header>
  );
}
