import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "../db/schema";
import { DrizzleD1Database } from "drizzle-orm/d1";
import type { Env } from "../types/env";

export const getAuth = (db: DrizzleD1Database<typeof schema>, env: Env) => betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite",
        schema,
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL || "http://localhost:5173",
    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
    },
});

