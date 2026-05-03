import { z } from "zod";
import { wordQuizProgress } from "#server/utils/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import type { WordQuizProgress } from "#shared/types/api";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const profileId = getRouterParam(event, "profileId") as string;

  const configSchema = z.object({
    config: z.object({
      coinReward: z.number(),
      levelUpReward: z.number(),
      streakThreshold: z.number(),
      streakReward: z.number(),
    }),
  });

  const body = await readValidatedBody(event, (data) => configSchema.parse(data));

  try {
    const res = await d1
      .update(wordQuizProgress)
      .set({
        config: JSON.stringify(body.config),
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
      config: JSON.parse(res.config),
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
