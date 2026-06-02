import { useState } from 'react';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { PageShell } from '../components/PageShell';
import { useTheme } from '../context/ThemeProvider';
import { useAppState } from '../hooks/useAppState';

export function MyProfilePage() {
  const { currentUser, saveCurrentUserProfile } = useAppState();
  const { themeId } = useTheme();
  const [form, setForm] = useState({
    name: currentUser.name,
    age: String(currentUser.age),
    location: currentUser.location,
    occupation: currentUser.occupation,
    bio: currentUser.bio,
    datingTemperature: currentUser.datingTemperature,
    interestsText: currentUser.interests.join('、'),
  });
  const [notice, setNotice] = useState('');

  function handleSave() {
    const age = Number(form.age);
    if (!form.name.trim() || Number.isNaN(age) || age < 18 || !form.location.trim()) {
      setNotice('表示名・18歳以上の年齢・地域を入力してください。');
      return;
    }

    saveCurrentUserProfile({
      ...currentUser,
      name: form.name.trim(),
      age,
      location: form.location.trim(),
      occupation: form.occupation.trim(),
      bio: form.bio.trim(),
      datingTemperature: form.datingTemperature,
      interests: form.interestsText.split(/[、,]/).map((interest) => interest.trim()).filter(Boolean),
      themePreference: themeId,
    });
    setNotice('編集内容をlocalStorageに保存しました。');
  }

  return (
    <PageShell description="オンボーディングや編集で保存した自分のプロフィールを表示します。" eyebrow="My Profile" title="自分のプロフィール">
      <Card className="space-y-3.5">
        {notice ? <div className="rounded-[1.15rem] bg-theme-accent-soft/70 p-3 text-sm font-bold text-theme-text">{notice}</div> : null}
        <div className="flower-gradient flex h-36 items-center justify-center rounded-[1.15rem]">
          <span className="flex size-20 items-center justify-center rounded-[1.45rem] bg-white/80 text-3xl font-black text-theme-main-dark">{form.name.slice(0, 1) || '自'}</span>
        </div>
        <Input label="表示名" name="myName" onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} value={form.name} />
        <div className="grid grid-cols-2 gap-3"><Input label="年齢" name="myAge" onChange={(event) => setForm((current) => ({ ...current, age: event.target.value }))} type="number" value={form.age} /><Input label="地域" name="myLocation" onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} value={form.location} /></div>
        <Input label="職業" name="myOccupation" onChange={(event) => setForm((current) => ({ ...current, occupation: event.target.value }))} value={form.occupation} />
        <label className="block space-y-2 text-sm font-semibold text-theme-text">
          <span>自己紹介</span>
          <textarea className="min-h-24 w-full rounded-xl border border-theme-main/20 bg-theme-card px-3.5 py-3 text-sm text-theme-text outline-none focus:border-theme-main focus:ring-4 focus:ring-theme-main/15" onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} value={form.bio} />
        </label>
        <Input label="出会いの温度感" name="myDatingTemperature" onChange={(event) => setForm((current) => ({ ...current, datingTemperature: event.target.value }))} value={form.datingTemperature} />
        <Input label="趣味タグ（読点区切り）" name="myInterests" onChange={(event) => setForm((current) => ({ ...current, interestsText: event.target.value }))} value={form.interestsText} />
        <div className="flex flex-wrap gap-1.5">{form.interestsText.split(/[、,]/).map((interest) => interest.trim()).filter(Boolean).map((interest) => <Badge key={interest}>{interest}</Badge>)}</div>
        <Button className="w-full" onClick={handleSave}>編集内容を保存（デモ）</Button>
      </Card>
    </PageShell>
  );
}
