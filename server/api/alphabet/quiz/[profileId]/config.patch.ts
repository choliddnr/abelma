import { alphabetQuizProgress } from "#server/utils/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const payload = await readBody(event);
  const profileId = getRouterParam(event, "profileId") as string;

  try {
    return await d1
      .update(alphabetQuizProgress)
      .set({
        config: JSON.stringify(payload.config),
        updatedAt: new Date(),
      })
      .where(eq(alphabetQuizProgress.profileId, profileId))
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
