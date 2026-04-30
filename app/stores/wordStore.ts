import type { WordQuizProgress, WordQuizConfig } from "@/types/stores";

export const useWordStore = defineStore(
  "word",
  () => {
    const { activeProfileId, profile } = storeToRefs(useProfileStore());

    const wordQuizProgress = ref<WordQuizProgress>({
      score: 0,
      level: 1,
      weights: {},
      quizConfig: { coinReward: 5, levelUpReward: 50, streakThreshold: 5, streakReward: 10 },
      updatedAt: new Date(),
    });

    const fetch = async () => {
      if (!activeProfileId.value) return;

      try {
        const apiRes = await $fetch<any>(`/api/words/quiz/${activeProfileId.value}/progress`);
        if (!apiRes) return;

        const apiData = {
          ...apiRes,
          weights: typeof apiRes.weights === "string" ? JSON.parse(apiRes.weights) : apiRes.weights,
          quizConfig:
            typeof apiRes.quizConfig === "string" ? JSON.parse(apiRes.quizConfig) : apiRes.quizConfig,
          updatedAt: new Date(apiRes.updatedAt),
        };

        const localTime = new Date(wordQuizProgress.value.updatedAt || 0).getTime();
        const apiTime = apiData.updatedAt.getTime();

        if (localTime > apiTime) {
          // Local is newer, sync to DB
          console.log("Word progress local is newer, syncing to DB...");
          updateProgress(activeProfileId.value, {
            score: wordQuizProgress.value.score,
            level: wordQuizProgress.value.level,
            weights: wordQuizProgress.value.weights,
            updatedAt: wordQuizProgress.value.updatedAt,
          });
        } else {
          // API is newer or same
          wordQuizProgress.value = apiData;
        }
      } catch (error: any) {
        if (error.status === 204 || error.status === 404) {
          // No progress yet, will be created on first save or explicit init
          console.log("WordStore: No progress found for profile");
        } else {
          console.error("WordStore: Fetch failed", error);
        }
      }
    };

    const saveConfig = async (profileId: string, config: WordQuizConfig) => {
      try {
        // Try to update config first
        try {
          const result = await $fetch<WordQuizProgress>(
            `/api/words/quiz/${profileId}/config`,
            {
              method: "PATCH",
              body: { quizConfig: config },
            },
          );
          if (result) {
            wordQuizProgress.value = result;
            return true;
          }
        } catch (error: any) {
          // If not found, create the record
          if (error.status === 404) {
            const createRes = await $fetch<WordQuizProgress>(
              `/api/words/quiz/${profileId}/progress`,
              {
                method: "POST",
                body: {
                  ...wordQuizProgress.value,
                  quizConfig: config,
                },
              },
            );
            if (createRes) {
              wordQuizProgress.value = createRes;
              return true;
            }
          }
          throw error;
        }
      } catch (error) {
        console.error("Failed to save word config:", error);
        throw error;
      }
      return false;
    };

    const updateProgress = async (profileId: string, data: Partial<WordQuizProgress>) => {
      try {
        const payload = { 
          ...data, 
          coins: profile.value.coins,
          updatedAt: data.updatedAt || new Date()
        };
        const res = await $fetch<WordQuizProgress>(
          `/api/words/quiz/${profileId}/progress`,
          {
            method: "PATCH",
            body: payload,
          },
        );
        if (res) {
          wordQuizProgress.value = res;
          return true;
        }
      } catch (error) {
        console.error("Failed to update word progress:", error);
      }
      return false;
    };

    const updateLocalProgress = (data: Partial<WordQuizProgress>) => {
      wordQuizProgress.value = {
        ...wordQuizProgress.value,
        ...data,
        updatedAt: new Date(),
      };
    };

    return {
      wordQuizProgress,
      fetch,
      saveConfig,
      updateProgress,
      updateLocalProgress,
    };
  },
  {
    unstorage: {},
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useWordStore, import.meta.hot));
}
