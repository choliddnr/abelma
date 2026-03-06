import { drizzle } from 'drizzle-orm/d1';
import { gameState } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

interface Env {
  abelma: D1Database;
}

export const onRequestGet = async (context: any) => {
  const { env } = context;
  try {
    const db = drizzle(env.abelma);
    const results = await db.select().from(gameState).where(eq(gameState.id, 1)).limit(1);

    if (!results || results.length === 0) {
      return new Response(JSON.stringify({ score: 0, level: 0, weights: {} }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({
      score: results[0].score,
      level: results[0].level,
      weights: JSON.parse(results[0].weights)
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

export const onRequestPost = async (context: any) => {
  const { request, env } = context;
  try {
    const db = drizzle(env.abelma);
    const { score, level, weights } = await request.json() as any;

    const existing = await db.select().from(gameState).where(eq(gameState.id, 1)).limit(1);

    if (existing.length === 0) {
      await db.insert(gameState).values({
        id: 1,
        score,
        level,
        weights: JSON.stringify(weights)
      });
    } else {
      await db.update(gameState)
        .set({
          score,
          level,
          weights: JSON.stringify(weights),
          updatedAt: new Date().toISOString()
        })
        .where(eq(gameState.id, 1));
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
