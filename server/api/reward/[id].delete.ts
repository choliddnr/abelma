import { rewards } from "#server/utils/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  return await db(event).delete(rewards).where(eq(rewards.id, id!)).returning().get();
});
