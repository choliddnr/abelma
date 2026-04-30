export default defineNuxtRouteMiddleware(async (to) => {
  // Only run on client side to avoid hydration issues with storage-backed state
  if (process.server) return;

  const profileStore = useProfileStore();
  const userStore = useUserStore();
  const { session } = storeToRefs(userStore);
  const { activeProfileId, isLoaded, profiles } = storeToRefs(profileStore);

  // Define routes that don't require an active profile
  const bypassRoutes = ["/profiles", "/welcome", "/login", "/signup"];

  // If we're already going to a bypass route, stop here
  if (bypassRoutes.includes(to.path)) return;

  // If not logged in, auth.global.ts will handle it
  if (!session.value) return;

  // Ensure profiles are loaded
  if (!isLoaded.value) {
    await profileStore.fetchProfiles();
  }

  // If no profile is active, redirect to selection or creation
  if (!activeProfileId.value) {
    if (profiles.value.length === 0) {
      return navigateTo("/welcome");
    }
    return navigateTo("/profiles");
  }
});
