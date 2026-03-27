import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../../../src/db/schema';
import { getAuth } from '../../../src/lib/auth';

import type { Env } from '../../../src/types/env';
import type { CloudProfile } from '../../../src/types/sync';

type Ctx = { env: Env, request: Request };

export const onRequestPost = async (context: Ctx) => {
  const { env, request } = context;
  const db = drizzle(env.abelma, { schema });
  const auth = getAuth(db, env);
  
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const userId = session.user.id;
  const payload = await request.json() as CloudProfile[];

  try {
    for (const p of payload) {
      // 1. Rewards
      if (p.rewards && Array.isArray(p.rewards)) {
        for (const r of p.rewards) {
          await db.insert(schema.rewards).values({
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
          await db.insert(schema.stickers).values({
            profileId: p.id,
            stickerId: s.stickerId,
          }).onConflictDoNothing();
        }
      }
    }

    const userProfiles = await db.query.profiles.findMany({
      where: eq(schema.profiles.userId, userId),
      with: {
        rewards: true,
        stickers: true
      }
    });

    return new Response(JSON.stringify(userProfiles), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    const error = e as Error;
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
