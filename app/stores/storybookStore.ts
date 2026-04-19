import type { CloudProfile } from "@/types/sync";

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

    function reset() {
      currentIndex.value = 0;
      isSpeaking.value = false;
      showFinish.value = false;
      showQuiz.value = false;
      viewMode.value = "list";
      profileProgressMap.value = {};
    }

    const loadFromCloud = async (cloudData?: CloudProfile[]) => {
      try {
        if (!cloudData) {
          cloudData = await $fetch<CloudProfile[]>("/api/sync");
        }

        // cloudData is an array of profiles with storybookProgress
        if (Array.isArray(cloudData)) {
          cloudData.forEach((p: CloudProfile) => {
            // storybookProgress is the key returned by the joined query in sync.ts
            const rawStorybook = p.storybookProgress;
            if (rawStorybook && Array.isArray(rawStorybook)) {
              // alphabetData letters are A-Z, map them to indices 0-25
              const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
              const indices = rawStorybook
                .filter((s) => s.isCompleted)
                .map((s) => alphabet.indexOf(s.letter))
                .filter((idx: number) => idx !== -1);

              profileProgressMap.value[p.id] = Array.from(new Set(indices));
            }
          });
        }
      } catch (error) {
        console.error("Storybook load error:", error);
      }
    };

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
      loadFromCloud,
    };
  },
  {
    unstorage: {},
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStorybookStore, import.meta.hot));
}
