/**
 * ABELMA State Management Types
 *
 * Comprehensive type definitions for all state management stores.
 */

// ==================== USER & PROFILE TYPES ====================

export type User = {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  createdAt: string;
};

export type Profile = {
  id: string;
  name: string;
  avatar: string;
  coins: number;
};

// ==================== REWARD TYPES ====================

export type Reward = {
  id: string;
  title: string;
  cost: number;
  emoji: string;
  status: "available" | "claimed" | "fulfilled";
  claimedAt?: string;
};

export type DefaultReward = {
  id: string;
  title: string;
  cost: number;
  emoji: string;
};

// ==================== STICKER TYPES ====================

export type Sticker = {
  id: string;
  emoji: string;
  name: string;
  requiredScore: number;
};

export type DefaultSticker = {
  id: string;
  emoji: string;
  name: string;
  requiredScore: number;
};

// ==================== ANALYTICS TYPES ====================

export type Analytics = {
  type: "letter" | "word";
  targetId: string;
  mistakes: number;
  lastAttempt: string;
};

export type WordAnalytics = {
  mistakes: number;
  lastAttempt: string;
};

export type ChallengeLevelConfig = {
  targetWeight: number;
  timer: number; // 0 = off, otherwise seconds
  streak: number; // threshold for bonus reward
  streakReward: number; // koin reward
};

export type AlphabetChallengeModeConfig = ChallengeLevelConfig[];

export type AlphabetChallengeProgress = {
  score: number;
  level: number;
  weights: Record<string, number>;
  challengeConfig?: AlphabetChallengeModeConfig;
  updatedAt: string;
};

// ==================== SETTINGS TYPES ====================

export type LetterCase = "uppercase" | "lowercase" | "mixed";

export type WordLevelConfig = {
  timer: number; // 0 for off, otherwise seconds
  coinReward: number;
  letterCase: LetterCase;
  numOptions: number; // Number of options in PICK_WORD mode
};

export type WordSettings = {
  levels: WordLevelConfig[];
  timerDuration: number; // Legacy/Default
  letterCase: LetterCase; // Legacy/Default
};

export type WordChallengeProgress = {
  score: number;
  level: number;
  weights: Record<string, number>;
  challengeConfig: WordLevelConfig[];
  updatedAt: string;
};

// ==================== SYNC TYPES ====================

export type {
  CloudSticker,
  CloudAnalytics,
  CloudAlphabetProgress,
  CloudReward,
  CloudStorybook,
  CloudProfile,
} from "@/types/sync";

export type CloudData = {
  profiles?: Profile[];
  activeProfileId?: string | null;
  coins?: number | Record<string, number>;
  rewards?: Reward[] | Record<string, Reward[]>;
  stickers?: (string | Sticker)[] | Record<string, string[]>;
  analytics?: Analytics[] | Record<string, Record<string, WordAnalytics>>;
  alphabetProgress?:
    | AlphabetChallengeProgress
    | Record<string, AlphabetChallengeProgress>;
  wordProgress?:
    | WordChallengeProgress
    | Record<string, WordChallengeProgress>;
  settings?: WordSettings;
};

export type SyncResponse = {
  success: boolean;
  data?: CloudData;
  error?: string;
};

// ==================== AUTH TYPES ====================

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export type AuthCredentials = {
  email: string;
  password: string;
};

export type AuthResult = {
  user: User;
  token: string;
  refreshToken?: string;
};

// ==================== PERSISTENCE TYPES ====================

export type PersistConfig = {
  key: string;
  storage: "localStorage" | "sessionStorage";
  pick?: string[];
  paths?: string[];
};

export type StoreConfig = {
  name: string;
  persist?: PersistConfig;
};
