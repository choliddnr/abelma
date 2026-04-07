import { eq } from "drizzle-orm";
import * as schema from "../../utils/db/schema";

export default defineEventHandler(async (event) => {
  const auth = _auth(event);
  const session = await auth.api.getSession({ headers: event.headers });

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const userId = session.user.id;
  const d1 = db(event);

  // Fetch everything for this user
  const userProfiles = await d1.query.profiles.findMany({
    where: eq(schema.profiles.userId, userId),
    with: {
      rewards: true,
      analytics: true,
      stickers: true,
      alphabetChallengeProgress: true,
      storybookProgress: true,
    },
  });

  return userProfiles;
});
