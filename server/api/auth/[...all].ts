import { defineEventHandler, toWebRequest } from "h3";

// Catch-all handler for BetterAuth: /api/auth/**
export default defineEventHandler((e) => {
  return _auth(e).handler(toWebRequest(e));
});
