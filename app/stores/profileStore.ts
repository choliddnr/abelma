import type { Profile, CloudProfile } from "@/types/stores";
import { DEFAULT_ALPHABET_CHALLENGE_CONFIG } from "~/constants/alphabet";

export const useProfileStore = defineStore(
  "profile",
  () => {
    // Other Stores
    // const { syncProfile } = useSyncStore();
    // const { updateChallengeConfig } = useAlphabetStore();

    // State
    const profiles = ref<Profile[]>([]);
    const activeProfileId = ref<string>();
    const selectedProfile = computed(() => {
      return activeProfileId.value
        ? profiles.value.find((p) => p.id === activeProfileId.value) ||
            profiles.value[0]
        : null;
    });

    const isLoaded = ref(false);

    return {
      profiles,
      activeProfileId,
      selectedProfile,
      isLoaded,
    };
  },
  {
    unstorage: {},
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProfileStore, import.meta.hot));
}
