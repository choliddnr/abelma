import { ddvProgress } from "#server/utils/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const profileId = getRouterParams(event).profileId as string;

  try {
    const res = await d1
      .select({
        score: ddvProgress.score,
        learningLevel: ddvProgress.learningLevel,
        levelScores: ddvProgress.levelScores,
        quizScore: ddvProgress.quizScore,
        quizLevel: ddvProgress.quizLevel,
        quizWeights: ddvProgress.quizWeights,
        learningWeights: ddvProgress.learningWeights,
        config: ddvProgress.config,
        updatedAt: ddvProgress.updatedAt,
      })
      .from(ddvProgress)
      .where(eq(ddvProgress.profileId, profileId))
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
    console.error("Error selecting DDV progress:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
