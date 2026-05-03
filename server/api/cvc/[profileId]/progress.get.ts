import { cvcProgress } from "#server/utils/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const profileId = getRouterParams(event).profileId as string;

  try {
    const res = await d1
      .select({
        score: cvcProgress.score,
        learningLevel: cvcProgress.learningLevel,
        levelScores: cvcProgress.levelScores,
        quizScore: cvcProgress.quizScore,
        quizLevel: cvcProgress.quizLevel,
        quizWeights: cvcProgress.quizWeights,
        learningWeights: cvcProgress.learningWeights,
        config: cvcProgress.config,
        updatedAt: cvcProgress.updatedAt,
      })
      .from(cvcProgress)
      .where(eq(cvcProgress.profileId, profileId))
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

    // Default if not found
    return null;
  } catch (error) {
    console.error("Error selecting CVC progress:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
