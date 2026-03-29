import { eq } from 'drizzle-orm';
import * as schema from '../../utils/db/schema';
import type { CloudProfile } from '../../../app/types/sync';

export default defineEventHandler(async (event) => {
  const auth = _auth(event);
  const session = await auth.api.getSession({ headers: event.headers });
  
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const userId = session.user.id;
  const d1 = db(event);
  const payload = await readBody(event) as CloudProfile[];

  try {
    for (const p of payload) {
      // 1. Rewards
      if (p.rewards && Array.isArray(p.rewards)) {
        for (const r of p.rewards) {
          await d1.insert(schema.rewards).values({
            id: r.id,
            profileId: p.id,
            title: r.title,
            cost: r.cost,
            emoji: r.emoji,
            status: r.status,
            claimedAt: r.claimedAt,
          }).onConflictDoUpdate({
            target: schema.rewards.id,
            set: {
              status: r.status,
              claimedAt: r.claimedAt
            }
          });
        }
      }

      // 2. Stickers
      if (p.stickers && Array.isArray(p.stickers)) {
        for (const s of p.stickers) {
          await d1.insert(schema.stickers).values({
            profileId: p.id,
            stickerId: s.stickerId,
          }).onConflictDoNothing();
        }
      }
    }

    const userProfiles = await d1.query.profiles.findMany({
      where: eq(schema.profiles.userId, userId),
      with: {
        rewards: true,
        stickers: true
      }
    });

    return userProfiles;
  } catch (e) {
    const error = e as Error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});
