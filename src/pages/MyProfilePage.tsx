import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { PageShell } from '../components/PageShell';
import { currentUser } from '../data/mockUsers';

export function MyProfilePage() {
  return (
    <PageShell description="自分のプロフィール確認・編集風UIです。保存処理は未実装です。" eyebrow="My Profile" title="自分のプロフィール">
      <Card className="space-y-3.5">
        <div className="flower-gradient flex h-36 items-center justify-center rounded-[1.15rem]">
          <span className="flex size-20 items-center justify-center rounded-[1.45rem] bg-white/80 text-3xl font-black text-theme-main-dark">自</span>
        </div>
        <Input defaultValue={currentUser.name} label="表示名" name="myName" />
        <div className="grid grid-cols-2 gap-3"><Input defaultValue={currentUser.age} label="年齢" name="myAge" type="number" /><Input defaultValue={currentUser.location} label="地域" name="myLocation" /></div>
        <Input defaultValue={currentUser.occupation} label="職業" name="myOccupation" />
        <div className="rounded-[1.15rem] bg-theme-accent-soft/60 p-3.5 text-[13px] leading-5">{currentUser.bio}</div>
        <div className="flex flex-wrap gap-1.5">{currentUser.interests.map((interest) => <Badge key={interest}>{interest}</Badge>)}</div>
        <Button className="w-full">編集内容を保存（デモ）</Button>
      </Card>
    </PageShell>
  );
}
