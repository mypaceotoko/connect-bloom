import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { PageShell } from '../components/PageShell';
import { ProfileCard } from '../components/ProfileCard';
import { mockUsers } from '../data/mockUsers';
import { useAppState } from '../hooks/useAppState';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { getSafetyHiddenUserIds } from '../lib/blockApi';
import { createLike, deleteLike, getLikedUserIds } from '../lib/likeApi';
import { getMatchedUserIds } from '../lib/matchApi';
import { isDemoModeEnabled } from '../lib/demoSession';
import { getSafeErrorLog } from '../lib/errorMessage';
import { attachPrimaryPhotoUrls, getPrimaryProfilePhotos } from '../lib/profilePhotoApi';
import { getPublicProfiles, profileRowToUserProfile } from '../lib/profileApi';
import type { UserProfile } from '../types/user';

const filters = [
  { labelKey: 'discover.filter.introduction', value: '紹介経由' },
  { labelKey: 'discover.filter.cafe', value: 'カフェ' },
  { labelKey: 'discover.filter.travel', value: '旅行' },
  { labelKey: 'discover.filter.slow', value: 'ゆっくり話したい' },
  { labelKey: 'discover.filter.tokyo', value: '東京近郊' },
] as const;

export function DiscoverPage() {
  const { blockedUserIds } = useAppState();
  const { isAuthenticated, isSupabaseMode, user } = useAuth();
  const { t } = useLanguage();
  const [supabaseUsers, setSupabaseUsers] = useState<UserProfile[]>([]);
  const [likedUserIds, setLikedUserIds] = useState<string[]>([]);
  const [matchedUserIds, setMatchedUserIds] = useState<string[]>([]);
  const [hiddenUserIds, setHiddenUserIds] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const [keyword, setKeyword] = useState('');
  const useSupabaseLikes = isSupabaseMode && isAuthenticated && !isDemoModeEnabled() && Boolean(user);
  const sourceUsers = useSupabaseLikes ? supabaseUsers : mockUsers;
  const safetyHiddenIds = useSupabaseLikes ? hiddenUserIds : blockedUserIds;
  const normalizedKeyword = keyword.trim().toLowerCase();
  const visibleUsers = sourceUsers.filter((profile) => {
    if (safetyHiddenIds.includes(profile.id)) return false;
    if (!normalizedKeyword) return true;

    const searchableText = [
      profile.name,
      String(profile.age),
      profile.location,
      profile.bio,
      profile.occupation,
      profile.datingTemperature,
      profile.introducedBy,
      ...profile.interests,
    ].join(' ').toLowerCase();

    return searchableText.includes(normalizedKeyword);
  });

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

      setNotice('');

      try {
        const profiles = await getPublicProfiles(user.id);
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
    }

    void loadSupabaseLikes();

    return () => {
      mounted = false;
    };
  }, [useSupabaseLikes, user]);

  function handleKeywordChange(event: ChangeEvent<HTMLInputElement>) {
    setKeyword(event.target.value);
  }

  function handleFilterClick(filter: string) {
    setKeyword(filter);
  }

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
      description={t('discover.description1')}
      eyebrow="Discover"
      title={t('discover.title')}
    >
      {notice ? <div className="rounded-2xl border border-theme-border bg-theme-accent-soft/50 p-3 text-sm font-medium text-theme-text">{notice}</div> : null}
      <Card className="space-y-3">
        {useSupabaseLikes ? (
          <div className="flex items-center justify-end gap-2">
            <span className="text-[13px] text-theme-muted">{t('profileCard.sent')} {likedUserIds.length}件</span>
          </div>
        ) : null}
        <Input label={t('discover.keyword')} name="search" onChange={handleKeywordChange} placeholder={t('discover.placeholder')} value={keyword} />
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              className="inline-flex items-center gap-1.5 rounded-full border border-theme-border bg-theme-card px-3.5 py-1.5 text-[13px] font-medium text-theme-main-dark shadow-[0_1px_2px_rgba(16,42,67,0.04)] transition hover:border-theme-sky/50 hover:bg-theme-accent-soft/40 active:scale-[0.97]"
              key={filter.value}
              onClick={() => handleFilterClick(filter.value)}
              type="button"
            >
              <Search className="text-theme-link" size={12} />
              {t(filter.labelKey)}
            </button>
          ))}
        </div>
      </Card>
      <div className="space-y-4">
        {visibleUsers.map((profile) => (
          <ProfileCard compact isCurrentUser={profile.id === user?.id} key={profile.id} liked={useSupabaseLikes ? likedUserIds.includes(profile.id) : undefined} matched={useSupabaseLikes ? matchedUserIds.includes(profile.id) : undefined} onToggleLike={useSupabaseLikes ? handleSupabaseLike : undefined} user={profile} />
        ))}
      </div>
    </PageShell>
  );
}
