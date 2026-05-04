import type { CvcProgress } from "@/types/stores";
import { cvcLevels } from "~/constants/cvcBlends";
import { registerProfileStore } from "~/utils/storeRegistry";

export const useCvcStore = defineStore(
  "cvc",
  () => {
    const { activeProfileId } = storeToRefs(useProfileStore());



    // State
    const cvcProgress = ref<CvcProgress>({
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

    const reset = () => {
      cvcProgress.value = {
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
    const fetch = async () => {
      if (!activeProfileId.value) return;

      try {
        const apiRes = await $fetch<any>(`/api/cvc/${activeProfileId.value}/progress`);
        if (apiRes) {
          const serverUpdatedAt = Math.floor(new Date(apiRes.updatedAt).getTime() / 1000);
          const localUpdatedAt = Math.floor(new Date(cvcProgress.value.updatedAt).getTime() / 1000);

          // RECONCILIATION LOGIC
          if (serverUpdatedAt > localUpdatedAt) {
            // Server is newer, overwrite local
            cvcProgress.value = {
              ...apiRes,
              updatedAt: new Date(apiRes.updatedAt),
            };
            console.log("CvcStore: Overwritten by server state (server is newer)");
          } else if (localUpdatedAt > serverUpdatedAt) {
            // Local is newer, sync to server
            console.log("CvcStore: Local state is newer, syncing to server...");
            await syncToServer();
          } else {
            // They are the same or local was just initialized from DB
            cvcProgress.value = {
              ...apiRes,
              updatedAt: new Date(apiRes.updatedAt),
            };
          }
        } else {
          // If no progress found, create it via POST
          const postRes = await $fetch<any>(`/api/cvc/${activeProfileId.value}/progress`, {
            method: "POST",
          });
          if (postRes) {
            cvcProgress.value = {
              ...postRes,
              updatedAt: new Date(postRes.updatedAt),
            };
          }
        }
      } catch (error: any) {
        if (error.status === 404 || error.status === 204) {
          console.log("CvcStore: No progress found for profile, using defaults.");
        } else {
          console.error("CvcStore: Fetch failed", error);
        }
      }
    };

    const updateScore = async (levelId: number, points: number) => {
      const currentScore = cvcProgress.value.levelScores[levelId] || 0;
      cvcProgress.value.levelScores[levelId] = currentScore + points;
      cvcProgress.value.score += points;
      cvcProgress.value.updatedAt = new Date();

      // Simple unlock logic: if level score > threshold, unlock next
      const levelIndex = cvcLevels.findIndex((l) => l.id === levelId);
      if (levelIndex !== -1 && levelIndex < cvcLevels.length - 1) {
        const nextLevel = cvcLevels[levelIndex + 1];
        if (nextLevel && cvcProgress.value.learningLevel < Number(nextLevel.id)) {
          // Threshold of 20 points to unlock next level
          if (cvcProgress.value.levelScores[levelId]! >= 20) {
            cvcProgress.value.learningLevel = Number(nextLevel.id);
          }
        }
      }
    };

    const updateQuizScore = async (points: number, blendId?: string, isCorrect: boolean = true) => {
      cvcProgress.value.quizScore = Math.max(0, cvcProgress.value.quizScore + points);
      cvcProgress.value.updatedAt = new Date();

      if (blendId) {
        if (!cvcProgress.value.quizWeights) cvcProgress.value.quizWeights = {};
        const currentWeight = cvcProgress.value.quizWeights[blendId] || 0;
        // Increase weight if wrong (to show more often), decrease if correct
        cvcProgress.value.quizWeights[blendId] = isCorrect
          ? Math.max(0, currentWeight - 1)
          : currentWeight + 1;
      }

      // Level up logic: every 100 points
      const newLevel = Math.floor(cvcProgress.value.quizScore / 100) + 1;
      const leveledUp = newLevel > cvcProgress.value.quizLevel;
      cvcProgress.value.quizLevel = newLevel;

      return { leveledUp };
    };

    const saveConfig = async (profileId: string, config: any) => {
      try {
        await $fetch(`/api/cvc/${profileId}/progress`, {
          method: "PATCH",
          body: { config: config },
        });
        cvcProgress.value.config = { ...config };
        cvcProgress.value.updatedAt = new Date(); // Update timestamp on config change too
        return true;
      } catch (e) {
        console.error("CvcStore: Failed to save config", e);
        return false;
      }
    };

    const syncToServer = async () => {
      if (!activeProfileId.value) return;
      
      const profileStore = useProfileStore();
      const currentCoins = profileStore.profile?.coins;

      try {
        await $fetch(`/api/cvc/${activeProfileId.value}/progress`, {
          method: "PATCH",
          body: {
            ...cvcProgress.value,
            coins: currentCoins,
          },
        });
        console.log("CvcStore: Successfully synced to server");
      } catch (e) {
        console.warn("CvcStore: Sync failed", e);
      }
    };

    const updateLearningWeight = (itemId: string) => {
      if (!cvcProgress.value.learningWeights) cvcProgress.value.learningWeights = {};
      const currentWeight = cvcProgress.value.learningWeights[itemId] || 0;
      // Increase weight because item is completed. Lower weight items will be prioritized.
      cvcProgress.value.learningWeights[itemId] = currentWeight + 1;
      cvcProgress.value.updatedAt = new Date();
    };

    return {
      cvcProgress,
      fetch,
      syncToServer,
      updateScore,
      updateQuizScore,
      updateLearningWeight,
      saveConfig,
      reset,
    };
  },
  {
    unstorage: {},
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCvcStore, import.meta.hot));
}
