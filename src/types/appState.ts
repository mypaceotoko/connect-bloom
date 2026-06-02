import type { ThemeId } from '../context/ThemeProvider';
import type { CurrentUserProfile } from './user';
import type { Message } from './message';

export type AppState = {
  currentUser: CurrentUserProfile;
  onboardingCompleted: boolean;
  likedUserIds: string[];
  receivedLikeUserIds: string[];
  matchedUserIds: string[];
  messagesByMatchId: Record<string, Message[]>;
  blockedUserIds: string[];
  reportedUserIds: string[];
  themePreference: ThemeId;
};
