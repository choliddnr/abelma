export interface CloudSticker {
  stickerId: string;
}

export interface CloudAnalytics {
  type: string;
  targetId: string;
  mistakes: number;
  lastAttempt: string;
}

export interface CloudAlphabetProgress {
  score: number;
  level: number;
  weights: string; // JSON string
}

export interface CloudReward {
  id: string;
  title: string;
  cost: number;
  emoji: string;
  status: 'available' | 'claimed' | 'fulfilled';
  claimedAt?: string;
}

export interface CloudProfile {
  id: string;
  name: string;
  avatar: string;
  points: number;
  letterCase?: string;
  timerDuration?: number;
  rewards: CloudReward[];
  stickers: CloudSticker[];
  analytics: CloudAnalytics[];
  alphabetProgress: CloudAlphabetProgress | null;
}
