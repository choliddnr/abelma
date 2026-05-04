import { letterTrace, profiles } from "#server/utils/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const profileId = getRouterParams(event).profileId as string;
  const body = await readBody(event);

  try {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.stars !== undefined) updateData.stars = JSON.stringify(body.stars);
    if (body.config !== undefined) updateData.config = JSON.stringify(body.config);

    // If coins are provided, we also update the profile's coins
    if (body.coins !== undefined) {
      await d1
        .update(profiles)
        .set({ coins: body.coins, updatedAt: new Date() })
        .where(eq(profiles.id, profileId))
        .run();
    }

    const res = await d1
      .update(letterTrace)
      .set(updateData)
      .where(eq(letterTrace.profileId, profileId))
      .returning()
      .get();

    if (!res) {
       throw createError({
        statusCode: 404,
        statusMessage: "Progress not found",
      });
    }

    return {
      stars: JSON.parse(res.stars),
      config: JSON.parse(res.config),
      updatedAt: res.updatedAt,
    };
  } catch (error) {
    console.error("Error updating Tracing progress:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
