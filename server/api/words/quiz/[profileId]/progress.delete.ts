import { wordQuizProgress } from "#server/utils/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const profileId = getRouterParam(event, "profileId") as string;

  try {
    const res = await d1
      .delete(wordQuizProgress)
      .where(eq(wordQuizProgress.profileId, profileId))
      .returning()
      .get();

    if (!res) {
      return { success: false, message: "Progress not found" };
    }

    return { success: true, profileId };
  } catch (error) {
    console.error("Error deleting word progress:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
