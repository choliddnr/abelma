import type { CloudProfile } from "@/types/stores";

export type LetterCase = "uppercase" | "lowercase" | "mixed";

export type WordSettings = {
  levels: any[];
  timerDuration: number; // Legacy/Default
  letterCase: LetterCase; // Legacy/Default
};
export const useSettingsStore = defineStore(
  "settings",
  () => {
    // State
    const settings = ref<WordSettings>({
      timerDuration: 30,
      letterCase: "uppercase",
      levels: [
        { timer: 0, coinReward: 5, letterCase: "uppercase", numOptions: 2 },
        { timer: 30, coinReward: 10, letterCase: "lowercase", numOptions: 3 },
        { timer: 20, coinReward: 20, letterCase: "mixed", numOptions: 4 },
        { timer: 10, coinReward: 30, letterCase: "mixed", numOptions: 6 },
      ],
    });

    const reset = () => {
      settings.value.timerDuration = 30;
      settings.value.letterCase = "uppercase";
    };

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
      reset,
    };
  },
  {
    unstorage: {},
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot));
}
