import { Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { PageShell } from '../components/PageShell';
import { mockUsers } from '../data/mockUsers';
import { useAppState } from '../hooks/useAppState';
import type { UserProfile } from '../types/user';

export function LikesPage() {
  const { likedUserIds, receivedLikeUserIds } = useAppState();
  const sent = mockUsers.filter((user) => likedUserIds.includes(user.id));
  const received = mockUsers.filter((user) => receivedLikeUserIds.includes(user.id));

  return (
    <PageShell description="送ったいいねと、相手から届いている風のダミーいいねをlocalStorage状態で表示します。" eyebrow="Likes" title="いいね">
      <LikeSection title="もらったいいね" users={received} />
      <LikeSection emptyText="まだ送ったいいねはありません。今日のご縁から気になる人に送ってみましょう。" title="送ったいいね" users={sent} />
    </PageShell>
  );
}

function LikeSection({ emptyText = '相互いいね候補です。いいねするとマッチ演出が出ます。', title, users }: { emptyText?: string; title: string; users: UserProfile[] }) {
  return (
    <Card className="space-y-2.5">
      <h2 className="font-black">{title}</h2>
      {users.length === 0 ? <p className="rounded-[1.15rem] bg-theme-background/70 p-3 text-sm leading-6 text-theme-muted">{emptyText}</p> : null}
      {users.map((user) => (
        <Link className="flex items-center gap-2.5 rounded-[1.15rem] bg-theme-accent-soft/45 p-2.5 transition hover:bg-theme-accent-soft/70" key={user.id} to={`/profile/${user.id}`}>
          <span className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${user.gradient} font-black text-theme-main-dark`}>{user.name.slice(0, 1)}</span>
          <span className="min-w-0 flex-1"><span className="block font-bold">{user.name}</span><span className="block text-xs text-theme-muted">{user.location}</span></span>
          <Badge><Heart size={12} />Like</Badge>
          <Badge className="bg-theme-accent text-white"><Sparkles size={12} />相互候補</Badge>
        </Link>
      ))}
    </Card>
  );
}
