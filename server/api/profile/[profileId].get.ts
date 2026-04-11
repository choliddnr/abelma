import { profiles } from "#server/utils/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";
export default defineEventHandler(async (event) => {
  const profileId = getRouterParam(event, "profileId");
  const userId = event.context.session.user.id;
  try {
    const profile = await db(event)
      .select()
      .from(profiles)
      .where(eq(profiles.id, profileId!))
      .limit(1);
    return profile[0];
  } catch (error) {
    console.error("fetch profile failed:", error);
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: "Failed to fetch profile",
      }),
    );
  }
});
