import { z } from "zod";
import * as schema from "../../utils/db/schema";

/**
 * Handles the creation of a new user profile.
 * It validates the request body using Zod and inserts a new profile record associated with the authenticated user.
 *
 * @param event - The H3 HTTP event.
 * @returns {Promise<ResProfilePost>} The newly created profile record.
 */
export default defineEventHandler(async (event) => {
  // Why: This API exists to allow parents to create children profiles.
  // Tricky Logic: We rely on the auth middleware to ensure only authenticated users can reach this,
  // providing their session data in the event context.

  // Validation schema for incoming profile data.
  const profileSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(100),
    avatar: z.string().trim().min(1, "Avatar is required"),
  });

  // Validate the request body. If validation fails, H3 will automatically throw a 400 error.
  const body = await readValidatedBody(event, (data) => profileSchema.parse(data));

  // The session is pre-validated by server/middleware/auth.ts
  const userId = event.context.session.user.id;

  try {
    const newProfile = {
      id: crypto.randomUUID(), // Why: Using unique string IDs for profile identification as per DB schema
      userId,
      name: body.name,
      avatar: body.avatar,
      // Note: coins, createdAt, and updatedAt are handled by DB defaults/triggers
    };

    const results = await db(event).insert(schema.profiles).values(newProfile).returning();

    if (!results || results.length === 0) {
      throw new Error("No record returned from database");
    }

    const profile = results[0];
    return profile as ResProfilePost;
  } catch (e) {
    // Standardized error response according to project rules
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: "Failed to create profile",
      }),
    );
  }
});
