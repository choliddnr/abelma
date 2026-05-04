import type { TraceProgress } from "@/types/stores";
import { registerProfileStore } from "~/utils/storeRegistry";

export const useTraceStore = defineStore(
  "trace",
  () => {
    const { activeProfileId } = storeToRefs(useProfileStore());

    // State
    const traceProgress = ref<TraceProgress>({
      stars: {},
      config: [500, 600, 700, 800, 1000],
      updatedAt: new Date(),
    });

    const reset = () => {
      traceProgress.value = {
        stars: {},
        config: [500, 600, 700, 800, 1000],
        updatedAt: new Date(),
      };
    };

    // Register for automatic cleanup
    registerProfileStore({ reset });

    // Actions
    const fetch = async () => {
      if (!activeProfileId.value) return;

      try {
        const apiRes = await $fetch<any>(`/api/tracing/${activeProfileId.value}/progress`);
        if (apiRes) {
          const serverUpdatedAt = Math.floor(new Date(apiRes.updatedAt).getTime() / 1000);
          const localUpdatedAt = Math.floor(new Date(traceProgress.value.updatedAt).getTime() / 1000);

          // RECONCILIATION LOGIC
          if (serverUpdatedAt > localUpdatedAt) {
            traceProgress.value = {
              ...apiRes,
              updatedAt: new Date(apiRes.updatedAt),
            };
            console.log("TraceStore: Overwritten by server state");
          } else if (localUpdatedAt > serverUpdatedAt) {
            console.log("TraceStore: Local state is newer, syncing to server...");
            await syncToServer();
          } else {
            traceProgress.value = {
              ...apiRes,
              updatedAt: new Date(apiRes.updatedAt),
            };
          }
        } else {
          // If no progress found, create it via POST
          const postRes = await $fetch<any>(`/api/tracing/${activeProfileId.value}/progress`, {
            method: "POST",
          });
          if (postRes) {
            traceProgress.value = {
              ...postRes,
              updatedAt: new Date(postRes.updatedAt),
            };
          }
        }
      } catch (error: any) {
        if (error.status === 404 || error.status === 204) {
          console.log("TraceStore: No progress found for profile, using defaults.");
        } else {
          console.error("TraceStore: Fetch failed", error);
        }
      }
    };

    const saveStar = async (letter: string, score: number) => {
      // score is 0 to 5
      const currentStar = traceProgress.value.stars[letter] || 0;
      if (score > currentStar) {
        traceProgress.value.stars[letter] = score;
        traceProgress.value.updatedAt = new Date();
        await syncToServer();
      }
    };

    const syncToServer = async () => {
      if (!activeProfileId.value) return;
      
      const profileStore = useProfileStore();
      const currentCoins = profileStore.profile?.coins;

      try {
        await $fetch(`/api/tracing/${activeProfileId.value}/progress`, {
          method: "PATCH",
          body: {
            ...traceProgress.value,
            coins: currentCoins,
          },
        });
        console.log("TraceStore: Successfully synced to server");
      } catch (e) {
        console.warn("TraceStore: Sync failed", e);
      }
    };

    return {
      traceProgress,
      fetch,
      saveStar,
      syncToServer,
      reset,
    };
  },
  {
    unstorage: {},
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTraceStore, import.meta.hot));
}
