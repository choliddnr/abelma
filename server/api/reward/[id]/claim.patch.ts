import { rewards } from "#server/utils/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const payload = await readBody(event);
  const id = Number(getRouterParam(event, "id"));

  try {
    const reward = await d1
      .update(rewards)
      .set({
        status: payload.status,
        claimedAt: new Date(payload.claimedAt),
      })
      .where(eq(rewards.id, id))
      .returning()
      .get();

    await d1
      .update(profiles)
      .set({ coins: payload.coins })
      .where(eq(profiles.id, reward.profileId));

    return reward;
  } catch (error) {
    console.error("Error claiming the reward:", error);
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
      }),
    );
  }
});
