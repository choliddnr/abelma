import type { Reward } from "#shared/types/api";

export const useRewardStore = defineStore("reward", () => {
  // Other Stores
  // const { activeProfileId } = storeToRefs(useProfileStore());
  // const { syncProfile } = useSyncStore();

  // State
  // const profileCoinsMap = ref<Record<string, number>>({});
  // const profileRewardsMap = ref<Record<string, Reward[]>>({});

  // const coins = computed({
  //   get: () => {
  //     return activeProfileId.value
  //       ? profileCoinsMap.value[activeProfileId.value] || 0
  //       : 0;
  //   },
  //   set: (val) => {
  //     if (activeProfileId.value) {
  //       profileCoinsMap.value[activeProfileId.value] = val;
  //     }
  //   },
  // });

  // const rewards = computed({
  //   get: () => {
  //     if (!activeProfileId.value) return [];
  //     if (!profileRewardsMap.value[activeProfileId.value]) {
  //       profileRewardsMap.value[activeProfileId.value] = [];
  //     }
  //     return profileRewardsMap.value[activeProfileId.value]!;
  //   },
  //   set: (val) => {
  //     if (activeProfileId.value) {
  //       profileRewardsMap.value[activeProfileId.value] = val;
  //     }
  //   },
  // });

  // Actions
  // const addCoins = async (amount: number) => {
  //   if (!activeProfileId.value) return;

  //   coins.value += amount;
  // };

  // const deductCoins = async (amount: number): Promise<boolean> => {
  //   if (!activeProfileId.value) return false;
  //   if (coins.value >= amount) {
  //     coins.value -= amount;
  //     return true;
  //   }
  //   return false;
  // };

  const rewards = ref<Reward[]>([]);

  // const addCustomReward = async (
  //   title: string,
  //   cost: number,
  //   emoji: string,
  // ) => {
  //   if (!activeProfileId.value) return;
  //   const newReward: Reward = {
  //     id: `reward-${Date.now()}`,
  //     title,
  //     cost,
  //     emoji,
  //     status: "available",
  //   };
  //   rewards.value.push(newReward);
  //   await triggerSync();
  // };

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

  // const triggerSync = async () => {
  //   await syncProfile();
  // };

  // // Computed
  // const availableRewards = computed(() => {
  //   return rewards.value.filter((r) => r.status === "available");
  // });

  // const claimedRewards = computed(() => {
  //   return rewards.value.filter((r) => r.status === "claimed");
  // });

  // const fulfilledRewards = computed(() => {
  //   return rewards.value.filter((r) => r.status === "fulfilled");
  // });

  // const canAfford = (cost: number): boolean => {
  //   return coins.value >= cost;
  // };

  // const reset = () => {
  //   profileCoinsMap.value = {};
  //   profileRewardsMap.value = {};
  // };

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
