export type CloudSticker = {
  stickerId: string;
};

export type CloudAnalytics = {
  type: string;
  targetId: string;
  mistakes: number;
  lastAttempt: string;
};

export type CloudAlphabetProgress = {
  score: number;
  level: number;
  weights: string; // JSON string
  challengeConfig?: string; // JSON string of AlphabetChallengeModeConfig[]
  updatedAt: string;
};

export type CloudReward = {
  id: string;
  title: string;
  cost: number;
  emoji: string;
  status: "available" | "claimed" | "fulfilled";
  claimedAt?: string;
};

export type CloudStorybook = {
  letter: string;
  isCompleted: boolean;
  lastRead: string;
};

export type CloudProfile = {
  id: string;
  name: string;
  avatar: string;
  coins: number;
  letterCase?: string;
  timerDuration?: number;
  rewards: CloudReward[];
  stickers: CloudSticker[];
  analytics: CloudAnalytics[];
  alphabetChallengeProgress: CloudAlphabetProgress | null;
  storybookProgress: CloudStorybook[];
};
