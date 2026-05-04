import { letterTrace } from "#server/utils/db/schema";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const profileId = getRouterParams(event).profileId as string;

  const initialStars = "{}";
  const defaultConfig = JSON.stringify([500, 600, 700, 800, 1000]);

  try {
    const res = await d1
      .insert(letterTrace)
      .values({
        profileId,
        stars: initialStars,
        config: defaultConfig,
        updatedAt: new Date(),
      })
      .returning()
      .get();

    return {
      stars: JSON.parse(res.stars),
      config: JSON.parse(res.config),
      updatedAt: res.updatedAt,
    };
  } catch (error) {
    console.error("Error creating Tracing progress:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
