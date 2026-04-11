import type { H3Event } from "h3";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../utils/db/schema";

export const db = (e: H3Event): DB => {
  const { cloudflare } = e.context;
  if (!cloudflare?.env?.abelma) throw new Error('D1 binding "abelma" not found in Cloudflare env');

  return drizzle(cloudflare.env.abelma, {
    schema,
    casing: "snake_case",
  });
};

export type DB = DrizzleD1Database<typeof schema>;
