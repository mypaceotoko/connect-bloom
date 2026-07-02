import { ClipboardList, Compass, Home, MessagesSquare, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/home', label: 'ホーム', icon: Home },
  { to: '/discover', label: '探す', icon: Compass },
  { to: '/board', label: '募集', icon: ClipboardList },
  { to: '/rooms', label: 'ルーム', icon: MessagesSquare },
  { to: '/settings', label: '設定', icon: Settings },
];

function scrollToPageTop() {
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });
}

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-1.5">
      <div className="bottom-nav-shell mx-auto grid max-w-md grid-cols-5 gap-1 rounded-[1.5rem] border border-theme-border/80 p-1.5 backdrop-blur-xl">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'bottom-nav-link flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-[1.05rem] px-1 text-[11px] font-medium text-theme-muted transition active:scale-[0.97]',
                  isActive && 'bottom-nav-link-active bg-theme-accent-soft/60 font-semibold text-theme-main-dark',
                )
              }
              key={item.to}
              onClick={scrollToPageTop}
              to={item.to}
            >
              {({ isActive }) => (
                <>
                  <span className={cn('bottom-nav-icon flex size-6 items-center justify-center rounded-full transition', isActive && 'bottom-nav-icon-active btn-primary shadow-none')}>
                    <Icon size={16} strokeWidth={isActive ? 2.2 : 1.9} />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
