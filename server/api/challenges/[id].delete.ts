import { challenges } from "#server/utils/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  return await db(event)
    .delete(challenges)
    .where(eq(challenges.id, Number(id)))
    .returning()
    .get();
});
