import { challenges } from "#server/utils/db/schema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { title, description, coin_reward, profile_id } = body as any;
  const challenge = await db(event)
    .insert(challenges)
    .values({
      profileId: profile_id,
      title,
      description,
      coinReward: coin_reward,
    })
    .returning()
    .get();
  return challenge;
});
