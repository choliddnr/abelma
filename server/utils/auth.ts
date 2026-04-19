import type { H3Event } from "h3";
import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";

/**
 * Server-side BetterAuth instance.
 * Must be called per-request with the H3Event so the Cloudflare D1
 * binding and secrets are resolved from the edge runtime context.
 */
export const _auth = (e: H3Event) => {
  const { cloudflare } = e.context;

  return betterAuth({
    database: drizzleAdapter(db(e), {
      provider: "sqlite",
      schema,
    }),
    advanced: {
      database: {
        // Let BetterAuth handle ID generation for tables with text primary keys
      },
    },
    // Secrets pulled from Cloudflare env bindings at runtime with process.env fallbacks via runtimeConfig
    secret: cloudflare?.env?.BETTER_AUTH_SECRET ?? useRuntimeConfig(e).betterAuth.secret,
    baseURL:
      cloudflare?.env?.BETTER_AUTH_URL ??
      useRuntimeConfig(e).betterAuth.url ??
      "http://localhost:3000",
    emailAndPassword: {
      enabled: true,
      password: {
        hash: async (password) => {
          const encoder = new TextEncoder();
          const data = encoder.encode(password);
          const salt = crypto.getRandomValues(new Uint8Array(16));

          // Import the password as a key
          const key = await crypto.subtle.importKey("raw", data, { name: "PBKDF2" }, false, [
            "deriveBits",
          ]);

          // Derive the hash - Using 10,000 iterations for a balance of speed and security
          const hashBuffer = await crypto.subtle.deriveBits(
            {
              name: "PBKDF2",
              salt,
              iterations: 10000,
              hash: "SHA-256",
            },
            key,
            256,
          );

          // Store salt and hash together as a single string
          const saltHex = Array.from(salt)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
          const hashHex = Array.from(new Uint8Array(hashBuffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

          return `${saltHex}:${hashHex}`;
        },
        verify: async ({ hash, password }) => {
          const [saltHex, originalHashHex] = hash.split(":");
          const salt = new Uint8Array(saltHex!.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));

          const encoder = new TextEncoder();
          const data = encoder.encode(password);

          const key = await crypto.subtle.importKey("raw", data, { name: "PBKDF2" }, false, [
            "deriveBits",
          ]);

          const verifyBuffer = await crypto.subtle.deriveBits(
            {
              name: "PBKDF2",
              salt,
              iterations: 10000,
              hash: "SHA-256",
            },
            key,
            256,
          );

          const verifyHashHex = Array.from(new Uint8Array(verifyBuffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
          return verifyHashHex === originalHashHex;
        },
      },
    },
    socialProviders: {
      google: {
        clientId: cloudflare?.env?.GOOGLE_CLIENT_ID ?? useRuntimeConfig(e).google.clientId ?? "",
        clientSecret:
          cloudflare?.env?.GOOGLE_CLIENT_SECRET ?? useRuntimeConfig(e).google.clientSecret ?? "",
      },
    },
    plugins: [username()],
  });
};
