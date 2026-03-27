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
      // 1. Profile
      await db.insert(schema.profiles).values({
        id: p.id,
        userId: userId,
        name: p.name,
        avatar: p.avatar,
        points: p.points || 0,
        letterCase: p.letterCase || 'uppercase',
        timerDuration: p.timerDuration ?? 30,
        updatedAt: new Date().toISOString()
      }).onConflictDoUpdate({
        target: schema.profiles.id,
        set: {
          name: p.name,
          avatar: p.avatar,
          points: p.points,
          letterCase: p.letterCase,
          timerDuration: p.timerDuration,
          updatedAt: new Date().toISOString()
        }
      });

      // 2. Analytics
      if (p.analytics && Array.isArray(p.analytics)) {
        for (const a of p.analytics) {
          await db.insert(schema.analytics).values({
            profileId: p.id,
            type: a.type,
            targetId: a.targetId,
            mistakes: a.mistakes,
            lastAttempt: a.lastAttempt
          }).onConflictDoUpdate({
            target: [schema.analytics.profileId, schema.analytics.type, schema.analytics.targetId],
            set: {
              mistakes: a.mistakes,
              lastAttempt: a.lastAttempt
            }
          });
        }
      }
    }

    const userProfiles = await db.query.profiles.findMany({
      where: eq(schema.profiles.userId, userId),
      with: {
        analytics: true
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

export const onRequestDelete = async (context: Ctx) => {
  const { env, request } = context;
  const db = drizzle(env.abelma, { schema });
  const auth = getAuth(db, env);
  
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const userId = session.user.id;
  
  const url = new URL(request.url);
  const profileId = url.searchParams.get('id');
  if (!profileId) {
    return new Response(JSON.stringify({ error: 'Missing profile ID' }), { status: 400 });
  }

  try {
    const profile = await db.query.profiles.findFirst({
      where: (p, { eq, and }) => and(eq(p.id, profileId), eq(p.userId, userId))
    });

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Profile not found or not owned by user' }), { status: 404 });
    }

    await db.delete(schema.profiles).where(eq(schema.profiles.id, profileId));

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    const error = e as Error;
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
