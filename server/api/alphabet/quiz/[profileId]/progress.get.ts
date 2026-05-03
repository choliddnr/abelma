import { alphabetQuizProgress } from "#server/utils/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const profileId = getRouterParams(event).profileId as string;
  try {
    const res = await d1
      .select({
        score: alphabetQuizProgress.score,
        level: alphabetQuizProgress.level,
        weights: alphabetQuizProgress.weights,
        config: alphabetQuizProgress.config,
        updatedAt: alphabetQuizProgress.updatedAt,
      })
      .from(alphabetQuizProgress)
      .where(eq(alphabetQuizProgress.profileId, profileId))
      .get();

    if (res)
      return {
        ...res,
        weights: JSON.parse(res.weights),
        config: JSON.parse(res.config),
      };
    return;
  } catch (error) {
    console.error("Error selecting alphabet quiz progress:", error);
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
      }),
    );
  }
});
