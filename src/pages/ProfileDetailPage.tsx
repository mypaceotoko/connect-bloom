import type { ReactNode } from 'react';
import { Ban, Flag, Heart, Leaf, MapPin, MessageCircleHeart, MessageCircle, ShieldCheck, Sparkles, UserRoundCheck } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PageShell } from '../components/PageShell';
import { mockUsers } from '../data/mockUsers';
import { useAppState } from '../hooks/useAppState';

export function ProfileDetailPage() {
  const { id } = useParams();
  const user = mockUsers.find((mockUser) => mockUser.id === id);
  const { blockUser, isLiked, isMatched, isReported, reportUser, toggleLike } = useAppState();
  const [notice, setNotice] = useState('');

  if (!user) {
    return <Navigate replace to="/discover" />;
  }

  const profileUser = user;
  const liked = isLiked(profileUser.id);
  const matched = isMatched(profileUser.id);
  const reported = isReported(profileUser.id);

  function handleLike() {
    const becameMatched = toggleLike(profileUser.id);
    setNotice(becameMatched ? 'ご縁が咲きました。メッセージを送ってみましょう。' : liked ? 'いいねを取り消しました。' : 'いいねを送りました。');
  }

  function handleBlock() {
    blockUser(profileUser.id);
    setNotice(`${profileUser.name}さんをブロックしました。今日のご縁や一覧には表示されません。`);
  }

  function handleReport() {
    reportUser(profileUser.id);
    setNotice('通報を受け付けました。運営確認用の仮一覧に反映されます。');
  }

  return (
    <PageShell eyebrow="Profile" title={`${profileUser.name}さんを知る`}>
      <Card className="overflow-hidden p-0">
        <div className={`relative h-72 overflow-hidden bg-gradient-to-br ${profileUser.gradient}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.86),transparent_28%),radial-gradient(circle_at_78%_76%,rgba(255,255,255,0.45),transparent_25%)]" />
          <Badge className="absolute left-4 top-4 border border-white/70 bg-white/75 backdrop-blur"><Sparkles size={13} />今日のご縁</Badge>
          <div className="absolute bottom-4 left-4 right-4 rounded-[1.45rem] bg-theme-card/78 p-3.5 shadow-xl shadow-theme-main/10 backdrop-blur">
            <div className="flex items-end gap-3">
              <div className="flex size-20 shrink-0 items-center justify-center rounded-[1.45rem] border border-white/80 bg-white/70 text-2xl font-black text-theme-main-dark shadow-lg">
                {profileUser.name.slice(0, 1)}
              </div>
              <div className="min-w-0 pb-1">
                <h1 className="text-2xl font-black leading-none text-theme-text">{profileUser.name} <span className="text-sm text-theme-muted">{profileUser.age}</span></h1>
                <p className="mt-1.5 flex items-center gap-1 text-[13px] font-bold text-theme-muted"><MapPin size={14} />{profileUser.location}</p>
                <p className="mt-1 flex items-center gap-1 text-[13px] font-bold text-theme-main-dark"><Leaf size={14} />{profileUser.occupation}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4">
          {notice ? (
            <div className="rounded-[1.15rem] border border-theme-accent/30 bg-theme-accent-soft/80 p-3 text-center text-sm font-black text-theme-text">
              {notice}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            <Badge><UserRoundCheck size={13} />{profileUser.introducedBy} からの紹介</Badge>
            <Badge className="bg-theme-background"><ShieldCheck size={13} />安心して進める</Badge>
            {matched ? <Badge className="bg-theme-accent text-white">マッチ済み</Badge> : null}
          </div>

          <p className="rounded-[1.15rem] bg-theme-background/70 p-3.5 text-[13px] leading-6 text-theme-text">{profileUser.bio}</p>

          <div className="space-y-2">
            <p className="text-sm font-black">趣味・共通点のきっかけ</p>
            <div className="flex flex-wrap gap-1.5">{profileUser.interests.map((interest) => <Badge className="bg-theme-accent-soft/80" key={interest}>{interest}</Badge>)}</div>
          </div>

          <InfoBlock icon={<MessageCircleHeart size={17} />} title="出会いの温度感" body={profileUser.datingTemperature} />
          <InfoBlock icon={<Heart size={17} />} title="関係性の希望" body={profileUser.relationshipGoal} />

          <div className="sticky bottom-24 z-10 space-y-2 rounded-[1.25rem] border border-white/60 bg-theme-card/88 p-2.5 shadow-2xl shadow-theme-main/15 backdrop-blur">
            <Button className={`w-full ${liked ? 'bg-theme-accent text-white shadow-theme-accent/25 hover:bg-theme-accent/90' : 'bg-theme-accent-soft text-theme-text'}`} onClick={handleLike} variant="secondary">
              <Heart fill={liked ? 'currentColor' : 'none'} size={16} />{liked ? 'いいね済み' : 'いいねを送る'}
            </Button>
            {matched ? <Link to={`/messages/${profileUser.id}`}><Button className="w-full"><MessageCircle size={16} />メッセージを送る</Button></Link> : null}
            <p className="text-center text-xs font-bold text-theme-muted">ローカルstate / localStorageのみで動くデモです。</p>
          </div>

          <Card className="space-y-2.5 bg-theme-background/65 p-3.5 shadow-none">
            <div className="flex items-center gap-2 text-[13px] font-black text-theme-text"><ShieldCheck size={15} />安全のための操作</div>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleBlock} variant="ghost"><Ban size={15} />ブロック</Button>
              <Button onClick={handleReport} variant="danger"><Flag size={15} />{reported ? '通報済み' : '通報'}</Button>
            </div>
          </Card>
        </div>
      </Card>
    </PageShell>
  );
}

function InfoBlock({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-[1.15rem] border border-theme-main/10 bg-theme-accent-soft/65 p-3.5">
      <p className="flex items-center gap-1.5 text-sm font-black text-theme-text">{icon}{title}</p>
      <p className="mt-1.5 text-[13px] leading-5 text-theme-muted">{body}</p>
    </div>
  );
}
