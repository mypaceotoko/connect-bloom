import { useEffect, useState } from 'react';
import { Bell, CalendarHeart, CheckCircle2, ClipboardList, Compass, DoorOpen, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PageShell } from '../components/PageShell';
import { ProfileCard } from '../components/ProfileCard';
import { mockUsers } from '../data/mockUsers';
import { useAppState } from '../hooks/useAppState';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { getSafetyHiddenUserIds } from '../lib/blockApi';
import { createLike, deleteLike, getLikedUserIds } from '../lib/likeApi';
import { getMatchedUserIds } from '../lib/matchApi';
import { safeGetUnreadNotificationCount } from '../lib/notificationApi';
import { isDemoModeEnabled } from '../lib/demoSession';
import { getSafeErrorLog } from '../lib/errorMessage';
import { attachPrimaryPhotoUrls, getPrimaryProfilePhotos } from '../lib/profilePhotoApi';
import { getPublicProfiles, profileRowToUserProfile } from '../lib/profileApi';
import type { UserProfile } from '../types/user';

export function HomePage() {
  const { blockedUserIds } = useAppState();
  const { isAuthenticated, isSupabaseMode, user } = useAuth();
  const { t } = useLanguage();
  const [supabaseUsers, setSupabaseUsers] = useState<UserProfile[]>([]);
  const [likedUserIds, setLikedUserIds] = useState<string[]>([]);
  const [matchedUserIds, setMatchedUserIds] = useState<string[]>([]);
  const [hiddenUserIds, setHiddenUserIds] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const location = useLocation();
  const homeState = location.state as { profileSaved?: boolean; message?: string } | null;
  const profileSaved = Boolean(homeState?.profileSaved);
  const profileSavedMessage = homeState?.message ?? 'プロフィールを保存しました。今日のつながりを見てみましょう。';
  const useSupabaseLikes = isSupabaseMode && isAuthenticated && !isDemoModeEnabled() && Boolean(user);
  const sourceUsers = useSupabaseLikes ? supabaseUsers : mockUsers;
  const safetyHiddenIds = useSupabaseLikes ? hiddenUserIds : blockedUserIds;
  const todaysUsers = sourceUsers.filter((profile) => !safetyHiddenIds.includes(profile.id)).slice(0, 3);

  useEffect(() => {
    let mounted = true;

    async function loadUnreadNotificationCount() {
      if (!useSupabaseLikes) {
        setUnreadNotificationCount(0);
        return;
      }

      try {
        const count = await safeGetUnreadNotificationCount();
        if (mounted) setUnreadNotificationCount(count);
      } catch (caughtError) {
        console.warn('[ConnectBloom] notification count fetch failed', getSafeErrorLog(caughtError, 'notification_count_fetch'));
        if (mounted) setUnreadNotificationCount(0);
      }
    }

    void loadUnreadNotificationCount();

    return () => {
      mounted = false;
    };
  }, [useSupabaseLikes]);

  useEffect(() => {
    let mounted = true;

    async function loadSupabaseLikes() {
      if (!useSupabaseLikes || !user) {
        setSupabaseUsers([]);
        setLikedUserIds([]);
        setMatchedUserIds([]);
        setHiddenUserIds([]);
        setNotice('');
        return;
      }

      setLoadingLikes(true);
      setNotice('');

      try {
        try {
          const profiles = await getPublicProfiles(user.id, 12);
          const usersWithFallbacks = profiles.map((profile) => profileRowToUserProfile(profile));
          const photosByUserId = await getPrimaryProfilePhotos(usersWithFallbacks.map((profile) => profile.id));

          if (!mounted) return;
          setSupabaseUsers(attachPrimaryPhotoUrls(usersWithFallbacks, photosByUserId));
        } catch (caughtError) {
          console.warn('[ConnectBloom] public profiles fetch failed', getSafeErrorLog(caughtError, 'public_profiles_fetch'));
          if (!mounted) return;
          setSupabaseUsers([]);
        }

        const [likedIds, matchedIds, nextHiddenUserIds] = await Promise.all([
          getLikedUserIds(user.id).catch((caughtError) => {
            console.warn('[ConnectBloom] failed to load sent likes', getSafeErrorLog(caughtError, 'sent_like_ids_load'));
            if (mounted) setNotice('話してみたい状態の取得に失敗しました。');
            return [];
          }),
          getMatchedUserIds(user.id).catch((caughtError) => {
            console.warn('[ConnectBloom] failed to load matched ids', getSafeErrorLog(caughtError, 'matched_ids_load'));
            return [];
          }),
          getSafetyHiddenUserIds(user.id).catch((caughtError) => {
            console.warn('[ConnectBloom] failed to load hidden user ids', getSafeErrorLog(caughtError, 'hidden_user_ids_load'));
            return [];
          }),
        ]);

        if (!mounted) return;
        setLikedUserIds(likedIds);
        setMatchedUserIds(matchedIds);
        setHiddenUserIds(nextHiddenUserIds);
      } finally {
        if (mounted) setLoadingLikes(false);
      }
    }

    void loadSupabaseLikes();

    return () => {
      mounted = false;
    };
  }, [useSupabaseLikes, user]);

  async function handleSupabaseLike(profileId: string, nextLiked: boolean) {
    if (!useSupabaseLikes) return false;

    try {
      if (nextLiked) {
        const likeResult = await createLike(profileId);
        setLikedUserIds((current) => current.includes(profileId) ? current : [...current, profileId]);
        if (likeResult.matched) {
          setMatchedUserIds((current) => current.includes(profileId) ? current : [...current, profileId]);
        }
        if (likeResult.matchCheckError) {
          setNotice(likeResult.matchCheckError);
        }
        return likeResult.matched;
      }

      await deleteLike(profileId);
      setLikedUserIds((current) => current.filter((id) => id !== profileId));
      return false;
    } catch (caughtError) {
      throw new Error(nextLiked ? '話してみたいの保存に失敗しました。' : '話してみたいの取り消しに失敗しました。', { cause: caughtError });
    }
  }

  return (
    <PageShell
      description={(
        <>
          <span className="block">{t('home.description1')}</span>
          <span className="block">{t('home.description2')}</span>
        </>
      )}
      eyebrow="Home"
      title={t('home.title')}
    >
      {profileSaved ? (
        <div className="rounded-2xl border border-theme-border bg-theme-accent-soft/50 p-3 text-sm font-medium text-theme-text">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="text-theme-link" size={16} />{profileSavedMessage}</span>
        </div>
      ) : null}

      {notice ? <div className="rounded-2xl border border-theme-border bg-theme-accent-soft/50 p-3 text-sm font-medium text-theme-text">{notice}</div> : null}

      {unreadNotificationCount > 0 ? (
        <Card className="flex items-center gap-3 border-theme-sky/40 bg-theme-accent-soft/50 py-4">
          <span className="btn-primary flex size-10 shrink-0 items-center justify-center rounded-2xl"><Bell size={18} /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold text-theme-text">新着の通知</span>
            <span className="block text-sm leading-6 text-theme-muted">参加希望・承認・DM {unreadNotificationCount}件</span>
          </span>
          <Link to="/notifications"><Button className="px-3" variant="secondary">見る</Button></Link>
        </Card>
      ) : null}

      <Card className="relative overflow-hidden">
        <span aria-hidden className="brand-hairline absolute inset-x-0 top-0 h-1" />
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-14 size-40 rounded-full bg-theme-yellow/35 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-10 size-44 rounded-full bg-theme-sky/30 blur-2xl" />
        <div className="relative space-y-4">
          <div>
            <Badge className="border-theme-yellow/60 bg-theme-yellow/25 text-theme-main-dark"><Sparkles size={13} />{t('home.next.badge')}</Badge>
            <h2 className="mt-3 text-xl font-bold leading-snug tracking-[-0.01em]">{t('home.next.title')}</h2>
            <p className="mt-1.5 text-[15px] leading-7 text-theme-muted">{t('home.next.description1')}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { to: '/discover', icon: Compass, label: t('home.findPeople') },
              { to: '/board', icon: ClipboardList, label: t('home.exploreBoards') },
              { to: '/rooms', icon: DoorOpen, label: t('home.joinRooms') },
              { to: '/my-activity', icon: Sparkles, label: t('home.checkActivity') },
            ].map(({ to, icon: Icon, label }) => (
              <Link
                className="flex items-center gap-2.5 rounded-2xl border border-theme-border bg-theme-card px-3 py-3 text-sm font-semibold text-theme-main-dark shadow-[0_1px_2px_rgba(16,42,67,0.04)] transition hover:border-theme-sky/50 hover:bg-theme-accent-soft/40 active:scale-[0.98]"
                key={to}
                to={to}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-theme-yellow/50 via-theme-cyan/20 to-theme-sky/50 text-theme-main-dark">
                  <Icon size={16} strokeWidth={1.9} />
                </span>
                <span className="min-w-0 leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-2 rounded-[1.4rem] border border-theme-border bg-theme-accent-soft/35 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-theme-text">{t('home.beta.title')}</span>
          <span className="mt-0.5 block text-[13px] leading-6 text-theme-muted">{t('home.beta.body')}</span>
        </span>
        <Link className="shrink-0 text-[13px] font-semibold text-theme-link underline decoration-theme-sky/60 decoration-2 underline-offset-4 transition hover:decoration-theme-link" to="/test-guide">{t('home.beta.guide')}</Link>
      </div>

      <div className="flex items-center justify-between px-1 pt-1">
        <span className="flex items-center gap-1.5 text-[15px] font-bold text-theme-text">
          <CalendarHeart className="text-theme-link" size={16} />
          今日の紹介 {todaysUsers.length}人
        </span>
        <span className="text-[13px] text-theme-muted">{loadingLikes ? '更新中' : '毎朝 7:00 更新'}</span>
      </div>

      <div className="space-y-4">
        {todaysUsers.map((profile) => (
          <ProfileCard compact isCurrentUser={profile.id === user?.id} key={profile.id} liked={useSupabaseLikes ? likedUserIds.includes(profile.id) : undefined} matched={useSupabaseLikes ? matchedUserIds.includes(profile.id) : undefined} onToggleLike={useSupabaseLikes ? handleSupabaseLike : undefined} user={profile} />
        ))}
      </div>
    </PageShell>
  );
}
