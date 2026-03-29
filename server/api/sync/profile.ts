import { eq, and } from "drizzle-orm";
import * as schema from "../../utils/db/schema";
import type { CloudProfile } from "../../../app/types/sync";

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
  const method = event.method;

  if (method === "POST") {
    const payload = (await readBody(event)) as CloudProfile[];

    try {
      for (const p of payload) {
        // 1. Profile
        await d1
          .insert(schema.profiles)
          .values({
            id: p.id,
            userId: userId,
            name: p.name,
            avatar: p.avatar,
            coins: p.coins || 0,
            letterCase: p.letterCase || "uppercase",
            timerDuration: p.timerDuration ?? 30,
            updatedAt: new Date().toISOString(),
          })
          .onConflictDoUpdate({
            target: schema.profiles.id,
            set: {
              name: p.name,
              avatar: p.avatar,
              coins: p.coins,
              letterCase: p.letterCase,
              timerDuration: p.timerDuration,
              updatedAt: new Date().toISOString(),
            },
          });

        // 2. Analytics
        if (p.analytics && Array.isArray(p.analytics)) {
          for (const a of p.analytics) {
            await d1
              .insert(schema.analytics)
              .values({
                profileId: p.id,
                type: a.type,
                targetId: a.targetId,
                mistakes: a.mistakes,
                lastAttempt: a.lastAttempt,
              })
              .onConflictDoUpdate({
                target: [
                  schema.analytics.profileId,
                  schema.analytics.type,
                  schema.analytics.targetId,
                ],
                set: {
                  mistakes: a.mistakes,
                  lastAttempt: a.lastAttempt,
                },
              });
          }
        }
      }

      const userProfiles = await d1.query.profiles.findMany({
        where: eq(schema.profiles.userId, userId),
        with: {
          analytics: true,
        },
      });

      return userProfiles;
    } catch (e) {
      const error = e as Error;
      throw createError({
        statusCode: 500,
        statusMessage: error.message,
      });
    }
  }

  if (method === "DELETE") {
    const query = getQuery(event);
    const profileId = query.id as string;

    if (!profileId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing profile ID",
      });
    }

    try {
      const profile = await d1.query.profiles.findFirst({
        where: (p, { eq, and }) =>
          and(eq(p.id, profileId), eq(p.userId, userId)),
      });

      if (!profile) {
        throw createError({
          statusCode: 404,
          statusMessage: "Profile not found or not owned by user",
        });
      }

      await d1.delete(schema.profiles).where(eq(schema.profiles.id, profileId));

      return { success: true };
    } catch (e) {
      const error = e as Error;
      throw createError({
        statusCode: 500,
        statusMessage: error.message,
      });
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: "Method Not Allowed",
  });
});
