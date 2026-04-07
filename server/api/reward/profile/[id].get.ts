import type { ReqRewardPost, ResRewardPost, Reward } from "#shared/types/api";
import { rewards } from "#server/utils/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const profile_id = getRouterParam(event, "id");
  return await db(event)
    .select({
      id: rewards.id,
      profileId: rewards.profileId,
      title: rewards.title,
      cost: rewards.cost,
      emoji: rewards.emoji,
      status: rewards.status,
      claimedAt: rewards.claimedAt,
    })
    .from(rewards)
    .where(eq(rewards.profileId, profile_id!));
});
