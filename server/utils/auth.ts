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
        // Let BetterAuth handle ID generation for tables with text primary keys
      },
    },
    // Secrets pulled from Cloudflare env bindings at runtime with process.env fallbacks via runtimeConfig
    secret: cloudflare?.env?.BETTER_AUTH_SECRET ?? useRuntimeConfig(e).betterAuth.secret,
    baseURL: cloudflare?.env?.BETTER_AUTH_URL ?? useRuntimeConfig(e).betterAuth.url ?? 'http://localhost:3000',
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: cloudflare?.env?.GOOGLE_CLIENT_ID ?? useRuntimeConfig(e).google.clientId ?? '',
        clientSecret: cloudflare?.env?.GOOGLE_CLIENT_SECRET ?? useRuntimeConfig(e).google.clientSecret ?? '',
      },
    },
  });
};
