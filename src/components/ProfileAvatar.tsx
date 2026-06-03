import type { UserProfile } from '../types/user';

type ProfileAvatarProps = {
  user: Pick<UserProfile, 'name' | 'gradient' | 'photoUrl' | 'avatarUrl' | 'primaryPhotoUrl'>;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
};

export function ProfileAvatar({ className = '', fallbackClassName = '', imageClassName = '', user }: ProfileAvatarProps) {
  const photoUrl = user.primaryPhotoUrl ?? user.photoUrl ?? user.avatarUrl;

  if (photoUrl) {
    return (
      <span className={`block overflow-hidden bg-theme-background ${className}`}>
        <img alt={`${user.name}さんのプロフィール画像`} className={`size-full object-cover ${imageClassName}`} loading="lazy" src={photoUrl} />
      </span>
    );
  }

  return (
    <span className={`flex items-center justify-center bg-gradient-to-br ${user.gradient} text-theme-main-dark ${className} ${fallbackClassName}`}>
      {user.name.slice(0, 1) || '縁'}
    </span>
  );
}
