import { wordQuizProgress } from "#server/utils/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const profileId = getRouterParams(event).profileId as string;
  try {
    const res = await d1
      .select({
        score: wordQuizProgress.score,
        level: wordQuizProgress.level,
        weights: wordQuizProgress.weights,
        quizConfig: wordQuizProgress.quizConfig,
        updatedAt: wordQuizProgress.updatedAt,
      })
      .from(wordQuizProgress)
      .where(eq(wordQuizProgress.profileId, profileId))
      .get();

    if (res)
      return {
        ...res,
        weights: JSON.parse(res.weights),
        quizConfig: JSON.parse(res.quizConfig),
      };

    const res2 = await d1
      .insert(wordQuizProgress)
      .values({
        profileId: profileId,
        score: 0,
        level: 1,
        weights: JSON.stringify({}),
        quizConfig: JSON.stringify({ coinReward: 5, levelUpReward: 50, streakThreshold: 5, streakReward: 10 }),
      })
      .returning()
      .get();

    return {
      ...res2,
      weights: JSON.parse(res2.weights),
      quizConfig: JSON.parse(res2.quizConfig),
    };
  } catch (error) {
    console.error("Error selecting word quiz progress:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
