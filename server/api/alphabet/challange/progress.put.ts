import type { Reward, CloudProfile } from "@/types/stores";
import type { ReqAlphabetChallangeProgressPut } from "#shared/types/api";
import { alphabetProgress } from "#server/utils/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export default defineEventHandler(async (event) => {
  // const auth = _auth(event);
  // const session = await auth.api.getSession({ headers: event.headers });

  // if (!session) {
  //   throw createError({
  //     statusCode: 401,
  //     statusMessage: "Unauthorized",
  //   });
  // }

  // const userId = session.user.id;
  const d1 = db(event);
  const payload = (await readBody(event)) as ReqAlphabetChallangeProgressPut;

  try {
    await d1
      .update(profiles)
      .set({ coins: payload.coins })
      .where(eq(profiles.id, payload.profileId));

    await d1
      .update(alphabetProgress)
      .set({
        score: payload.progress.score,
        level: payload.progress.level,
        weights: JSON.stringify(payload.progress.weights),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(alphabetProgress.profileId, payload.profileId));

    return {
      success: true,
    };
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
