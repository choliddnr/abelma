import { wordChallengeProgress } from "#server/utils/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const profileId = getRouterParams(event).profileId as string;
  try {
    const res = await d1
      .select({
        score: wordChallengeProgress.score,
        level: wordChallengeProgress.level,
        weights: wordChallengeProgress.weights,
        challengeConfig: wordChallengeProgress.challengeConfig,
        updatedAt: wordChallengeProgress.updatedAt,
      })
      .from(wordChallengeProgress)
      .where(eq(wordChallengeProgress.profileId, profileId))
      .get();

    if (res)
      return {
        ...res,
        weights: JSON.parse(res.weights),
        challengeConfig: JSON.parse(res.challengeConfig),
      };

    const res2 = await d1
      .insert(wordChallengeProgress)
      .values({
        profileId: profileId,
        score: 0,
        level: 1,
        weights: JSON.stringify({}),
        challengeConfig: JSON.stringify([]),
      })
      .returning()
      .get();

    return {
      ...res2,
      weights: JSON.parse(res2.weights),
      challengeConfig: JSON.parse(res2.challengeConfig),
    };
  } catch (error) {
    console.error("Error selecting word challenge progress:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
