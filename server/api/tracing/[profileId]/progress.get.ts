import { letterTrace } from "#server/utils/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const profileId = getRouterParams(event).profileId as string;

  try {
    const res = await d1
      .select({
        stars: letterTrace.stars,
        config: letterTrace.config,
        updatedAt: letterTrace.updatedAt,
      })
      .from(letterTrace)
      .where(eq(letterTrace.profileId, profileId))
      .get();

    if (res) {
      return {
        stars: JSON.parse(res.stars),
        config: JSON.parse(res.config),
        updatedAt: res.updatedAt,
      };
    }

    return null;
  } catch (error) {
    console.error("Error selecting Tracing progress:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
