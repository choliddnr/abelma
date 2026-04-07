import type { ReqRewardPost, ResRewardPost, Reward } from "#shared/types/api";
import { rewards } from "#server/utils/db/schema";

export default defineEventHandler(async (event) => {
  const body = await readBody<ReqRewardPost>(event);
  const { title, cost, emoji, profile_id } = body as any;
  const reward = await db(event)
    .insert(rewards)
    .values({
      profileId: profile_id,
      title,
      cost,
      emoji,
    })
    .returning()
    .get();
  return reward as Reward;
});
