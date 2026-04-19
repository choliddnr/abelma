export type BaseRes = {
  status: boolean;
};

export type AlphabetQuizProgress = {
  score: number;
  level: number;
  weights: Record<string, number>;
  quizConfig: any[];
  updatedAt: Date;
};

export type WordQuizProgress = {
  score: number;
  level: number;
  weights: Record<string, number>;
  quizConfig: any[];
  updatedAt: Date;
};

export type ReqAlphabetQuizProgressPut = {
  coins: number;
  progress: AlphabetQuizProgress;
};

export type ResAlphabetQuizProgressGet = {
  score: number;
  level: number;
  weights: Record<string, number>;
  updatedAt: string;
};

export type Reward = {
  id: number;
  profileId: string;
  title: string;
  cost: number;
  emoji: string;
  status: "available" | "claimed" | "fulfilled";
  claimedAt?: Date | null;
};

export type ReqRewardPost = Omit<Reward, "id" | "status" | "claimedAt"> & {
  profileId: string;
};

export type ResRewardPost = Omit<Reward, "status" | "claimedAt">;

export type ReqRewardPut = Omit<Reward, "id" | "status" | "claimedAt">;

export type ResRewardPut = Omit<Reward, "status" | "claimedAt">;

export type ReqRewardDelete = Pick<Reward, "id">;

export type ResRewardDelete = Pick<Reward, "id">;

export type ReqProfilePost = {
  name: string;
  avatar: string;
};

export type ResProfilePost = {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  coins: number;
  createdAt: Date;
  updatedAt: Date;
};
