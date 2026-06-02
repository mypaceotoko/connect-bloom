import { KeyRound, ShieldAlert, UsersRound } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { PageShell } from '../components/PageShell';
import { mockUsers } from '../data/mockUsers';
import { useAppState } from '../hooks/useAppState';

export function AdminPage() {
  const { blockedUserIds, reportedUserIds } = useAppState();
  const reportedUsers = mockUsers.filter((user) => reportedUserIds.includes(user.id));
  const adminCards = [
    { icon: KeyRound, title: '招待コード管理', count: '12件', body: '発行・利用状況・期限管理の土台です。' },
    { icon: UsersRound, title: 'ユーザー管理', count: `${mockUsers.length}人`, body: 'プロフィール確認とステータス管理のプレースホルダーです。' },
    { icon: ShieldAlert, title: '通報管理', count: `${reportedUserIds.length}件`, body: `ブロック ${blockedUserIds.length}件 / 通報 ${reportedUserIds.length}件のローカル集計です。` },
  ];

  return (
    <PageShell description="運営向け管理画面の土台です。認可・DB接続は未実装です。" eyebrow="Admin" title="管理画面">
      {adminCards.map((item) => {
        const Icon = item.icon;
        return <Card className="space-y-3" key={item.title}><div className="flex items-center justify-between"><span className="flex items-center gap-3"><span className="flex size-12 items-center justify-center rounded-2xl bg-theme-accent-soft text-theme-main-dark"><Icon size={22} /></span><span className="font-black">{item.title}</span></span><Badge>{item.count}</Badge></div><p className="text-sm leading-6 text-theme-muted">{item.body}</p></Card>;
      })}
      <Card className="space-y-2.5">
        <h2 className="font-black">通報済みユーザー（仮）</h2>
        {reportedUsers.length === 0 ? <p className="rounded-[1.15rem] bg-theme-background/70 p-3 text-sm leading-6 text-theme-muted">まだ通報はありません。プロフィールまたはDM画面の通報ボタンから反映されます。</p> : null}
        {reportedUsers.map((user) => (
          <div className="flex items-center gap-2.5 rounded-[1.15rem] bg-theme-accent-soft/45 p-2.5" key={user.id}>
            <span className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${user.gradient} font-black text-theme-main-dark`}>{user.name.slice(0, 1)}</span>
            <span className="min-w-0 flex-1"><span className="block font-bold">{user.name}</span><span className="block text-xs text-theme-muted">{user.location}</span></span>
            <Badge className="bg-red-50 text-red-600">通報済み</Badge>
          </div>
        ))}
      </Card>
    </PageShell>
  );
}
