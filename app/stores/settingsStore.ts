import type { WordSettings, CloudProfile, LetterCase } from "@/types/stores";

export const useSettingsStore = defineStore(
  "settings",
  () => {
    // State
    const settings = ref<WordSettings>({
      timerDuration: 30,
      letterCase: "uppercase",
    });

    // Initialize (Handled by persistence)
    const initialize = () => {};

    // Actions
    // const setTimerDuration = (duration: number) => {
    //   settings.value.timerDuration = duration;
    // };

    // const setLetterCase = (caseType: "uppercase" | "lowercase") => {
    //   settings.value.letterCase = caseType;
    // };

    // const reset = () => {
    //   settings.value.timerDuration = 30;
    //   settings.value.letterCase = "uppercase";
    // };

    // const loadFromCloud = async (cloudData?: CloudProfile[]) => {
    //   try {
    //     if (!cloudData) {
    //       cloudData = await $fetch<CloudProfile[]>("/api/sync");
    //     }

    //     if (Array.isArray(cloudData) && cloudData.length > 0) {
    //       // Take settings from the first profile
    //       const first = cloudData[0]!;
    //       if (first.timerDuration !== undefined) {
    //         settings.value.timerDuration = first.timerDuration || 30;
    //       }
    //       if (first.letterCase) {
    //         settings.value.letterCase = first.letterCase as LetterCase;
    //       }
    //     }
    //   } catch (error) {
    //     console.error("Cloud load error:", error);
    //   }
    // };

    // Computed
    const isTimerOn = computed(() => {
      return settings.value.timerDuration > 0;
    });

    const getTimerLabel = computed(() => {
      return `${settings.value.timerDuration}s`;
    });

    return {
      settings,
      isTimerOn,
      getTimerLabel,
      initialize,
      // setTimerDuration,
      // setLetterCase,
      // loadFromCloud,
      // reset,
    };
  },
  {
    unstorage: {},
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot));
}
