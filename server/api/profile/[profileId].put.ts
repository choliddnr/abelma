import { z } from "zod";
import * as schema from "../../utils/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Handles updating an existing user profile.
 * It validates the request body using Zod and updates the profile record if the user owns it.
 */
export default defineEventHandler(async (event) => {
  const profileId = getRouterParam(event, "profileId");
  const userId = event.context.session.user.id;

  if (!profileId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Profile ID is required",
    });
  }

  // Validation schema for incoming profile updates.
  const profileSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(100).optional(),
    avatar: z.string().trim().min(1, "Avatar is required").optional(),
    coins: z.number().int().min(0).optional(),
  });

  // Validate the request body.
  const body = await readValidatedBody(event, (data) => profileSchema.parse(data));

  try {
    // Check ownership and existence
    const existing = await db(event)
      .select()
      .from(schema.profiles)
      .where(and(eq(schema.profiles.id, profileId), eq(schema.profiles.userId, userId)))
      .limit(1);

    if (!existing || existing.length === 0) {
      throw createError({
        statusCode: 403,
        statusMessage: "Profile not found or access denied",
      });
    }

    // Update the profile
    const results = await db(event)
      .update(schema.profiles)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(schema.profiles.id, profileId))
      .returning();

    if (!results || results.length === 0) {
      throw new Error("No record returned from database after update");
    }

    const profile = results[0];
    return profile as ResProfilePost;
  } catch (e: any) {
    return sendError(
      event,
      createError({
        statusCode: e.statusCode || 500,
        statusMessage: e.statusMessage || "Failed to update profile",
      }),
    );
  }
});
