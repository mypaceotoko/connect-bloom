import type { ReactNode } from 'react';
import { ArrowRight, CheckCircle2, Flower2, MapPin, Palette, Tags, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { PageShell } from '../components/PageShell';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { useTheme } from '../context/ThemeProvider';
import { useAppState } from '../hooks/useAppState';
import type { CurrentUserProfile } from '../types/user';

const tags = ['読書', '映画', '散歩', '料理', '花', 'カフェ', '旅行', '音楽'];
const steps = ['基本情報', '温度感', 'テーマ'];

export function OnboardingPage() {
  const navigate = useNavigate();
  const { currentUser, completeOnboarding } = useAppState();
  const { themeId } = useTheme();
  const [form, setForm] = useState({
    name: currentUser.name,
    age: String(currentUser.age),
    location: currentUser.location,
    occupation: currentUser.occupation,
    datingTemperature: currentUser.datingTemperature,
    interests: currentUser.interests,
  });
  const [error, setError] = useState('');

  function updateField(field: keyof typeof form, value: string | string[]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleTag(tag: string) {
    setForm((current) => ({
      ...current,
      interests: current.interests.includes(tag) ? current.interests.filter((interest) => interest !== tag) : [...current.interests, tag],
    }));
  }

  function handleComplete() {
    const age = Number(form.age);
    if (!form.name.trim() || !form.location.trim() || !form.datingTemperature || form.interests.length === 0 || Number.isNaN(age) || age < 18) {
      setError('表示名・年齢（18歳以上）・地域・温度感・趣味タグを入力してください。');
      return;
    }

    const profile: CurrentUserProfile = {
      ...currentUser,
      name: form.name.trim(),
      age,
      location: form.location.trim(),
      occupation: form.occupation.trim() || '自然体のプロフィール',
      datingTemperature: form.datingTemperature,
      interests: form.interests,
      themePreference: themeId,
    };

    completeOnboarding(profile);
    navigate('/home');
  }

  return (
    <PageShell description="入力内容はlocalStorageへ保存され、自分のプロフィールに反映されます。" eyebrow="First Bloom" title="はじめてのプロフィール">
      <Card className="flower-gradient border-0 p-1">
        <div className="rounded-[1.25rem] bg-theme-card/78 p-3.5 backdrop-blur">
          <div className="flex items-center gap-1.5 text-sm font-black text-theme-main-dark"><Flower2 size={18} />3ステップで、あなたらしい出会いの準備</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {steps.map((step, index) => (
              <div className="rounded-xl bg-theme-card/80 p-2.5 text-center" key={step}>
                <span className="mx-auto flex size-6 items-center justify-center rounded-full bg-theme-main text-xs font-black text-white">{index + 1}</span>
                <p className="mt-1.5 text-[10.5px] font-black text-theme-text">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {error ? <div className="rounded-[1.15rem] bg-red-50 p-3 text-sm font-bold text-red-600">{error}</div> : null}

      <Card className="space-y-4">
        <SectionTitle icon={<UserRound size={18} />} label="Step 1" title="基本情報" />
        <Input label="表示名" name="displayName" onChange={(event) => updateField('name', event.target.value)} placeholder="例：美桜" value={form.name} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="年齢" name="age" onChange={(event) => updateField('age', event.target.value)} placeholder="30" type="number" value={form.age} />
          <Input label="地域" name="location" onChange={(event) => updateField('location', event.target.value)} placeholder="東京都" value={form.location} />
        </div>
        <Input label="職業・雰囲気" name="occupation" onChange={(event) => updateField('occupation', event.target.value)} placeholder="例：編集者 / カフェ巡りが好き" value={form.occupation} />
      </Card>

      <Card className="space-y-4">
        <SectionTitle icon={<MapPin size={18} />} label="Step 2" title="出会いの温度感" />
        <label className="block space-y-2 text-sm font-semibold text-theme-text">
          <span>今の気持ちに近いもの</span>
          <select className="min-h-11 w-full rounded-xl border border-theme-main/20 bg-theme-card px-3.5 text-sm text-theme-text outline-none focus:border-theme-main focus:ring-4 focus:ring-theme-main/15" onChange={(event) => updateField('datingTemperature', event.target.value)} value={form.datingTemperature}>
            <option>ゆっくり会話から始めたい</option>
            <option>安心感があれば会ってみたい</option>
            <option>価値観が合えば前向きに進めたい</option>
          </select>
        </label>
        <div className="space-y-2.5">
          <p className="flex items-center gap-1.5 text-sm font-black"><Tags size={16} />趣味タグ</p>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => {
              const selected = form.interests.includes(tag);
              return <button className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${selected ? 'bg-theme-accent text-white' : 'bg-theme-background/80 text-theme-text'}`} key={tag} onClick={() => toggleTag(tag)} type="button">{tag}</button>;
            })}
          </div>
          <p className="text-xs leading-5 text-theme-muted">選んだタグはmy-profileに反映されます。</p>
        </div>
      </Card>

      <Card className="space-y-4">
        <SectionTitle icon={<Palette size={18} />} label="Step 3" title="テーマを選ぶ" />
        <p className="text-sm leading-6 text-theme-muted">テーマは既存のThemeProvider仕様を維持し、localStorageへ保存します。</p>
        <ThemeSwitcher />
        <Badge className="w-fit">現在のテーマ: {themeId}</Badge>
      </Card>

      <div className="sticky bottom-24 z-10 rounded-[1.25rem] border border-white/60 bg-theme-card/90 p-2.5 shadow-2xl shadow-theme-main/15 backdrop-blur">
        <Button className="w-full" onClick={handleComplete}>
          <CheckCircle2 size={16} />
          今日のご縁へ進む
          <ArrowRight size={16} />
        </Button>
      </div>
    </PageShell>
  );
}

function SectionTitle({ icon, label, title }: { icon: ReactNode; label: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-xl bg-theme-accent-soft text-theme-main-dark">{icon}</span>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-theme-main-dark">{label}</p>
        <h2 className="font-black text-theme-text">{title}</h2>
      </div>
    </div>
  );
}
