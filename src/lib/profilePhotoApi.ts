import type { UserProfile } from '../types/user';
import type { ProfilePhoto, ProfilePhotoUploadResult, ProfilePhotoWithUrl } from '../types/profilePhoto';
import { requireSupabaseClient } from './supabase';

const PROFILE_PHOTO_BUCKET = 'profile-photos';
const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PROFILE_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const EXTENSION_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const profilePhotoColumns = 'id,user_id,storage_path,position,is_primary,created_at,updated_at';

export { ALLOWED_PROFILE_PHOTO_TYPES, MAX_PROFILE_PHOTO_BYTES, PROFILE_PHOTO_BUCKET };

function getPublicUrl(storagePath: string) {
  const { data } = requireSupabaseClient().storage.from(PROFILE_PHOTO_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

function withPublicUrl(photo: ProfilePhoto): ProfilePhotoWithUrl {
  return {
    ...photo,
    publicUrl: getPublicUrl(photo.storage_path),
  };
}

function sanitizeFileName(fileName: string) {
  return fileName
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80) || 'profile-photo';
}

function validateProfilePhotoFile(file: File | null | undefined) {
  console.info('[EnBloom] file exists', { exists: Boolean(file) });
  if (!file) throw new Error('画像ファイルを選択してください');

  console.info('[EnBloom] file size', { size: file.size });
  console.info('[EnBloom] file type', { type: file.type });

  if (!file.type.startsWith('image/')) {
    throw new Error('画像ファイルを選択してください');
  }

  if (!ALLOWED_PROFILE_PHOTO_TYPES.includes(file.type)) {
    throw new Error('JPG / PNG / WebP の画像を選択してください');
  }

  if (file.size > MAX_PROFILE_PHOTO_BYTES) {
    throw new Error('画像サイズは5MB以下にしてください');
  }
}

async function getCurrentUserId() {
  const { data, error } = await requireSupabaseClient().auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('ログイン情報を確認できませんでした。もう一度ログインしてください。');
  return data.user.id;
}

export async function uploadProfilePhoto(file: File): Promise<ProfilePhotoUploadResult> {
  console.info('[EnBloom] profile photo upload started');
  validateProfilePhotoFile(file);

  const userId = await getCurrentUserId();
  const extension = EXTENSION_BY_TYPE[file.type] ?? sanitizeFileName(file.name).split('.').pop() ?? 'jpg';
  const storagePath = `${userId}/main-${Date.now()}.${extension}`;

  const { error: uploadError } = await requireSupabaseClient()
    .storage
    .from(PROFILE_PHOTO_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });

  const uploadSuccess = !uploadError;
  console.info('[EnBloom] upload success', { success: uploadSuccess });
  if (uploadError) throw uploadError;

  const { data: existingPhotos, error: existingPhotosError } = await requireSupabaseClient()
    .from('profile_photos')
    .select('position')
    .eq('user_id', userId)
    .order('position', { ascending: false })
    .limit(1);

  if (existingPhotosError) throw existingPhotosError;
  const nextPosition = ((existingPhotos?.[0]?.position as number | undefined) ?? -1) + 1;

  const { error: primaryUpdateError } = await requireSupabaseClient()
    .from('profile_photos')
    .update({ is_primary: false })
    .eq('user_id', userId)
    .eq('is_primary', true);

  if (primaryUpdateError) throw primaryUpdateError;

  const { data, error: insertError } = await requireSupabaseClient()
    .from('profile_photos')
    .insert({
      user_id: userId,
      storage_path: storagePath,
      position: nextPosition,
      is_primary: true,
    })
    .select(profilePhotoColumns)
    .single<ProfilePhoto>();

  const insertSuccess = !insertError;
  console.info('[EnBloom] profile photo row insert success', { success: insertSuccess });
  if (insertError) throw insertError;

  return { photo: withPublicUrl(data) };
}

export async function getMyPrimaryProfilePhoto(): Promise<ProfilePhotoWithUrl | null> {
  const userId = await getCurrentUserId();
  return getPrimaryProfilePhoto(userId);
}

export async function getPrimaryProfilePhoto(userId: string): Promise<ProfilePhotoWithUrl | null> {
  if (!userId) return null;

  const { data, error } = await requireSupabaseClient()
    .from('profile_photos')
    .select(profilePhotoColumns)
    .eq('user_id', userId)
    .eq('is_primary', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<ProfilePhoto>();

  const success = !error;
  console.info('[EnBloom] primary photo fetch success', { success });
  if (error) throw error;

  return data ? withPublicUrl(data) : null;
}

export async function getPrimaryProfilePhotos(userIds: string[]): Promise<Record<string, ProfilePhotoWithUrl>> {
  const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)));
  if (uniqueUserIds.length === 0) return {};

  const { data, error } = await requireSupabaseClient()
    .from('profile_photos')
    .select(profilePhotoColumns)
    .in('user_id', uniqueUserIds)
    .eq('is_primary', true)
    .order('created_at', { ascending: false });

  const success = !error;
  console.info('[EnBloom] primary photo fetch success', { success });
  if (error) throw error;

  return (data ?? []).reduce<Record<string, ProfilePhotoWithUrl>>((photosByUserId, photo) => {
    if (!photosByUserId[photo.user_id]) {
      photosByUserId[photo.user_id] = withPublicUrl(photo as ProfilePhoto);
    }
    return photosByUserId;
  }, {});
}

export function attachPrimaryPhotoUrls<T extends UserProfile>(profiles: T[], photosByUserId: Record<string, ProfilePhotoWithUrl>): T[] {
  return profiles.map((profile) => ({
    ...profile,
    photoUrl: photosByUserId[profile.id]?.publicUrl ?? profile.photoUrl,
    primaryPhotoUrl: photosByUserId[profile.id]?.publicUrl ?? profile.primaryPhotoUrl,
    avatarUrl: photosByUserId[profile.id]?.publicUrl ?? profile.avatarUrl,
  }));
}
