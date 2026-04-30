export const useSubscription = () => {
  const userStore = useUserStore();
  const { session, user } = storeToRefs(userStore);

  const isPremium = computed(() => {
    if (!session.value || !user.value) return false;

    const currentUser = user.value as any;
    if (currentUser.tier !== "premium") return false;

    if (currentUser.premiumUntil) {
      return new Date(currentUser.premiumUntil) > new Date();
    }

    return true; // Lifetime access
  });

  return {
    isPremium,
  };
};
