import type { WordQuizProgress, WordLevelConfig } from "@/types/stores";

export const useWordStore = defineStore(
  "word",
  () => {
    const { activeProfileId } = storeToRefs(useProfileStore());

    const wordQuizProgress = ref<WordQuizProgress>({
      score: 0,
      level: 1,
      weights: {},
      quizConfig: [
        { timer: 0, coinReward: 5, letterCase: "uppercase", numOptions: 2 },
        { timer: 30, coinReward: 10, letterCase: "lowercase", numOptions: 3 },
        { timer: 20, coinReward: 20, letterCase: "mixed", numOptions: 4 },
        { timer: 10, coinReward: 30, letterCase: "mixed", numOptions: 6 },
      ],
      updatedAt: new Date(),
    });

    const fetch = async () => {
      if (!activeProfileId.value) return;

      try {
        const res = await $fetch<any>(`/api/words/quiz/${activeProfileId.value}/progress`);
        if (res) {
          wordQuizProgress.value = res;
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

    const saveConfig = async (profileId: string, config: WordLevelConfig[]) => {
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
        const res = await $fetch<WordQuizProgress>(
          `/api/words/quiz/${profileId}/progress`,
          {
            method: "PATCH",
            body: data,
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

    return {
      wordQuizProgress,
      fetch,
      saveConfig,
      updateProgress,
    };
  },
  {
    unstorage: {},
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useWordStore, import.meta.hot));
}
