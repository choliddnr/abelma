import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../../src/db/schema';
import { getAuth } from '../../src/lib/auth';

import type { Env } from '../../src/types/env';


type Ctx = { env: Env, request: Request };

export const onRequestGet = async (context: Ctx) => {
  const { env, request } = context;
  const db = drizzle(env.abelma, { schema });
  const auth = getAuth(db, env);
  
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
      alphabetProgress: true,
      storybookProgress: true
    }
  });

  return new Response(JSON.stringify(userProfiles), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
