import { authClient } from "~/utils/auth-client";

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === "/login") {
    return;
  }

  const session = await authClient.getSession({
    fetchOptions: {
      headers: useRequestHeaders(["cookie"]),
    },
  });

  if (!session?.data) {
    return navigateTo("/login");
  }

  // Handle Profile Requirement
  const { isLoaded, profiles } = storeToRefs(useProfileStore());

  // Skip check for login/welcome pages
  if (to.path === "/welcome") {
    return;
  }

  // Wait for initial sync if not loaded yet
  if (!isLoaded.value) {
    // We don't block here, but we will check again in the component onMount
    // or let the next middleware run handle it.
    // However, for a better feel, we can just return and let app.vue handle the loading state
    return;
  }

  if (profiles.value.length === 0) {
    return navigateTo("/welcome");
  }

  return;
});
