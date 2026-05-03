import { z } from "zod";
import { cvcProgress, profiles } from "#server/utils/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const profileId = getRouterParams(event).profileId as string;

  const progressSchema = z.object({
    score: z.number().int().min(0).optional(),
    learningLevel: z.number().int().min(1).optional(),
    levelScores: z.record(z.string(), z.number()).optional(),
    quizScore: z.number().int().min(0).optional(),
    quizLevel: z.number().int().min(1).optional(),
    quizWeights: z.record(z.string(), z.number()).optional(),
    learningWeights: z.record(z.string(), z.number()).optional(),
    coins: z.number().int().optional(),
    config: z.object({
      coinReward: z.number().int().min(0).optional(),
      levelUpReward: z.number().int().min(0).optional(),
      learningLevelUpReward: z.number().int().min(0).optional(),
      streakThreshold: z.number().int().min(0).optional(),
      streakReward: z.number().int().min(0).optional(),
    }).optional(),
    updatedAt: z.string().datetime().or(z.date()).optional(),
  });

  const payload = await readValidatedBody(event, (data) => progressSchema.parse(data));

  try {
    const updateData: any = {
      updatedAt: payload.updatedAt ? new Date(payload.updatedAt) : new Date(),
    };

    if (payload.score !== undefined) updateData.score = payload.score;
    if (payload.learningLevel !== undefined) updateData.learningLevel = payload.learningLevel;
    if (payload.levelScores !== undefined) updateData.levelScores = JSON.stringify(payload.levelScores);
    if (payload.quizScore !== undefined) updateData.quizScore = payload.quizScore;
    if (payload.quizLevel !== undefined) updateData.quizLevel = payload.quizLevel;
    if (payload.quizWeights !== undefined) updateData.quizWeights = JSON.stringify(payload.quizWeights);
    if (payload.learningWeights !== undefined) updateData.learningWeights = JSON.stringify(payload.learningWeights);
    if (payload.config !== undefined) updateData.config = JSON.stringify(payload.config);

    const res = await d1
      .update(cvcProgress)
      .set(updateData)
      .where(eq(cvcProgress.profileId, profileId))
      .returning()
      .get();

    if (!res) {
      throw createError({
        statusCode: 404,
        statusMessage: "CVC Progress not found",
      });
    }

    if (payload.coins !== undefined) {
      await d1
        .update(profiles)
        .set({ coins: payload.coins, updatedAt: updateData.updatedAt })
        .where(eq(profiles.id, profileId))
        .execute();
    }

    return {
      ...res,
      levelScores: JSON.parse(res.levelScores),
      quizWeights: JSON.parse(res.quizWeights),
      learningWeights: JSON.parse(res.learningWeights),
      config: JSON.parse(res.config),
    };
  } catch (error: any) {
    if (error.statusCode) throw error;

    console.error("Error updating CVC progress:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update CVC progress",
    });
  }
});
