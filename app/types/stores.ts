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
  createdAt: Date;
};

export type Profile = {
  id: string;
  name: string;
  avatar: string;
  coins: number;
  updatedAt: Date;
};

// ==================== REWARD TYPES ====================

export type Reward = {
  id: string;
  title: string;
  cost: number;
  emoji: string;
  status: "available" | "claimed" | "fulfilled";
  claimedAt?: Date;
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
  lastAttempt: Date;
};

export type WordAnalytics = {
  mistakes: number;
  lastAttempt: Date;
};

export type QuizLevelConfig = {
  targetWeight: number;
  timer: number; // 0 = off, otherwise seconds
  streak: number; // threshold for bonus reward
  streakReward: number; // koin reward
};

export type AlphabetQuizModeConfig = QuizLevelConfig[];

export type AlphabetQuizProgress = {
  score: number;
  level: number;
  weights: Record<string, number>;
  config?: AlphabetQuizModeConfig;
  updatedAt: Date;
};

// ==================== SETTINGS TYPES ====================


export type WordQuizConfig = {
  coinReward: number; //Reward for each correct answer
  levelUpReward: number; // Reward given upon crossing a level threshold (100 points)
  streakThreshold: number; // Number of correct answers in a row to earn bonus reward
  streakReward: number; // Bonus reward given when reaching the streak threshold
};

export type WordQuizProgress = {
  score: number;
  level: number;
  weights: Record<string, number>;
  config: WordQuizConfig;
  updatedAt: Date;
};

// ==================== CVC BLEND TYPES ====================

export type CvcConfig = {
  coinReward: number;
  levelUpReward: number;
  learningLevelUpReward: number;
  streakThreshold: number;
  streakReward: number;
};

export type CvcProgress = {
  score: number;
  learningLevel: number;
  levelScores: Record<string, number>;
  quizScore: number;
  quizLevel: number;
  quizWeights: Record<string, number>;
  learningWeights: Record<string, number>;
  config: CvcConfig;
  updatedAt: Date;
};

// ==================== DDV PROGRESS TYPES ====================

export type DdvConfig = {
  coinReward: number;
  levelUpReward: number;
  learningLevelUpReward: number;
  streakThreshold: number;
  streakReward: number;
};

export type DdvProgress = {
  score: number;
  learningLevel: number;
  levelScores: Record<string, number>;
  quizScore: number;
  quizLevel: number;
  quizWeights: Record<string, number>;
  learningWeights: Record<string, number>;
  config: DdvConfig;
  updatedAt: Date;
};

// ==================== NASAL PROGRESS TYPES ====================

export type NasalConfig = {
  coinReward: number;
  levelUpReward: number;
  learningLevelUpReward: number;
  streakThreshold: number;
  streakReward: number;
};

export type NasalProgress = {
  score: number;
  learningLevel: number;
  levelScores: Record<string, number>;
  quizScore: number;
  quizLevel: number;
  quizWeights: Record<string, number>;
  learningWeights: Record<string, number>;
  config: NasalConfig;
  updatedAt: Date;
};

// ==================== TRACE PROGRESS TYPES ====================

export type TraceProgress = {
  stars: Record<string, number>;
  config: number[];
  updatedAt: Date;
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
  alphabetProgress?: AlphabetQuizProgress | Record<string, AlphabetQuizProgress>;
  wordProgress?: WordQuizProgress | Record<string, WordQuizProgress>;
  cvcProgress?: CvcProgress | Record<string, CvcProgress>;
  ddvProgress?: DdvProgress | Record<string, DdvProgress>;
  nasalProgress?: NasalProgress | Record<string, NasalProgress>;
  tracingProgress?: TraceProgress | Record<string, TraceProgress>;
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
