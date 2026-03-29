import { eq } from 'drizzle-orm';
import * as schema from '../utils/db/schema';

export default defineEventHandler(async (event) => {
  const method = event.method;
  const d1 = db(event);

  if (method === 'GET') {
    const query = getQuery(event);
    const user = query.user as string;

    if (!user) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing user parameter',
      });
    }

    const results = await d1.select().from(schema.alphabetProgress).where(eq(schema.alphabetProgress.profileId, user)).limit(1);

    if (!results || results.length === 0) {
      return { score: 0, level: 0, weights: {} };
    }

    return {
      score: results[0].score,
      level: results[0].level,
      weights: JSON.parse(results[0].weights)
    };
  }

  if (method === 'POST') {
    const body = await readBody(event) as { 
      profileId: string, 
      score: number, 
      level: number, 
      weights: Record<string, number> 
    };

    const { profileId, score, level, weights } = body;

    if (!profileId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing user field',
      });
    }

    const existing = await d1.select().from(schema.alphabetProgress).where(eq(schema.alphabetProgress.profileId, profileId)).limit(1);

    if (existing.length === 0) {
      await d1.insert(schema.alphabetProgress).values({
        profileId,
        score,
        level,
        weights: JSON.stringify(weights)
      });
    } else {
      await d1.update(schema.alphabetProgress)
        .set({
          score,
          level,
          weights: JSON.stringify(weights),
          updatedAt: new Date().toISOString()
        })
        .where(eq(schema.alphabetProgress.profileId, profileId));
    }

    return { success: true };
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed',
  });
});
