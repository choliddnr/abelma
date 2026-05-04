

import { registerProfileStore } from "~/utils/storeRegistry";

export type Challenge = {
  id: number;
  title: string;
  description: string;
  coinReward: number;
  status: string;
  completedAt?: string;
  createdAt?: string;
};

export const useChallengeStore = defineStore("challenge", () => {
  const challenges = ref<Challenge[]>([]);

  const reset = () => {
    challenges.value = [];
  };

  // Register for automatic cleanup
  registerProfileStore({ reset });



  const fetch = async () => {
    const activeProfileId = useProfileStore().activeProfileId;
    if (!activeProfileId) return;

    try {
      await $fetch<Challenge[]>("/api/challenges/profile/" + activeProfileId, {
        method: "GET",
        onResponse({ response }) {
          if (response.ok) {
            challenges.value = response._data;
          }
        },
      });
    } catch (error) {
      console.error("fetch challenge failed:", error);
    }
  };
  watch(
    () => useProfileStore().activeProfileId,
    async (newId) => {
      if (newId) await fetch();
    },
    { immediate: true },
  );

  return {
    challenges,
    reset,
    fetch,
  };
});
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useChallengeStore, import.meta.hot));
}
