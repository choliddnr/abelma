import { z } from "zod";
import { wordQuizProgress } from "#server/utils/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import type { WordQuizProgress } from "#shared/types/api";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const profileId = getRouterParam(event, "profileId") as string;

  const configSchema = z.object({
    quizConfig: z.array(z.any()),
  });

  const body = await readValidatedBody(event, (data) => configSchema.parse(data));

  try {
    const res = await d1
      .update(wordQuizProgress)
      .set({
        quizConfig: JSON.stringify(body.quizConfig),
        updatedAt: new Date(),
      })
      .where(eq(wordQuizProgress.profileId, profileId))
      .returning()
      .get();

    if (!res) {
      throw createError({
        statusCode: 404,
        statusMessage: "Progress not found",
      });
    }

    return {
      ...res,
      weights: JSON.parse(res.weights),
      quizConfig: JSON.parse(res.quizConfig),
    } as WordQuizProgress;
  } catch (error: any) {
    if (error.statusCode) throw error;

    console.error("Error updating word config:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update configuration",
    });
  }
});
