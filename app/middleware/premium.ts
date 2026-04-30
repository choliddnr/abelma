export default defineNuxtRouteMiddleware(async (to, from) => {
  const userStore = useUserStore();
  const { session, user } = storeToRefs(userStore);

  // Ensure session is loaded if not already
  if (!session.value) {
    await userStore.fetchSession();
  }

  if (!session.value || !user.value) {
    return navigateTo("/login");
  }

  const tier = (user.value as any).tier;
  const premiumUntil = (user.value as any).premiumUntil;

  let isPremium = false;
  if (tier === "premium") {
    if (premiumUntil) {
      if (new Date(premiumUntil) > new Date()) {
        isPremium = true;
      }
    } else {
      // Lifetime or unspecified
      isPremium = true;
    }
  }

  if (!isPremium) {
    return navigateTo("/parent/premium");
  }
});
