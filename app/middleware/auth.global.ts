export default defineNuxtRouteMiddleware(async (to) => {
  const userStore = useUserStore();
  const { session } = storeToRefs(userStore);

  // Ensure session is loaded if not already
  if (!session.value) {
    await userStore.fetchSession();
  }

  // Define public routes that don't require authentication
  const publicPages = ["/login", "/signup"];

  // If user is not logged in and trying to access a protected page, redirect to login
  if (!session.value && !publicPages.includes(to.path)) {
    return navigateTo("/login");
  }

  // Optional: If user is logged in and tries to access login/signup, redirect to home
  if (session.value && publicPages.includes(to.path)) {
    return navigateTo("/");
  }
});
