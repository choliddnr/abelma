import type { DdvProgress } from "@/types/stores";
import { ddvLevels } from "~/constants/ddvData";

export const useDdvStore = defineStore(
  "ddv",
  () => {
    const { activeProfileId } = storeToRefs(useProfileStore());

    // State
    const ddvProgress = ref<DdvProgress>({
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

    // Actions
    const fetch = async (force = false) => {
      if (!activeProfileId.value) return;

      // Skip fetching if already loaded for this profile
      if (!force && loadedProfileId.value === activeProfileId.value) {
        console.log("DdvStore: Data already loaded for profile", activeProfileId.value);
        return;
      }

      try {
        const apiRes = await $fetch<any>(`/api/ddv/${activeProfileId.value}/progress`);
        if (apiRes) {
          const serverUpdatedAt = Math.floor(new Date(apiRes.updatedAt).getTime() / 1000);
          const localUpdatedAt = Math.floor(new Date(ddvProgress.value.updatedAt).getTime() / 1000);

          // RECONCILIATION LOGIC
          if (serverUpdatedAt > localUpdatedAt) {
            // Server is newer, overwrite local
            ddvProgress.value = {
              ...apiRes,
              updatedAt: new Date(apiRes.updatedAt),
            };
            console.log("DdvStore: Overwritten by server state (server is newer)");
          } else if (localUpdatedAt > serverUpdatedAt) {
            // Local is newer, sync to server
            console.log("DdvStore: Local state is newer, syncing to server...");
            await syncToServer();
          } else {
            // They are the same or local was just initialized from DB
            ddvProgress.value = {
              ...apiRes,
              updatedAt: new Date(apiRes.updatedAt),
            };
          }
          loadedProfileId.value = activeProfileId.value;
        } else {
          // If no progress found, create it via POST
          const postRes = await $fetch<any>(`/api/ddv/${activeProfileId.value}/progress`, {
            method: "POST",
          });
          if (postRes) {
            ddvProgress.value = {
              ...postRes,
              updatedAt: new Date(postRes.updatedAt),
            };
            loadedProfileId.value = activeProfileId.value;
          }
        }
      } catch (error: any) {
        if (error.status === 404 || error.status === 204) {
          console.log("DdvStore: No progress found for profile, using defaults.");
        } else {
          console.error("DdvStore: Fetch failed", error);
        }
      }
    };

    const updateScore = async (levelId: number, points: number) => {
      const currentScore = ddvProgress.value.levelScores[levelId] || 0;
      ddvProgress.value.levelScores[levelId] = currentScore + points;
      ddvProgress.value.score += points;
      ddvProgress.value.updatedAt = new Date();

      // Simple unlock logic: if level score > threshold, unlock next
      const levelIndex = ddvLevels.findIndex((l) => l.id === levelId);
      if (levelIndex !== -1 && levelIndex < ddvLevels.length - 1) {
        const nextLevel = ddvLevels[levelIndex + 1];
        if (nextLevel && ddvProgress.value.learningLevel < Number(nextLevel.id)) {
          // Threshold of 20 points to unlock next level
          if (ddvProgress.value.levelScores[levelId]! >= 20) {
            ddvProgress.value.learningLevel = Number(nextLevel.id);
          }
        }
      }
    };

    const updateQuizScore = async (points: number, itemId?: string, isCorrect: boolean = true) => {
      ddvProgress.value.quizScore = Math.max(0, ddvProgress.value.quizScore + points);
      ddvProgress.value.updatedAt = new Date();

      if (itemId) {
        if (!ddvProgress.value.quizWeights) ddvProgress.value.quizWeights = {};
        const currentWeight = ddvProgress.value.quizWeights[itemId] || 0;
        // Increase weight if wrong (to show more often), decrease if correct
        ddvProgress.value.quizWeights[itemId] = isCorrect
          ? Math.max(0, currentWeight - 1)
          : currentWeight + 1;
      }

      // Level up logic: every 100 points
      const newLevel = Math.floor(ddvProgress.value.quizScore / 100) + 1;
      const leveledUp = newLevel > ddvProgress.value.quizLevel;
      ddvProgress.value.quizLevel = newLevel;

      return { leveledUp };
    };

    const saveConfig = async (profileId: string, config: any) => {
      try {
        await $fetch(`/api/ddv/${profileId}/progress`, {
          method: "PATCH",
          body: { config: config },
        });
        ddvProgress.value.config = { ...config };
        ddvProgress.value.updatedAt = new Date();
        return true;
      } catch (e) {
        console.error("DdvStore: Failed to save config", e);
        return false;
      }
    };

    const syncToServer = async () => {
      if (!activeProfileId.value) return;
      
      const profileStore = useProfileStore();
      const currentCoins = profileStore.profile?.coins;

      try {
        await $fetch(`/api/ddv/${activeProfileId.value}/progress`, {
          method: "PATCH",
          body: {
            ...ddvProgress.value,
            coins: currentCoins,
          },
        });
        console.log("DdvStore: Successfully synced to server");
      } catch (e) {
        console.warn("DdvStore: Sync failed", e);
      }
    };

    const updateLearningWeight = (itemId: string) => {
      if (!ddvProgress.value.learningWeights) ddvProgress.value.learningWeights = {};
      const currentWeight = ddvProgress.value.learningWeights[itemId] || 0;
      ddvProgress.value.learningWeights[itemId] = currentWeight + 1;
      ddvProgress.value.updatedAt = new Date();
    };

    const reset = () => {
      loadedProfileId.value = null;
      ddvProgress.value = {
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

    return {
      ddvProgress,
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
  import.meta.hot.accept(acceptHMRUpdate(useDdvStore, import.meta.hot));
}
