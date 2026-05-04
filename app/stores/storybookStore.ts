import type { CloudProfile } from "@/types/sync";
import { registerProfileStore } from "~/utils/storeRegistry";

export const useStorybookStore = defineStore(
  "storybook",
  () => {
    // Other Stores
    const { activeProfileId } = storeToRefs(useProfileStore());

    // State
    const currentIndex = ref(0);
    const isSpeaking = ref(false);
    const showFinish = ref(false);
    const showQuiz = ref(false);
    const viewMode = ref<"list" | "story">("list");

    // Progress map by profile ID: Record<profileId, Array of completed indices>
    const profileProgressMap = ref<Record<string, number[]>>({});

    const reset = () => {
      currentIndex.value = 0;
      isSpeaking.value = false;
      showFinish.value = false;
      showQuiz.value = false;
      viewMode.value = "list";
      profileProgressMap.value = {};
    }

    // Register for automatic cleanup
    registerProfileStore({ reset });



    // Computed Set for compatibility with existing view logic
    const quizDone = computed(() => {
      const id = activeProfileId.value;
      if (!id) return new Set<number>();
      if (!profileProgressMap.value[id]) {
        profileProgressMap.value[id] = [];
      }
      return new Set(profileProgressMap.value[id]);
    });

    function markCompleted(index: number) {
      const id = activeProfileId.value;
      if (!id) return;

      if (!profileProgressMap.value[id]) {
        profileProgressMap.value[id] = [];
      }

      if (!profileProgressMap.value[id]!.includes(index)) {
        profileProgressMap.value[id]!.push(index);
      }
    }



    return {
      currentIndex,
      isSpeaking,
      quizDone,
      showFinish,
      showQuiz,
      viewMode,
      profileProgressMap,
      reset,
      markCompleted,
    };
  },
  {
    unstorage: {},
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStorybookStore, import.meta.hot));
}
