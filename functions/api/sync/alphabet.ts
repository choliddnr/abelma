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
      // 1. Alphabet Progress
      if (p.alphabetProgress) {
        const ap = p.alphabetProgress;
        await db.insert(schema.alphabetProgress).values({
          profileId: p.id,
          score: ap.score,
          level: ap.level,
          weights: ap.weights,
          challengeConfig: ap.challengeConfig ?? '[]',
          updatedAt: ap.updatedAt || new Date().toISOString()
        }).onConflictDoUpdate({
          target: schema.alphabetProgress.profileId,
          set: {
            score: ap.score,
            level: ap.level,
            weights: ap.weights,
            challengeConfig: ap.challengeConfig ?? '[]',
            updatedAt: ap.updatedAt || new Date().toISOString()
          }
        });
      }

      // 2. Storybook Progress
      if (p.storybookProgress && Array.isArray(p.storybookProgress)) {
        for (const s of p.storybookProgress) {
          await db.insert(schema.storybookProgress).values({
            profileId: p.id,
            letter: s.letter,
            isCompleted: s.isCompleted,
            lastRead: s.lastRead
          }).onConflictDoUpdate({
            target: [schema.storybookProgress.profileId, schema.storybookProgress.letter],
            set: {
              isCompleted: s.isCompleted,
              lastRead: s.lastRead
            }
          });
        }
      }
    }

    // 3. Return the latest alphabet/storybook state
    const userProfiles = await db.query.profiles.findMany({
      where: eq(schema.profiles.userId, userId),
      with: {
        alphabetProgress: true,
        storybookProgress: true
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
