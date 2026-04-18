import { wordChallengeProgress } from "#server/utils/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const { challengeConfig } = await readBody(event);
  const profileId = getRouterParam(event, "profileId") as string;

  if (!challengeConfig) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing challengeConfig",
    });
  }

  try {
    const res = await d1
      .update(wordChallengeProgress)
      .set({
        challengeConfig: JSON.stringify(challengeConfig),
        updatedAt: new Date(),
      })
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
      success: true,
      challengeConfig: JSON.parse(res.challengeConfig),
    };
  } catch (error) {
    console.error("Error updating word config:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
