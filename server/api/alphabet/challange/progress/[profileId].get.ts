import { alphabetChallengeProgress } from "#server/utils/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const profileId = getRouterParams(event).profileId as string;
  try {
    const result = await d1
      .select({
        score: alphabetChallengeProgress.score,
        level: alphabetChallengeProgress.level,
        weights: alphabetChallengeProgress.weights,
        challengeConfig: alphabetChallengeProgress.challengeConfig,
        updatedAt: alphabetChallengeProgress.updatedAt,
      })
      .from(alphabetChallengeProgress)
      .where(eq(alphabetChallengeProgress.profileId, profileId));

    return result[0];
  } catch (error) {
    console.error("Error selecting alphabet challange progress:", error);
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
      }),
    );
  }
});
