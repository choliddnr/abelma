import { profiles } from "#server/utils/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";
export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, "id") as string;
  try {
    const res = await db(event).select().from(profiles).where(eq(profiles.userId, userId));
    return res;
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
