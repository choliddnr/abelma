import { ddvProgress } from "#server/utils/db/schema";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const profileId = getRouterParams(event).profileId as string;

  try {
    const res = await d1
      .insert(ddvProgress)
      .values({
        profileId: profileId,
        score: 0,
        learningLevel: 1,
        levelScores: JSON.stringify({}),
        quizScore: 0,
        quizLevel: 1,
        quizWeights: JSON.stringify({}),
        learningWeights: JSON.stringify({}),
        config: JSON.stringify({
          coinReward: 5,
          levelUpReward: 50,
          learningLevelUpReward: 50,
          streakThreshold: 5,
          streakReward: 10,
        }),
      })
      .returning()
      .get();

    if (!res) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to create DDV progress",
      });
    }

    return {
      ...res,
      levelScores: JSON.parse(res.levelScores),
      quizWeights: JSON.parse(res.quizWeights),
      learningWeights: JSON.parse(res.learningWeights),
      config: JSON.parse(res.config),
    };
  } catch (error) {
    console.error("Error creating DDV progress:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
