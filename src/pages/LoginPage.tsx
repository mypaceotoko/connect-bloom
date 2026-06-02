import { Flower2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <section className="flex min-h-screen items-center px-4 py-8">
      <div className="mx-auto w-full max-w-md space-y-4">
        <Link className="inline-flex items-center gap-2 text-theme-main-dark" to="/">
          <Flower2 size={24} />
          <span className="font-black">EnBloom</span>
        </Link>
        <Card className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-theme-main-dark">Welcome</p>
            <h1 className="text-xl font-black">招待されたご縁から始める</h1>
            <p className="text-[13px] leading-5 text-theme-muted">Googleログインと招待コード入力の見た目だけを用意しています。</p>
          </div>
          <Button className="w-full bg-white text-theme-text ring-1 ring-theme-main/15" variant="ghost">
            <span className="flex size-5 items-center justify-center rounded-full bg-theme-accent text-white text-xs font-black">G</span>
            Googleでログイン（デモ）
          </Button>
          <Input label="招待コード" name="inviteCode" placeholder="ENBLOOM-XXXX" />
          <Button className="w-full" onClick={() => navigate('/onboarding')}>
            デモで始める
          </Button>
          <Button className="w-full" onClick={() => navigate('/home')} variant="secondary">
            オンボーディングをスキップ
          </Button>
        </Card>
      </div>
    </section>
  );
}
