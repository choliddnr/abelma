import type { H3Event } from 'h3';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import * as schema from './db/schema';

/**
 * Server-side BetterAuth instance.
 * Must be called per-request with the H3Event so the Cloudflare D1
 * binding and secrets are resolved from the edge runtime context.
 */
export const _auth = (e: H3Event) => {
  const { cloudflare } = e.context;

  return betterAuth({
    database: drizzleAdapter(db(e), {
      provider: 'sqlite',
      schema,
    }),
    advanced: {
      database: {
        generateId: false,
      },
    },
    // Secrets pulled from Cloudflare env bindings at runtime
    secret: cloudflare?.env?.BETTER_AUTH_SECRET ?? process.env.NUXT_BETTER_AUTH_SECRET,
    baseURL: cloudflare?.env?.BETTER_AUTH_URL ?? process.env.NUXT_BETTER_AUTH_URL ?? 'http://localhost:3000',
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: cloudflare?.env?.GOOGLE_CLIENT_ID ?? process.env.NUXT_GOOGLE_CLIENT_ID ?? '',
        clientSecret: cloudflare?.env?.GOOGLE_CLIENT_SECRET ?? process.env.NUXT_GOOGLE_CLIENT_SECRET ?? '',
      },
    },
  });
};
