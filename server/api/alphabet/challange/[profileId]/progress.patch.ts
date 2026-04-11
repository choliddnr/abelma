// import type { Reward, CloudProfile } from "@/types/stores";
import type { ReqAlphabetChallangeProgressPut } from "#shared/types/api";
import { alphabetChallengeProgress, profiles } from "#server/utils/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const payload = (await readBody(event)) as ReqAlphabetChallangeProgressPut;
  const profileId = getRouterParam(event, "profileId") as string;

  try {
    await d1.update(profiles).set({ coins: payload.coins }).where(eq(profiles.id, profileId));

    return await d1
      .update(alphabetChallengeProgress)
      .set({
        score: payload.progress.score,
        level: payload.progress.level,
        weights: JSON.stringify(payload.progress.weights),
      })
      .where(eq(alphabetChallengeProgress.profileId, profileId))
      .returning()
      .get();
  } catch (error) {
    console.error("Error updating alphabet progress:", error);
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
      }),
    );
  }
});
