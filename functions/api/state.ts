import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1';
import { belajarHurufGameState } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

interface Env {
  abelma: DrizzleD1Database;
}
type Ctx =  {env: Env, request: Request}

export const onRequestGet = async (context: Ctx) => {
  const { env, request } = context;
  try {
    const url = new URL(request.url);
    const user = url.searchParams.get('user');
    console.log("user", user);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Missing user parameter' }), { status: 400 });
    }

    const db = drizzle(env.abelma);
    const results = await db.select().from(belajarHurufGameState).where(eq(belajarHurufGameState.user, user)).limit(1);

    if (!results || results.length === 0) {
      return new Response(JSON.stringify({ score: 0, level: 0, weights: {} }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({
      score: results[0].score,
      level: results[0].level,
      weights: JSON.parse(results[0].weights)
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e:any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

export const onRequestPost = async (context: Ctx) => {
  const { request, env } = context;
  try {
    const db = drizzle(env.abelma);
    const { user, score, level, weights } = await request.json() as any;

    if (!user) {
      return new Response(JSON.stringify({ error: 'Missing user field' }), { status: 400 });
    }

    const existing = await db.select().from(belajarHurufGameState).where(eq(belajarHurufGameState.user, user)).limit(1);

    if (existing.length === 0) {
      await db.insert(belajarHurufGameState).values({
        user,
        score,
        level,
        weights: JSON.stringify(weights)
      });
    } else {
      await db.update(belajarHurufGameState)
        .set({
          score,
          level,
          weights: JSON.stringify(weights),
          updatedAt: new Date().toISOString()
        })
        .where(eq(belajarHurufGameState.user, user));
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

