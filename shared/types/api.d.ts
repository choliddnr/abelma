export type BaseRes = {
  status: boolean;
};

export type AlphabetChallengeProgress = {
  score: number;
  level: number;
  weights: Record<string, number>;
  challengeConfig: Record<string, number>;
  updatedAt: string;
};

export type ReqAlphabetChallangeProgressPut = {
  coins: number;
  progress: AlphabetChallengeProgress;
};

export type ResAlphabetChallangeProgressGet = {
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
  createdAt: string;
  updatedAt: string;
};
