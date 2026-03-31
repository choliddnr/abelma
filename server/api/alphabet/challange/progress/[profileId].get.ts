import type { Reward, CloudProfile } from "@/types/stores";
import type { ReqAlphabetChallangeProgressPut } from "#shared/types/api";
import { alphabetProgress } from "#server/utils/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const profileId = getRouterParams(event).profileId as string;
  try {
    const result = await d1
      .select({
        score: alphabetProgress.score,
        level: alphabetProgress.level,
        weights: alphabetProgress.weights,
        challengeConfig: alphabetProgress.challengeConfig,
        updatedAt: alphabetProgress.updatedAt,
      })
      .from(alphabetProgress)
      .where(eq(alphabetProgress.profileId, profileId));

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
