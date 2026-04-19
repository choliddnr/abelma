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
    // const { syncAlphabet } = useSyncStore();

    // State
    const profileAlphabetMap = ref<Record<string, AlphabetQuizProgress>>({});

    const alphabetQuizProgress = ref<AlphabetQuizProgress>(
      DEFAULT_ALPHABET_QUIZ_PROGRESS,
    );
    // Initialize (Handled by persistence)
    const initialize = () => {};

    // const alphabetQuizProgress = computed<AlphabetQuizProgress>(
    //   () => {
    //     console.log(activeProfileId.value);

    //     return DEFAULT_ALPHABET_QUIZ_PROGRESS;
    //     // if (!profileAlphabetMap.value[activeProfileId.value]) {
    //     //   profileAlphabetMap.value[activeProfileId.value] =
    //     //     DEFAULT_ALPHABET_QUIZ_PROGRESS;
    //     // }
    //     // return (
    //     //   profileAlphabetMap.value[activeProfileId.value] ||
    //     //   DEFAULT_ALPHABET_QUIZ_PROGRESS
    //     // );
    //   },
    // );

    // Actions
    // const getAlphabetQuizProgress = (
    //   profileId: string,
    // ): AlphabetQuizProgress => {
    //   if (!profileAlphabetMap.value[profileId]) {
    //     profileAlphabetMap.value[profileId] = {
    //       score: 0,
    //       level: 1,
    //       weights: {},
    //       quizConfig: DEFAULT_ALPHABET_QUIZ_CONFIG,
    //       updatedAt: new Date(0).toISOString(),
    //     };
    //   }
    //   return profileAlphabetMap.value[profileId];
    // };

    // const getAlphabetQuizConfig = (
    //   profileId: string,
    // ): AlphabetQuizModeConfig => {
    //   if (!profileAlphabetMap.value[profileId]) {
    //     profileAlphabetMap.value[profileId] = {
    //       score: 0,
    //       level: 1,
    //       weights: {},
    //       quizConfig: [],
    //       updatedAt: new Date(0).toISOString(),
    //     };
    //   }
    //   return (
    //     profileAlphabetMap.value[profileId].quizConfig ||
    //     DEFAULT_ALPHABET_QUIZ_CONFIG
    //   );
    // };

    // const getCurrentAlphabetState = (): AlphabetQuizProgress => {
    //   return getAlphabetQuizProgress(activeProfileId.value || "");
    // };

    // const updateProgress = async (
    //   profileId: string,
    //   data: Partial<AlphabetQuizProgress>,
    // ) => {
    //   const state = getAlphabetQuizProgress(profileId);
    //   Object.assign(state, {
    //     ...data,
    //     updatedAt: new Date().toISOString(),
    //   });
    // };

    // const updateQuizConfig = async (
    //   profileId: string,
    //   config: AlphabetQuizModeConfig,
    // ) => {
    //   const state = getAlphabetQuizProgress(profileId);
    //   state.quizConfig = config;
    //   state.updatedAt = new Date().toISOString();
    //   await triggerSync();
    // };

    // const resetProgress = async (profileId: string) => {
    //   profileAlphabetMap.value[profileId] = {
    //     score: 0,
    //     level: 1,
    //     weights: {},
    //     quizConfig: [],
    //     updatedAt: new Date().toISOString(),
    //   };
    // };

    // const loadFromCloud = async (cloudData?: CloudProfile[]) => {
    //   try {
    //     if (!cloudData) {
    //       cloudData = await $fetch<CloudProfile[]>("/api/sync");
    //     }

    //     if (Array.isArray(cloudData)) {
    //       let needsPush = false;

    //       cloudData.forEach((p) => {
    //         const cloudAP = p.alphabetProgress;
    //         if (!cloudAP) return;

    //         const localAP = profileAlphabetMap.value[p.id];
    //         const cloudDate = new Date(cloudAP.updatedAt).getTime();
    //         const localDate = localAP
    //           ? new Date(localAP.updatedAt).getTime()
    //           : 0;

    //         if (cloudDate > localDate) {
    //           // Cloud is newer
    //           profileAlphabetMap.value[p.id] = {
    //             score: cloudAP.score,
    //             level: cloudAP.level,
    //             weights:
    //               typeof cloudAP.weights === "string"
    //                 ? JSON.parse(cloudAP.weights)
    //                 : cloudAP.weights || {},
    //             quizConfig: cloudAP.quizConfig
    //               ? typeof cloudAP.quizConfig === "string"
    //                 ? JSON.parse(cloudAP.quizConfig)
    //                 : cloudAP.quizConfig
    //               : [],
    //             updatedAt: cloudAP.updatedAt,
    //           };
    //         } else if (localDate > cloudDate) {
    //           // Local is newer
    //           needsPush = true;
    //         }
    //       });

    //       if (needsPush) {
    //         await triggerSync();
    //       }
    //     }
    //   } catch (error) {
    //     console.error("Cloud load error:", error);
    //   }
    // };

    // const triggerSync = async () => {
    //   await syncAlphabet();
    // };

    // Computed
    const totalScore = computed(() => {
      return Object.values(profileAlphabetMap.value).reduce(
        (sum, progress) => sum + (progress.score || 0),
        0,
      );
    });

    // const currentLevel = computed(() => {
    //   const activeId = activeProfileId.value;
    //   return activeId ? profileAlphabetMap.value[activeId]?.level || 1 : 1;
    // });

    const reset = () => {
      profileAlphabetMap.value = {};
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
            console.log("AlphabetStore: Progress fetched", response._data);
            alphabetQuizProgress.value = response._data;
          }
          if (response.status === 204) {
            console.log("AlphabetStore: No progress found, creating new...");
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
                quizConfig: DEFAULT_ALPHABET_QUIZ_CONFIG,
              },
              onResponse: async ({ response: res }) => {
                if (res.status === 200 && res._data) {
                  alphabetQuizProgress.value = res._data;
                }
                if (!res.ok) {
                  console.error("AlphabetStore: POST failed", res.status);
                  return;
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
          body: { quizConfig: config },
        });
        if (result) {
          alphabetQuizProgress.value.quizConfig = config;
          return true;
        }
      } catch (error) {
        console.error("Failed to save alphabet config:", error);
        throw error;
      }
      return false;
    };

    return {
      profileAlphabetMap,
      totalScore,
      alphabetQuizProgress,
      initialize,
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
