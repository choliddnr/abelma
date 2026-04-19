import { rewards } from "#server/utils/db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export default defineEventHandler(async (event) => {
  const d1 = db(event);
  const id = Number(getRouterParam(event, "id"));

  try {
    const res = await d1.delete(rewards).where(eq(rewards.id, id)).returning().get();
    return res;
  } catch (error) {
    console.error("Error claiming the reward:", error);
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
      }),
    );
  }
});
