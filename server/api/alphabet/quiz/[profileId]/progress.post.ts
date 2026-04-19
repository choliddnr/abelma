// import type { Reward, CloudProfile } from "@/types/stores";
import type { AlphabetQuizProgress, ReqAlphabetQuizProgressPut } from "#shared/types/api";
import { alphabetQuizProgress } from "#server/utils/db/schema";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const payload = (await readBody(event)) as AlphabetQuizProgress;
  const profileId = getRouterParam(event, "profileId") as string;

  try {
    const res = await d1
      .insert(alphabetQuizProgress)
      .values({
        profileId: profileId,
        score: payload.score,
        level: payload.level,
        weights: JSON.stringify(payload.weights),
        quizConfig: JSON.stringify(payload.quizConfig),
      })
      .returning()
      .get();
    return {
      ...res,
      weights: JSON.parse(res.weights),
      quizConfig: JSON.parse(res.quizConfig),
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
