import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import * as schema from '../../src/db/schema';
import { getAuth } from '../../src/lib/auth';

interface Env {
  abelma: D1Database;
  BETTER_AUTH_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_URL?: string;
}

type Ctx = { env: Env, request: Request };

export const onRequestGet = async (context: Ctx) => {
  const { env, request } = context;
  const db = drizzle(env.abelma, { schema });
  const auth = getAuth(db as any, env);
  
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const userId = session.user.id;

  // Fetch everything for this user
  const userProfiles = await db.query.profiles.findMany({
    where: eq(schema.profiles.userId, userId),
    with: {
      rewards: true,
      analytics: true,
      stickers: true,
      alphabetProgress: true
    }
  });

  return new Response(JSON.stringify(userProfiles), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const onRequestPost = async (context: Ctx) => {
  const { env, request } = context;
  const db = drizzle(env.abelma, { schema });
  const auth = getAuth(db as any, env);
  
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const userId = session.user.id;
  const payload = await request.json() as any[];

  // Expected payload: array of profiles with their associated data
  // We'll perform a batch upsert
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

      // 2. Rewards
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

      // 3. Stickers
      if (p.stickers && Array.isArray(p.stickers)) {
        for (const s of p.stickers) {
          // Stickers usually just added
          await db.insert(schema.stickers).values({
            profileId: p.id,
            stickerId: s.stickerId,
          }).onConflictDoNothing();
        }
      }

      // 4. Analytics
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

      // 5. Alphabet Progress
      if (p.alphabetProgress) {
        const ap = p.alphabetProgress;
        await db.insert(schema.alphabetProgress).values({
          profileId: p.id,
          score: ap.score,
          level: ap.level,
          weights: ap.weights,
          updatedAt: new Date().toISOString()
        }).onConflictDoUpdate({
          target: schema.alphabetProgress.profileId,
          set: {
            score: ap.score,
            level: ap.level,
            weights: ap.weights,
            updatedAt: new Date().toISOString()
          }
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
