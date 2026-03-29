import { authClient } from "~/lib/auth-client";

export default defineNuxtRouteMiddleware(async () => {
  const { data: session } = await authClient.useSession(useFetch);
  console.log("session", session);
  if (!session.value) {
    return navigateTo("/login");
  }
});
