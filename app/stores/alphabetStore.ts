import type {
  AlphabetQuizProgress,
  CloudProfile,
  AlphabetQuizModeConfig,
} from "@/types/stores";
import {
  DEFAULT_ALPHABET_QUIZ_CONFIG,
  DEFAULT_ALPHABET_QUIZ_PROGRESS,
  letters,
} from "~/constants/alphabet";

export const useAlphabetStore = defineStore(
  "alphabet",
  () => {
    // Other Stores
    const { activeProfileId } = storeToRefs(useProfileStore());

    // State
    const alphabetQuizProgress = ref<AlphabetQuizProgress>(
      DEFAULT_ALPHABET_QUIZ_PROGRESS,
    );

    // Actions
    const reset = () => {
      alphabetQuizProgress.value = JSON.parse(
        JSON.stringify(DEFAULT_ALPHABET_QUIZ_PROGRESS),
      );
    };

    const fetch = async () => {
      if (!activeProfileId.value) {
        console.warn("AlphabetStore: Cannot fetch progress - no activeProfileId");
        return;
      }
      await $fetch(`/api/alphabet/quiz/${activeProfileId.value}/progress`, {
        onResponse: async ({ response }) => {
          if (!response.ok) {
            console.error("AlphabetStore: Fetch failed", response.status);
            return;
          }
          if (response.status === 200 && response._data) {
            alphabetQuizProgress.value = response._data;
          }
          if (response.status === 204) {
            await $fetch(`/api/alphabet/quiz/${activeProfileId.value}/progress`, {
              method: "POST",
              body: {
                ...DEFAULT_ALPHABET_QUIZ_PROGRESS,
                weights: letters.reduce(
                  (acc, letter) => {
                    acc[letter] = 0;
                    acc[letter.toLowerCase()] = 0;
                    return acc;
                  },
                  {} as Record<string, number>,
                ),
                config: DEFAULT_ALPHABET_QUIZ_CONFIG,
              },
              onResponse: async ({ response: res }) => {
                if (res.status === 200 && res._data) {
                  alphabetQuizProgress.value = res._data;
                }
              },
            });
          }
        },
      });
    };

    const saveConfig = async (profileId: string, config: AlphabetQuizModeConfig) => {
      try {
        const result = await $fetch(`/api/alphabet/quiz/${profileId}/config`, {
          method: "PATCH",
          body: { config: config },
        });
        if (result) {
          alphabetQuizProgress.value.config = config;
          return true;
        }
      } catch (error) {
        console.error("Failed to save alphabet config:", error);
        throw error;
      }
      return false;
    };

    return {
      alphabetQuizProgress,
      fetch,
      saveConfig,
      reset,
    };
  },
  {
    unstorage: {},
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAlphabetStore, import.meta.hot));
}
