import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Eye, Filter, MapPin, Monitor, Plus, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { PageShell } from '../components/PageShell';
import { activityPostCategories, mockActivityPosts } from '../data/mockActivityPosts';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import type { TranslationKey } from '../lib/i18n';
import { getShortErrorMessage } from '../lib/errorMessage';
import { getActivityPosts } from '../lib/activityBoardApi';
import type { ActivityPostWithAuthor } from '../types/activityBoard';
import { isDemoModeEnabled } from '../lib/demoSession';

function formatDate(value: string | null) {
  if (!value) return '未定';
  return new Intl.DateTimeFormat('ja-JP', { dateStyle: 'medium' }).format(new Date(value));
}

function getStatusLabel(status: string, t: (key: TranslationKey) => string) {
  if (status === 'closed') return t('board.closed');
  if (status === 'archived') return t('board.archived');
  return t('board.open');
}

function getStatusClass(status: string) {
  if (status === 'closed') return 'bg-slate-100 text-slate-600';
  if (status === 'archived') return 'bg-orange-50 text-orange-700';
  return 'bg-theme-main text-white';
}

function getModeLabel(mode: ActivityPostWithAuthor['mode']) {
  if (mode === 'online') return 'オンライン';
  if (mode === 'offline') return 'オフライン';
  return 'ハイブリッド';
}

export function ActivityBoardPage() {
  const { isAuthenticated, isSupabaseMode, user } = useAuth();
  const { t } = useLanguage();
  const [posts, setPosts] = useState<ActivityPostWithAuthor[]>(mockActivityPosts);
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const useSupabaseBoard = isSupabaseMode && isAuthenticated && !isDemoModeEnabled();
  const allTags = useMemo(() => [...new Set(posts.flatMap((post) => post.tags))].slice(0, 12), [posts]);

  useEffect(() => {
    let mounted = true;

    async function loadPosts() {
      if (!useSupabaseBoard) {
        setPosts(mockActivityPosts);
        setNotice('デモ表示では募集の一覧・詳細を確認できます。ログインすると募集を投稿できます。');
        return;
      }

      setLoading(true);
      setNotice('');
      try {
        const nextPosts = await getActivityPosts({ category: category || undefined, tag: tag || undefined });
        if (!mounted) return;
        setPosts(nextPosts);
      } catch (caughtError) {
        if (!mounted) return;
        setPosts([]);
        setNotice(getShortErrorMessage(caughtError, '募集情報の取得に失敗しました。時間を置いてもう一度お試しください。'));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadPosts();
    return () => {
      mounted = false;
    };
  }, [category, tag, useSupabaseBoard]);

  const visiblePosts = useSupabaseBoard
    ? posts
    : posts.filter((post) => (!category || post.category === category) && (!tag || post.tags.includes(tag)));

  function isOwnPost(post: ActivityPostWithAuthor) {
    return Boolean(useSupabaseBoard && user?.id && post.created_by === user.id);
  }

  return (
    <PageShell description={t('board.description')} eyebrow="Activity Board" title={t('board.title')}>
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px] leading-6 text-theme-muted">{t('board.intro')}</p>
        <Link className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-theme-yellow/80 via-theme-cyan/60 to-theme-sky/75 px-4 py-2.5 text-sm font-semibold text-theme-main-dark shadow-sm shadow-theme-sky/20 transition active:scale-[0.98] ${useSupabaseBoard ? '' : 'pointer-events-none opacity-50'}`} to="/board/new">
          <Plus size={16} />{t('board.createPost')}
        </Link>
        {!useSupabaseBoard ? <p className="w-full text-[13px] text-theme-muted">ログインすると募集を投稿できます。</p> : null}
      </Card>

      <div className="grid gap-2 text-sm font-medium sm:grid-cols-2">
        <Link className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-theme-border bg-theme-card px-3 py-2 text-theme-main-dark transition hover:bg-theme-accent-soft/70" to="/my-board"><UsersRound size={15} />{t('board.myPosts')}</Link>
        <Link className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-theme-border bg-theme-card px-3 py-2 text-theme-main-dark transition hover:bg-theme-accent-soft/70" to="/my-interests"><Eye size={15} />{t('board.myInterests')}</Link>
      </div>

      {notice ? <div className="rounded-[1.15rem] bg-theme-accent-soft/70 p-3 text-sm text-theme-text">{notice}</div> : null}

      <Card className="space-y-3">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-theme-main-dark"><Filter size={16} />フィルター</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold text-theme-text">
            <span>活動ジャンル</span>
            <select className="theme-input min-h-11 w-full rounded-xl border px-3.5 text-sm outline-none" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">すべて</option>
              {activityPostCategories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm font-semibold text-theme-text">
            <span>興味タグ</span>
            <select className="theme-input min-h-11 w-full rounded-xl border px-3.5 text-sm outline-none" value={tag} onChange={(event) => setTag(event.target.value)}>
              <option value="">すべて</option>
              {allTags.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
      </Card>

      <div className="space-y-4">
        {loading ? <Card className="text-sm font-bold text-theme-muted">募集を読み込んでいます...</Card> : null}
        {!loading && visiblePosts.length === 0 ? (
          <Card className="space-y-2 text-center">
            <p className="text-lg font-bold text-theme-text">まだ募集がありません</p>
            <p className="text-[15px] leading-6 text-theme-muted">やりたいことを、最初の募集にしてみる。</p>
          </Card>
        ) : null}
        {visiblePosts.map((post) => (
          <Card className="space-y-3" key={post.id}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Badge>{post.category}</Badge>
                <h2 className="mt-2 text-lg font-bold leading-tight text-theme-text">{post.title}</h2>
              </div>
              <Badge className={getStatusClass(post.status)}>{getStatusLabel(post.status, t)}</Badge>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-theme-muted">
              <span className="inline-flex items-center gap-1"><MapPin size={14} />{post.area || 'エリア未設定'}</span>
              <span className="inline-flex items-center gap-1"><Monitor size={14} />{getModeLabel(post.mode)}</span>
              <span className="inline-flex items-center gap-1"><UsersRound size={14} />{t('board.interested')} {post.interest_count}件</span>
              <span className="inline-flex items-center gap-1"><CalendarDays size={14} />{formatDate(post.created_at)}</span>
            </div>
            {post.room_id ? <p className="text-[13px] text-theme-main-dark">{t('board.fromRoom')}</p> : null}
            {isOwnPost(post) ? (
              <div className="flex flex-wrap items-center gap-2 rounded-xl bg-theme-accent-soft/60 p-3 text-[13px] font-medium text-theme-main-dark">
                <Badge className="bg-theme-main text-white">{t('board.myPosts')}</Badge>
                <span>{t('board.interested')} {post.interest_count}件</span>
                <Link className="underline decoration-2 underline-offset-4" to={`/board/${post.id}`}>{t('board.manage')}</Link>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-1.5">{post.tags.map((item) => <Badge key={item}>#{item}</Badge>)}</div>
            <div className="flex items-center justify-between gap-3 border-t border-theme-border pt-3">
              <span className="text-[13px] text-theme-muted">投稿者: {post.author?.name ?? 'ConnectBloomユーザー'}</span>
              <Link className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-theme-accent-soft px-4 py-2 text-sm font-semibold text-theme-main-dark transition hover:saturate-105" to={`/board/${post.id}`}>{t('board.viewDetails')}</Link>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
