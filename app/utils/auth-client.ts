import { createAuthClient } from "better-auth/vue";
import { usernameClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  // Use the origin at runtime or default to 3000
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NUXT_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [usernameClient()],
});
export type Session = typeof authClient.$Infer.Session;
