import { MessageCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PageShell } from '../components/PageShell';
import { mockUsers } from '../data/mockUsers';
import { useAppState } from '../hooks/useAppState';

export function MatchesPage() {
  const { matchedUserIds } = useAppState();
  const matchedUsers = mockUsers.filter((user) => matchedUserIds.includes(user.id));

  return (
    <PageShell description="相互いいねで咲いたご縁を表示し、DMデモへ進めます。" eyebrow="Matches" title="マッチ">
      <Card className="space-y-2.5">
        {matchedUsers.length === 0 ? <p className="rounded-[1.15rem] bg-theme-background/70 p-3 text-sm leading-6 text-theme-muted">まだマッチはありません。もらったいいねの相手にいいねすると「ご縁が咲きました」の演出が表示されます。</p> : null}
        {matchedUsers.map((user) => (
          <div className="flex items-center gap-2.5 rounded-[1.15rem] bg-theme-accent-soft/45 p-2.5" key={user.id}>
            <span className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${user.gradient} text-xl font-black text-theme-main-dark`}>{user.name.slice(0, 1)}</span>
            <span className="min-w-0 flex-1"><span className="block font-black">{user.name}</span><span className="block text-xs leading-5 text-theme-muted">紹介のご縁からマッチしました</span></span>
            <Badge className="bg-theme-accent text-white"><Sparkles size={12} />ご縁</Badge>
            <Link to={`/messages/${user.id}`}><Button className="min-h-10 px-3 py-2"><MessageCircle size={16} /></Button></Link>
          </div>
        ))}
      </Card>
    </PageShell>
  );
}
