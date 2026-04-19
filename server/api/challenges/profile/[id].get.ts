import { challenges } from "#server/utils/db/schema";
import { eq, desc } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const profile_id = getRouterParam(event, "id");
  return await db(event)
    .select({
      id: challenges.id,
      profileId: challenges.profileId,
      title: challenges.title,
      description: challenges.description,
      coinReward: challenges.coinReward,
      status: challenges.status,
      completedAt: challenges.completedAt,
      createdAt: challenges.createdAt,
    })
    .from(challenges)
    .where(eq(challenges.profileId, profile_id!))
    .orderBy(desc(challenges.createdAt));
});
