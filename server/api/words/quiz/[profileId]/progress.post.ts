import { z } from "zod";
import type { WordQuizProgress } from "#shared/types/api";
import { wordQuizProgress } from "#server/utils/db/schema";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const profileId = getRouterParam(event, "profileId") as string;

  const progressSchema = z.object({
    score: z.number().int().min(0).optional().default(0),
    level: z.number().int().min(1).optional().default(1),
    weights: z.record(z.string(), z.number()).optional().default({}),
    config: z.any().optional(),
  });

  const payload = await readValidatedBody(event, (data) => progressSchema.parse(data));

  try {
    const res = await d1
      .insert(wordQuizProgress)
      .values({
        profileId: profileId,
        score: payload.score,
        level: payload.level,
        weights: JSON.stringify(payload.weights),
        config: JSON.stringify(payload.config),
      })
      .returning()
      .get();

    return {
      ...res,
      weights: JSON.parse(res.weights),
      config: JSON.parse(res.config),
    } as WordQuizProgress;
  } catch (error: any) {
    console.error("Error inserting word progress:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to initialize progress",
    });
  }
});
