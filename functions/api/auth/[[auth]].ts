import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../../../src/db/schema';
import { getAuth } from '../../../src/lib/auth';

type Ctx = {env: Env, request: Request}
export const onRequest = async (context: Ctx) => {
    const { request, env } = context;
    const db = drizzle(env.abelma, { schema });
    const auth = getAuth(db, env);
    return auth.handler(request);
};
