import { CalendarHeart, Flower2, HeartHandshake, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { PageShell } from '../components/PageShell';
import { ProfileCard } from '../components/ProfileCard';
import { mockUsers } from '../data/mockUsers';

export function HomePage() {
  const todaysUsers = mockUsers.slice(0, 3);

  return (
    <PageShell description="ログイン後のホームでは、大量に選ぶのではなく、今日向き合いやすい少人数のご縁だけを丁寧に紹介します。" eyebrow="Home" title="今日のご縁">
      <Card className="flower-gradient relative overflow-hidden border-0 p-1">
        <div className="absolute -right-8 -top-8 size-28 rounded-full bg-white/30" />
        <div className="absolute -bottom-10 left-8 size-24 rounded-full bg-theme-accent-soft/50 blur-2xl" />
        <div className="relative rounded-[1.25rem] bg-theme-card/78 p-4 backdrop-blur">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-theme-main text-white"><Sparkles size={13} />Phase 1.5 UI Demo</Badge>
            <Badge className="bg-theme-card/80"><ShieldCheck size={13} />ログイン後ホーム</Badge>
          </div>
          <h2 className="mt-3 text-[1.35rem] font-black leading-tight tracking-[-0.03em]">1日数人だけ。<br />花束のように届く、今日の出会い。</h2>
          <p className="mt-2.5 text-[13px] leading-6 text-theme-muted">
            紹介経由の安心感、共通点、出会いの温度感が伝わるように、プロフィールをゆっくり読める体験にしています。
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-bold text-theme-text">
            <span className="rounded-xl bg-theme-background/80 p-2.5"><Flower2 className="mx-auto mb-1 text-theme-main" size={16} />自然体</span>
            <span className="rounded-xl bg-theme-background/80 p-2.5"><HeartHandshake className="mx-auto mb-1 text-theme-main" size={16} />温度感</span>
            <span className="rounded-xl bg-theme-background/80 p-2.5"><UsersRound className="mx-auto mb-1 text-theme-main" size={16} />紹介経由</span>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between rounded-full bg-theme-card/70 px-3.5 py-2.5 shadow-sm backdrop-blur">
        <span className="flex items-center gap-1.5 text-[13px] font-black text-theme-main-dark">
          <CalendarHeart size={16} />
          今日の紹介 {todaysUsers.length}人
        </span>
        <span className="text-xs font-bold text-theme-muted">毎朝 7:00 更新</span>
      </div>

      <div className="space-y-4">
        {todaysUsers.map((user) => <ProfileCard compact key={user.id} user={user} />)}
      </div>
    </PageShell>
  );
}
