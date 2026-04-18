import type { WordChallengeProgress } from "#shared/types/api";
import { wordChallengeProgress } from "#server/utils/db/schema";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const payload = (await readBody(event)) as WordChallengeProgress;
  const profileId = getRouterParam(event, "profileId") as string;

  try {
    const res = await d1
      .insert(wordChallengeProgress)
      .values({
        profileId: profileId,
        score: payload.score || 0,
        level: payload.level || 1,
        weights: JSON.stringify(payload.weights || {}),
        challengeConfig: JSON.stringify(payload.challengeConfig || []),
      })
      .returning()
      .get();

    const result: WordChallengeProgress = {
      ...res,
      weights: JSON.parse(res.weights),
      challengeConfig: JSON.parse(res.challengeConfig),
      updatedAt: res.updatedAt.toISOString(),
    };

    return result;
  } catch (error) {
    console.error("Error inserting word progress:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
