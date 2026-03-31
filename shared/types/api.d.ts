export type BaseRes = {
  status: boolean;
};
export type ReqAlphabetChallangeProgressPut = {
  profileId: string;
  coins: number;
  progress: { score: number; level: number; weights: Record<string, number> };
};

export type ResAlphabetChallangeProgressGet = {
  score: number;
  level: number;
  weights: Record<string, number>;
  updatedAt: string;
};
