import { useState, type ReactNode } from 'react';
import { Check, ChevronDown, Moon, Palette } from 'lucide-react';
import { useTheme, type ThemeDefinition, type ThemeId } from '../context/ThemeProvider';
import { cn } from '../lib/utils';

export function ThemeSwitcher() {
  const { themeId, currentTheme, setThemeId, themes } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const chooseTheme = (nextThemeId: ThemeId) => {
    setThemeId(nextThemeId);
    setExpanded(false);
  };

  return (
    <div className="space-y-3">
      <button
        aria-expanded={expanded}
        className="w-full rounded-[1.5rem] border border-theme-main/15 bg-theme-card p-4 text-left shadow-sm shadow-theme-main/5 transition active:scale-[0.99]"
        onClick={() => setExpanded((isExpanded) => !isExpanded)}
        type="button"
      >
        <ThemeCardContent
          selected
          theme={currentTheme}
          trailing={(
            <span className="flex shrink-0 items-center gap-2 rounded-full border border-theme-main/20 bg-theme-background/70 px-3 py-2 text-xs font-black text-theme-main-dark">
              変更
              <ChevronDown className={cn('transition', expanded ? 'rotate-180' : '')} size={16} />
            </span>
          )}
        />
      </button>

      {expanded ? (
        <div className="grid gap-3">
          {themes.map((theme) => {
            const selected = themeId === theme.id;

            return (
              <button
                className={cn(
                  'w-full rounded-[1.5rem] border bg-theme-card p-4 text-left transition active:scale-[0.99]',
                  selected ? 'border-theme-main shadow-lg shadow-theme-main/10 ring-4 ring-theme-main/10' : 'border-theme-main/15 hover:border-theme-main/35',
                )}
                key={theme.id}
                onClick={() => chooseTheme(theme.id)}
                type="button"
              >
                <ThemeCardContent selected={selected} theme={theme} />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

type ThemeCardContentProps = {
  selected: boolean;
  theme: ThemeDefinition;
  trailing?: ReactNode;
};

function ThemeCardContent({ selected, theme, trailing }: ThemeCardContentProps) {
  return (
    <span className="flex items-center gap-3">
      <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-theme-main/10" style={{ backgroundColor: theme.colors.background }}>
        <span className="absolute -left-2 top-1 size-8 rounded-full" style={{ backgroundColor: theme.colors.accentSoft }} />
        <span className="absolute right-1 top-2 size-7 rounded-full" style={{ backgroundColor: theme.colors.main }} />
        <span className="absolute bottom-1 left-4 size-6 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
        {theme.id === 'night' ? <Moon className="relative text-white" size={18} /> : <Palette className="relative text-white drop-shadow" size={18} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="block text-sm font-black text-theme-text">{theme.name}</span>
          {selected ? <span className="rounded-full bg-theme-main px-2 py-0.5 text-[10px] font-black text-white">選択中</span> : null}
        </span>
        <span className="mt-1 block text-xs leading-5 text-theme-muted">{theme.description}</span>
        <span className="mt-3 flex gap-1.5">
          {[theme.colors.main, theme.colors.mainDark, theme.colors.accent, theme.colors.accentSoft, theme.colors.background].map((color) => (
            <span className="size-5 rounded-full border border-theme-main/10" key={color} style={{ backgroundColor: color }} />
          ))}
        </span>
      </span>
      {trailing ?? (
        <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full border', selected ? 'border-theme-main bg-theme-main text-white' : 'border-theme-main/20 text-transparent')}>
          <Check size={18} />
        </span>
      )}
    </span>
  );
}
