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
        <div className="rounded-[1.15rem] bg-theme-accent-soft/70 p-3 text-sm font-bold text-theme-text">
          <span className="flex items-center gap-1.5"><CheckCircle2 size={16} />{profileSavedMessage}</span>
        </div>
      ) : null}

      {notice ? <div className="rounded-[1.15rem] bg-theme-accent-soft/70 p-3 text-sm font-bold text-theme-text">{notice}</div> : null}

      {unreadNotificationCount > 0 ? (
        <Card className="flex items-center gap-3 border-theme-main/15 bg-cyan-50/70 py-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-theme-main text-white"><Bell size={18} /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold text-theme-text">新着の通知</span>
            <span className="block text-sm leading-6 text-theme-muted">参加希望・承認・DM {unreadNotificationCount}件</span>
          </span>
          <Link to="/notifications"><Button className="px-3" variant="secondary">見る</Button></Link>
        </Card>
      ) : null}

      <Card className="flower-gradient relative overflow-hidden border-0 p-1">
        <div className="absolute -right-8 -top-8 size-28 rounded-full bg-white/30" />
        <div className="absolute -bottom-10 left-8 size-24 rounded-full bg-theme-accent-soft/50 blur-2xl" />
        <div className="home-next-panel relative space-y-4 rounded-[1.25rem] bg-theme-card/82 p-5 backdrop-blur">
          <div>
            <Badge className="bg-theme-main text-white"><Sparkles size={13} />{t('home.next.badge')}</Badge>
            <h2 className="mt-3 text-xl font-bold leading-tight">{t('home.next.title')}</h2>
            <p className="mt-1.5 text-[15px] leading-7 text-theme-muted">{t('home.next.description1')}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/discover"><Button className="w-full px-3"><Compass size={16} />{t('home.findPeople')}</Button></Link>
            <Link to="/board"><Button className="w-full px-3" variant="secondary"><ClipboardList size={16} />{t('home.exploreBoards')}</Button></Link>
            <Link to="/rooms"><Button className="w-full px-3" variant="secondary"><DoorOpen size={16} />{t('home.joinRooms')}</Button></Link>
            <Link to="/my-activity"><Button className="w-full px-3" variant="secondary"><Sparkles size={16} />{t('home.checkActivity')}</Button></Link>
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-3 border-theme-main/15 bg-theme-card/86 sm:flex-row sm:items-center sm:justify-between">
        <span className="min-w-0">
          <span className="block text-[15px] font-semibold text-theme-text">{t('home.beta.title')}</span>
          <span className="mt-1 block text-sm leading-6 text-theme-muted">{t('home.beta.body')}</span>
        </span>
        <Link className="shrink-0" to="/test-guide"><Button className="w-full px-3 sm:w-auto" variant="secondary">{t('home.beta.guide')}</Button></Link>
      </Card>

      <div className="home-today-summary flex items-center justify-between rounded-full border border-theme-border bg-theme-card/84 px-4 py-2.5 backdrop-blur">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-theme-main-dark">
          <CalendarHeart size={16} />
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
