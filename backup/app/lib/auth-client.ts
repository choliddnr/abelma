import { createAuthClient } from "better-auth/vue";

export const authClient = createAuthClient({
    // Use the origin at runtime or default to 3000
    baseURL: typeof window !== 'undefined' ? window.location.origin : (process.env.NUXT_BETTER_AUTH_URL || "http://localhost:3000")
});

