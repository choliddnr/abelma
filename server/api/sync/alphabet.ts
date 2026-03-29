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
      // 1. Alphabet Progress
      if (p.alphabetProgress) {
        const ap = p.alphabetProgress;
        await d1.insert(schema.alphabetProgress).values({
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
          await d1.insert(schema.storybookProgress).values({
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
    const userProfiles = await d1.query.profiles.findMany({
      where: eq(schema.profiles.userId, userId),
      with: {
        alphabetProgress: true,
        storybookProgress: true
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
