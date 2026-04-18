import type { WordChallengeProgress } from "#shared/types/api";
import { wordChallengeProgress } from "#server/utils/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const payload = (await readBody(event)) as Partial<WordChallengeProgress>;
  const profileId = getRouterParam(event, "profileId") as string;

  try {
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    if (payload.score !== undefined) updateData.score = payload.score;
    if (payload.level !== undefined) updateData.level = payload.level;
    if (payload.weights !== undefined) updateData.weights = JSON.stringify(payload.weights);
    if (payload.challengeConfig !== undefined) updateData.challengeConfig = JSON.stringify(payload.challengeConfig);

    const res = await d1
      .update(wordChallengeProgress)
      .set(updateData)
      .where(eq(wordChallengeProgress.profileId, profileId))
      .returning()
      .get();
    
    if (!res) {
      throw createError({
        statusCode: 404,
        statusMessage: "Progress not found",
      });
    }

    return {
      ...res,
      weights: JSON.parse(res.weights),
      challengeConfig: JSON.parse(res.challengeConfig),
    };
  } catch (error) {
    console.error("Error updating word progress:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
