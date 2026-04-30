import type { CloudProfile, Profile } from "@/types/stores";
import { DEFAULT_ALPHABET_QUIZ_CONFIG } from "~/constants/alphabet";

export const useProfileStore = defineStore(
  "profile",
  () => {
    // Other Stores
    // const { syncProfile } = useSyncStore();
    // const { updateQuizConfig } = useAlphabetStore();

    const { user } = storeToRefs(useUserStore());
    // const { fetch: fetchRewards } = useRewardStore();

    // State
    const profiles = ref<Profile[]>([]);
    const activeProfileId = ref<string>();
    const activeProfileIndex = ref<number>(-1);

    // computed<number>(() => {
    //   if (profiles.value.length === 0) return -1;
    //   return 1;
    //   // return profiles.value.findIndex((p) => p.id === activeProfileId.value);
    // });

    const profile = computed<Profile>(() => {
      if (profiles.value.length === 0)
        return {
          id: "",
          name: "",
          avatar: "",
          coins: 0,
          updatedAt: new Date(),
        } as Profile;

      activeProfileIndex.value = profiles.value.findIndex((p) => p.id === activeProfileId.value);

      // If no valid active ID, fallback to first profile or default object
      if (activeProfileIndex.value === -1) {
        return (
          profiles.value[0] ||
          ({
            id: "",
            name: "",
            avatar: "",
            coins: 0,
            updatedAt: new Date(),
          } as Profile)
        );
      }

      return profiles.value[activeProfileIndex.value] as Profile;
    });

    const isLoaded = ref(false);

    const addProfile = (profile: Profile) => {
      profiles.value.push(profile);
      activeProfileId.value = profile.id;
    };

    const changeProfile = async (id: string) => {
      // Why: Sync current profile progress to DB before switching contexts
      if (activeProfileId.value && profile.value) {
        try {
          await $fetch(`/api/profile/${activeProfileId.value}`, {
            method: "PUT",
            body: {
              coins: profile.value.coins,
              name: profile.value.name,
              avatar: profile.value.avatar,
            },
            onResponse: async ({ response }) => {
              if (response.ok) {
                await fetchProfiles();
                // await fetchRewards();
              }
            },
          });
        } catch (error) {
          console.error("Failed to sync profile before switching:", error);
        }
      }
      activeProfileId.value = id;
    };

    const updateProfile = (profile: Profile) => {
      const index = profiles.value.findIndex((p) => p.id === profile.id);
      if (index !== -1) {
        profiles.value[index] = { ...profile, updatedAt: new Date() };
      }
    };

    const changeCoins = (coins: number) => {
      if (profiles.value.length === 0 || activeProfileIndex.value === -1) return;
      const p = { ...profile.value };
      p.coins += coins;
      p.updatedAt = new Date();
      profiles.value[activeProfileIndex.value] = p;
    };

    const reset = () => {
      profiles.value = [];
      activeProfileId.value = undefined;
      isLoaded.value = false;
    };

    async function fetchProfiles() {
      try {
        const apiProfiles = await $fetch<Profile[]>("/api/profile/user/" + user.value?.id);

        // Conflict resolution
        const mergedProfiles = [...profiles.value];

        apiProfiles.forEach((apiP) => {
          const localIdx = mergedProfiles.findIndex(p => p.id === apiP.id);
          if (localIdx === -1) {
            // New profile from server
            mergedProfiles.push({ ...apiP, updatedAt: new Date(apiP.updatedAt) });
          } else {
            const localP = mergedProfiles[localIdx]!;
            const localTime = new Date(localP.updatedAt || 0).getTime();
            const apiTime = new Date(apiP.updatedAt || 0).getTime();

            if (localTime > apiTime) {
              // Local is newer, sync to DB in background
              console.log(`Profile ${apiP.name} local is newer, syncing to DB...`);
              $fetch(`/api/profile/${localP.id}`, {
                method: "PUT",
                body: {
                  coins: localP.coins,
                  name: localP.name,
                  avatar: localP.avatar,
                  updatedAt: localP.updatedAt
                }
              });
            } else {
              // API is newer or same, overwrite local
              mergedProfiles[localIdx] = { ...apiP, updatedAt: new Date(apiP.updatedAt) };
            }
          }
        });

        profiles.value = mergedProfiles;
        isLoaded.value = true;

        // Automatic Selection logic (Removed to force selection screen)
        if (profiles.value.length === 0) {
          navigateTo("/welcome");
        }
      } catch (error) {
        console.error("fetch profile failed:", error);
      }
    }
    return {
      profiles,
      profile,
      activeProfileId,
      activeProfileIndex,
      isLoaded,
      changeCoins,
      changeProfile,
      addProfile,
      updateProfile,
      reset,
      fetchProfiles,
    };
  },
  {
    unstorage: {},
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProfileStore, import.meta.hot));
}
