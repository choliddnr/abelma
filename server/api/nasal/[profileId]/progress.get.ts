import { nasalProgress } from "#server/utils/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const profileId = getRouterParams(event).profileId as string;

  try {
    const res = await d1
      .select({
        score: nasalProgress.score,
        learningLevel: nasalProgress.learningLevel,
        levelScores: nasalProgress.levelScores,
        quizScore: nasalProgress.quizScore,
        quizLevel: nasalProgress.quizLevel,
        quizWeights: nasalProgress.quizWeights,
        learningWeights: nasalProgress.learningWeights,
        config: nasalProgress.config,
        updatedAt: nasalProgress.updatedAt,
      })
      .from(nasalProgress)
      .where(eq(nasalProgress.profileId, profileId))
      .get();

    if (res) {
      return {
        ...res,
        levelScores: JSON.parse(res.levelScores),
        quizWeights: JSON.parse(res.quizWeights),
        learningWeights: JSON.parse(res.learningWeights),
        config: res.config ? JSON.parse(res.config) : {
          coinReward: 5,
          levelUpReward: 50,
          learningLevelUpReward: 50,
          streakThreshold: 5,
          streakReward: 10,
        },
      };
    }

    return null;
  } catch (error) {
    console.error("Error selecting Nasal progress:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
