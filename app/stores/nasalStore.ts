import type { NasalProgress } from "@/types/stores";
import { nasalLevels } from "~/constants/nasalData";
import { registerProfileStore } from "~/utils/storeRegistry";

export const useNasalStore = defineStore(
  "nasal",
  () => {
    const { activeProfileId } = storeToRefs(useProfileStore());

    // State
    const nasalProgress = ref<NasalProgress>({
      score: 0,
      learningLevel: 1,
      levelScores: {},
      quizScore: 0,
      quizLevel: 1,
      quizWeights: {},
      learningWeights: {},
      config: {
        coinReward: 5,
        levelUpReward: 50,
        learningLevelUpReward: 50,
        streakThreshold: 5,
        streakReward: 10,
      },
      updatedAt: new Date(),
    });

    const loadedProfileId = ref<string | null>(null);

    const reset = () => {
      loadedProfileId.value = null;
      nasalProgress.value = {
        score: 0,
        learningLevel: 1,
        levelScores: {},
        quizScore: 0,
        quizLevel: 1,
        quizWeights: {},
        learningWeights: {},
        config: {
          coinReward: 5,
          levelUpReward: 50,
          learningLevelUpReward: 50,
          streakThreshold: 5,
          streakReward: 10,
        },
        updatedAt: new Date(),
      };
    };

    // Register for automatic cleanup
    registerProfileStore({ reset });



    // Actions
    const fetch = async (force = false) => {
      if (!activeProfileId.value) return;

      // Skip fetching if already loaded for this profile
      if (!force && loadedProfileId.value === activeProfileId.value) {
        console.log("NasalStore: Data already loaded for profile", activeProfileId.value);
        return;
      }

      try {
        const apiRes = await $fetch<any>(`/api/nasal/${activeProfileId.value}/progress`);
        if (apiRes) {
          const serverUpdatedAt = Math.floor(new Date(apiRes.updatedAt).getTime() / 1000);
          const localUpdatedAt = Math.floor(new Date(nasalProgress.value.updatedAt).getTime() / 1000);

          // RECONCILIATION LOGIC
          if (serverUpdatedAt > localUpdatedAt) {
            // Server is newer, overwrite local
            nasalProgress.value = {
              ...apiRes,
              updatedAt: new Date(apiRes.updatedAt),
            };
            console.log("NasalStore: Overwritten by server state (server is newer)");
          } else if (localUpdatedAt > serverUpdatedAt) {
            // Local is newer, sync to server
            console.log("NasalStore: Local state is newer, syncing to server...");
            await syncToServer();
          } else {
            // They are the same or local was just initialized from DB
            nasalProgress.value = {
              ...apiRes,
              updatedAt: new Date(apiRes.updatedAt),
            };
          }
          loadedProfileId.value = activeProfileId.value;
        } else {
          // If no progress found, create it via POST
          const postRes = await $fetch<any>(`/api/nasal/${activeProfileId.value}/progress`, {
            method: "POST",
          });
          if (postRes) {
            nasalProgress.value = {
              ...postRes,
              updatedAt: new Date(postRes.updatedAt),
            };
            loadedProfileId.value = activeProfileId.value;
          }
        }
      } catch (error: any) {
        if (error.status === 404 || error.status === 204) {
          console.log("NasalStore: No progress found for profile, using defaults.");
        } else {
          console.error("NasalStore: Fetch failed", error);
        }
      }
    };

    const updateScore = async (levelId: number, points: number) => {
      const currentScore = nasalProgress.value.levelScores[levelId] || 0;
      nasalProgress.value.levelScores[levelId] = currentScore + points;
      nasalProgress.value.score += points;
      nasalProgress.value.updatedAt = new Date();

      // Simple unlock logic: if level score > threshold, unlock next
      const levelIndex = nasalLevels.findIndex((l) => l.id === levelId);
      if (levelIndex !== -1 && levelIndex < nasalLevels.length - 1) {
        const nextLevel = nasalLevels[levelIndex + 1];
        if (nextLevel && nasalProgress.value.learningLevel < Number(nextLevel.id)) {
          // Threshold of 20 points to unlock next level
          if (nasalProgress.value.levelScores[levelId]! >= 20) {
            nasalProgress.value.learningLevel = Number(nextLevel.id);
          }
        }
      }
    };

    const updateQuizScore = async (points: number, itemId?: string, isCorrect: boolean = true) => {
      nasalProgress.value.quizScore = Math.max(0, nasalProgress.value.quizScore + points);
      nasalProgress.value.updatedAt = new Date();

      if (itemId) {
        if (!nasalProgress.value.quizWeights) nasalProgress.value.quizWeights = {};
        const currentWeight = nasalProgress.value.quizWeights[itemId] || 0;
        // Increase weight if wrong (to show more often), decrease if correct
        nasalProgress.value.quizWeights[itemId] = isCorrect
          ? Math.max(0, currentWeight - 1)
          : currentWeight + 1;
      }

      // Level up logic: every 100 points
      const newLevel = Math.floor(nasalProgress.value.quizScore / 100) + 1;
      const leveledUp = newLevel > nasalProgress.value.quizLevel;
      nasalProgress.value.quizLevel = newLevel;

      return { leveledUp };
    };

    const syncToServer = async () => {
      if (!activeProfileId.value) return;
      
      const profileStore = useProfileStore();
      const currentCoins = profileStore.profile?.coins;

      try {
        await $fetch(`/api/nasal/${activeProfileId.value}/progress`, {
          method: "PATCH",
          body: {
            ...nasalProgress.value,
            coins: currentCoins,
          },
        });
        console.log("NasalStore: Successfully synced to server");
      } catch (e) {
        console.warn("NasalStore: Sync failed", e);
      }
    };

    const updateLearningWeight = (itemId: string) => {
      if (!nasalProgress.value.learningWeights) nasalProgress.value.learningWeights = {};
      const currentWeight = nasalProgress.value.learningWeights[itemId] || 0;
      nasalProgress.value.learningWeights[itemId] = currentWeight + 1;
      nasalProgress.value.updatedAt = new Date();
    };


    return {
      nasalProgress,
      fetch,
      syncToServer,
      updateScore,
      updateQuizScore,
      updateLearningWeight,
      reset,
    };
  },
  {
    unstorage: {},
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useNasalStore, import.meta.hot));
}
