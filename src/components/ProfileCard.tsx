import { Heart, Leaf, MapPin, UserRoundCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { useLanguage } from '../hooks/useLanguage';
import { cn } from '../lib/utils';
import type { UserProfile } from '../types/user';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';
import { ProfileAvatar } from './ProfileAvatar';

export type ProfileCardProps = {
  user: UserProfile;
  compact?: boolean;
  liked?: boolean;
  matched?: boolean;
  isCurrentUser?: boolean;
  onToggleLike?: (userId: string, nextLiked: boolean) => Promise<boolean | void> | boolean | void;
};

export function ProfileCard({ user, compact = false, liked: likedOverride, matched: matchedOverride, isCurrentUser = false, onToggleLike }: ProfileCardProps) {
  const { isLiked, isMatched, toggleLike } = useAppState();
  const { t } = useLanguage();
  const location = useLocation();
  const profileDetailState = { from: location.pathname, profilePreview: user };
  const [showMatch, setShowMatch] = useState(false);
  const [likeError, setLikeError] = useState('');
  const [likeSaving, setLikeSaving] = useState(false);
  const previewBio = compact && user.bio.length > 48 ? `${user.bio.slice(0, 48)}…` : user.bio;
  const liked = likedOverride ?? isLiked(user.id);
  const matched = matchedOverride ?? isMatched(user.id);

  async function handleLike() {
    if (isCurrentUser || likeSaving) return;

    setLikeError('');

    if (!onToggleLike) {
      const becameMatched = toggleLike(user.id);
      if (becameMatched) {
        setShowMatch(true);
      }
      return;
    }

    const nextLiked = !liked;
    setLikeSaving(true);

    try {
      const becameMatched = await onToggleLike(user.id, nextLiked);
      if (becameMatched) {
        setShowMatch(true);
      }
    } catch (caughtError) {
      setLikeError(caughtError instanceof Error ? caughtError.message : '通信に失敗しました。少し時間を置いてもう一度お試しください。');
    } finally {
      setLikeSaving(false);
    }
  }

  return (
    <Card className={cn('group overflow-hidden p-0 transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-theme-main/10', compact && 'shadow-sm')}>
      {showMatch ? (
        <div className="m-3 rounded-2xl border border-theme-yellow/60 bg-theme-accent-soft/70 p-3 text-center">
          <p className="text-[15px] font-semibold text-theme-text">ご縁がつながりました</p>
          <p className="mt-1 text-sm text-theme-muted">{user.name}さんとコネクトしました。</p>
        </div>
      ) : null}
      <Link aria-label={`${user.name}: ${t('profileCard.viewProfile')}`} className="block" state={profileDetailState} to={`/profile/${user.id}`}>
        <div className={cn('relative overflow-hidden bg-gradient-to-br', compact ? 'h-36' : 'h-44', user.gradient)}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_12%,rgba(255,255,255,0.55),transparent_36%)]" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/45 to-transparent" />
          {matched ? (
            <Badge className="profile-card-hero-badge absolute right-3 top-3 border border-white/70 bg-white/80 text-theme-text backdrop-blur">
              <UserRoundCheck size={13} />
              {t('profileCard.connected')}
            </Badge>
          ) : null}
          <div className="absolute bottom-3 left-3 right-3 flex items-end gap-2.5">
            <ProfileAvatar className={cn('rounded-[1.25rem] shadow-lg ring-2 ring-white/80 backdrop-blur', compact ? 'size-16' : 'size-20')} fallbackClassName={cn('bg-white/80 font-semibold', compact ? 'text-2xl' : 'text-3xl')} user={user} />
            <div className="profile-card-identity-panel mb-0.5 min-w-0 rounded-2xl bg-white/85 px-3 py-2 shadow-sm backdrop-blur">
              <p className="text-base font-bold leading-none tracking-[-0.01em] text-theme-text">
                {user.name} <span className="text-sm font-normal text-theme-muted">{user.age}</span>
              </p>
              <p className="mt-1 flex items-center gap-1 text-[13px] text-theme-muted">
                <MapPin size={13} />
                {user.location}
              </p>
            </div>
          </div>
        </div>
      </Link>

      <div className={cn('p-4', compact ? 'space-y-3' : 'space-y-4')}>
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-theme-main-dark">
            <Leaf className="text-theme-link" size={14} />
            {user.occupation}
          </p>
          <p className="mt-1.5 text-[15px] leading-6 text-theme-text">{previewBio}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {user.interests.slice(0, compact ? 3 : user.interests.length).map((interest) => (
            <Badge key={interest}>{interest}</Badge>
          ))}
        </div>

        {compact ? null : (
          <p className="text-[13px] text-theme-muted">
            {t('profileCard.introduction')}: {user.introducedBy}
          </p>
        )}

        {likeError ? <p className="rounded-2xl border border-theme-border bg-theme-accent-soft/50 px-3 py-2 text-sm text-theme-text">{likeError}</p> : null}

        <div className="flex gap-2 pt-0.5">
          {isCurrentUser ? null : (
            <Button className={cn('flex-1 whitespace-nowrap px-3', liked && 'border-theme-sky/50 bg-theme-accent-soft/60 text-theme-link')} disabled={likeSaving} onClick={handleLike} variant={liked ? 'secondary' : 'primary'}>
              <Heart fill={liked ? 'currentColor' : 'none'} size={15} />
              {liked ? t('profileCard.sent') : t('profileCard.like')}
            </Button>
          )}
          <Link className="flex-1" state={profileDetailState} to={`/profile/${user.id}`}>
            <Button className="w-full px-3" variant={isCurrentUser ? 'primary' : 'secondary'}>{t('profileCard.viewProfile')}</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
