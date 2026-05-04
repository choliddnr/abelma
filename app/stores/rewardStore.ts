import type { Reward } from "#shared/types/api";
import { registerProfileStore } from "~/utils/storeRegistry";

export const useRewardStore = defineStore("reward", () => {
  const rewards = ref<Reward[]>([]);

  const deleteReward = async (rewardId: number) => {
    // const index = rewards.value.findIndex((r) => r.id === rewardId);
    // if (index !== -1) {
    //   rewards.value.splice(index, 1);
    //   // await triggerSync();
    // }
  };

  const reset = () => {
    rewards.value = [];
  };

  // Register for automatic cleanup
  registerProfileStore({ reset });

  const fetch = async () => {
    const activeProfileId = useProfileStore().activeProfileId;
    if (!activeProfileId) return;

    try {
      await $fetch<Reward[]>("/api/reward/profile/" + activeProfileId, {
        method: "GET",
        onResponse({ response }) {
          if (response.ok) {
            rewards.value = response._data;
          }
        },
      });
    } catch (error) {
      console.error("fetch reward failed:", error);
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
    rewards,
    deleteReward,
    reset,
    fetch,
  };
});
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRewardStore, import.meta.hot));
}
