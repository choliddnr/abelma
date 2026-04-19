import { z } from "zod";
import type { WordQuizProgress } from "#shared/types/api";
import { wordQuizProgress } from "#server/utils/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const profileId = getRouterParam(event, "profileId") as string;

  const progressSchema = z.object({
    score: z.number().int().min(0).optional(),
    level: z.number().int().min(1).optional(),
    weights: z.record(z.string(), z.number()).optional(),
    quizConfig: z.array(z.any()).optional(),
  });

  const payload = await readValidatedBody(event, (data) => progressSchema.parse(data));

  try {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (payload.score !== undefined) updateData.score = payload.score;
    if (payload.level !== undefined) updateData.level = payload.level;
    if (payload.weights !== undefined) updateData.weights = JSON.stringify(payload.weights);
    if (payload.quizConfig !== undefined)
      updateData.quizConfig = JSON.stringify(payload.quizConfig);

    const res = await d1
      .update(wordQuizProgress)
      .set(updateData)
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

    console.error("Error updating word progress:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update progress",
    });
  }
});
