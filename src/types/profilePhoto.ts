export type ProfilePhoto = {
  id: string;
  user_id: string;
  storage_path: string;
  position: number;
  is_primary: boolean;
  created_at: string;
  updated_at?: string | null;
};

export type ProfilePhotoWithUrl = ProfilePhoto & {
  publicUrl: string;
};

export type ProfilePhotoUploadResult = {
  photo: ProfilePhotoWithUrl;
};
