// import type { Reward, CloudProfile } from "@/types/stores";
import type { AlphabetChallengeProgress, ReqAlphabetChallangeProgressPut } from "#shared/types/api";
import { alphabetChallengeProgress } from "#server/utils/db/schema";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const payload = (await readBody(event)) as AlphabetChallengeProgress;
  const profileId = getRouterParam(event, "profileId") as string;

  try {
    const res = await d1
      .insert(alphabetChallengeProgress)
      .values({
        profileId: profileId,
        score: payload.score,
        level: payload.level,
        weights: JSON.stringify(payload.weights),
        challengeConfig: JSON.stringify(payload.challengeConfig),
      })
      .returning()
      .get();
    return {
      ...res,
      weights: JSON.parse(res.weights),
      challengeConfig: JSON.parse(res.challengeConfig),
    };
  } catch (error) {
    console.error("Error inserting alphabet progress:", error);
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
      }),
    );
  }
});
