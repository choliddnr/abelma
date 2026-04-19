import { challenges, profiles } from "#server/utils/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const { status, title, description, coin_reward } = body as any;

  if (status === "completed") {
    // Parent fulfilled the challenge, give coins to profile
    // Start transaction if possible, but Drizzle D1 supports batch. Let's just do sequential for now or find the challenge first.
    const challenge = await db(event)
      .select()
      .from(challenges)
      .where(eq(challenges.id, Number(id)))
      .get();
      
    if (challenge && challenge.status !== "completed") {
      // Update profile coins
      const profile = await db(event)
        .select()
        .from(profiles)
        .where(eq(profiles.id, challenge.profileId))
        .get();
        
      if (profile) {
        await db(event)
          .update(profiles)
          .set({ coins: profile.coins + challenge.coinReward })
          .where(eq(profiles.id, challenge.profileId));
      }
    }
  }

  const updatedChallenge = await db(event)
    .update(challenges)
    .set({ 
      ...(status !== undefined ? { status } : {}),
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(coin_reward !== undefined ? { coinReward: coin_reward } : {}),
      ...(status === "completed" ? { completedAt: new Date() } : {})
    })
    .where(eq(challenges.id, Number(id)))
    .returning()
    .get();

  return updatedChallenge;
});
