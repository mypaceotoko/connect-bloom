import type { ReactNode } from 'react';
import { Bell, Languages, Palette, ShieldCheck, UserRoundCheck } from 'lucide-react';
import { Card } from '../components/Card';
import { PageShell } from '../components/PageShell';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { useTheme } from '../context/ThemeProvider';

export function SettingsPage() {
  const { currentTheme } = useTheme();

  return (
    <PageShell description="テーマ設定のみlocalStorageへ保存します。他は将来実装のプレースホルダーです。" eyebrow="Settings" title="設定">
      <Card className="flower-gradient border-0 p-1">
        <div className="rounded-[1.25rem] bg-theme-card/78 p-3.5 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-theme-main text-white"><Palette size={18} /></span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-theme-main-dark">Current theme</p>
              <h2 className="text-lg font-black text-theme-text">{currentTheme.name}</h2>
            </div>
          </div>
          <p className="mt-2 text-[13px] leading-5 text-theme-muted">Natural / Sakura / Mint / Lavender / Night の5テーマを切り替えて、アプリの雰囲気を確認できます。</p>
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-sm font-black">テーマカラー</h2>
        <ThemeSwitcher />
      </Card>

      <Placeholder icon={<Languages size={18} />} title="言語設定" body="日本語 / 英語切り替えは将来実装予定です。" />
      <Placeholder icon={<Bell size={18} />} title="通知設定" body="マッチ・メッセージ通知の設定を次フェーズ以降に追加します。" />
      <Placeholder icon={<UserRoundCheck size={18} />} title="紹介者表示設定" body="紹介者名の表示範囲をユーザー設定として保存できるようにします。" />
      <Placeholder icon={<ShieldCheck size={18} />} title="安全設定" body="本人確認・年齢確認は次フェーズ以降の検討項目です。今回はUIのみです。" />
    </PageShell>
  );
}

function Placeholder({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <Card className="flex gap-2.5 bg-theme-card/86 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-theme-accent-soft text-theme-main-dark">{icon}</span>
      <span>
        <span className="block text-sm font-black">{title}</span>
        <span className="mt-0.5 block text-xs leading-5 text-theme-muted">{body}</span>
      </span>
    </Card>
  );
}
