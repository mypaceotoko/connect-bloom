import { Search } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { PageShell } from '../components/PageShell';
import { ProfileCard } from '../components/ProfileCard';
import { mockUsers } from '../data/mockUsers';
import { useAppState } from '../hooks/useAppState';

const filters = ['紹介経由', 'カフェ', '旅行', 'ゆっくり話したい', '東京近郊'];

export function DiscoverPage() {
  const { blockedUserIds } = useAppState();
  const visibleUsers = mockUsers.filter((user) => !blockedUserIds.includes(user.id));

  return (
    <PageShell description="検索条件はまだダミーです。タグで探せる雰囲気を先に実装しています。" eyebrow="Discover" title="ご縁を探す">
      <Card className="space-y-2.5">
        <Input label="キーワード" name="search" placeholder="趣味・地域で探す" />
        <div className="flex flex-wrap gap-1.5">
          {filters.map((filter) => <Badge key={filter}><Search size={12} />{filter}</Badge>)}
        </div>
      </Card>
      <div className="space-y-4">
        {visibleUsers.map((user) => <ProfileCard compact key={user.id} user={user} />)}
      </div>
    </PageShell>
  );
}
