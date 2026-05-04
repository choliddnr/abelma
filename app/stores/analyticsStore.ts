import type { Analytics, WordAnalytics, CloudProfile } from "@/types/stores";
import { registerProfileStore } from "~/utils/storeRegistry";

export const useAnalyticsStore = defineStore(
  "analytics",
  () => {
    // Other Stores
    const { profiles } = storeToRefs(useProfileStore());

    // State
    const analyticsMap = ref<Record<string, Record<string, WordAnalytics>>>({});

    const reset = () => {
      analyticsMap.value = {};
    };

    // Register for automatic cleanup
    registerProfileStore({ reset });

    // Actions
    const recordMistake = async (profileId: string, type: string, targetId: string) => {
      if (!analyticsMap.value[profileId]) {
        analyticsMap.value[profileId] = {};
      }

      if (!analyticsMap.value[profileId][targetId]) {
        analyticsMap.value[profileId][targetId] = {
          mistakes: 0,
          lastAttempt: new Date(),
        };
      }

      analyticsMap.value[profileId][targetId].mistakes++;
      analyticsMap.value[profileId][targetId].lastAttempt = new Date();
    };

    const getProfileAnalytics = async (
      profileId: string,
    ): Promise<Record<string, WordAnalytics>> => {
      return analyticsMap.value[profileId] || {};
    };

    const getAllAnalytics = async (): Promise<Analytics[]> => {
      const allAnalytics: Analytics[] = [];

      for (const profile of profiles.value) {
        const profileAnalytics = await getProfileAnalytics(profile.id);
        for (const [targetId, analytics] of Object.entries(profileAnalytics)) {
          allAnalytics.push({
            type: "word",
            targetId,
            mistakes: analytics.mistakes,
            lastAttempt: analytics.lastAttempt,
          });
        }
      }

      return allAnalytics;
    };

    /**
     * Fetches a high-level summary of all modules for a specific child.
     * Use this in parent views to avoid switching the 'active' profile.
     */
    const fetchModuleSummary = async (profileId: string) => {
      try {
        const [alphabet, words, cvc, ddv, nasal] = await Promise.all([
          $fetch(`/api/alphabet/quiz/${profileId}/progress`),
          $fetch(`/api/words/quiz/${profileId}/progress`),
          $fetch(`/api/cvc/${profileId}/progress`),
          $fetch(`/api/ddv/${profileId}/progress`),
          $fetch(`/api/nasal/${profileId}/progress`),
        ]);

        return { alphabet, words, cvc, ddv, nasal };
      } catch (error) {
        console.error(`Failed to fetch module summary for ${profileId}:`, error);
        return null;
      }
    };

    const resetAnalytics = async (profileId: string) => {
      analyticsMap.value[profileId] = {};
    };

    // Computed
    const totalMistakes = computed(() => {
      let total = 0;
      for (const profileAnalytics of Object.values(analyticsMap.value)) {
        for (const analytics of Object.values(profileAnalytics)) {
          total += analytics.mistakes;
        }
      }
      return total;
    });

    const getMistakeCount = (targetId: string): number => {
      for (const profileAnalytics of Object.values(analyticsMap.value)) {
        if (profileAnalytics[targetId]) {
          return profileAnalytics[targetId].mistakes;
        }
      }
      return 0;
    };
    return {
      analyticsMap,
      totalMistakes,
      recordMistake,
      getProfileAnalytics,
      getAllAnalytics,
      resetAnalytics,
      getMistakeCount,
      fetchModuleSummary,
      reset,
    };
  },
  {
    unstorage: {},
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAnalyticsStore, import.meta.hot));
}
