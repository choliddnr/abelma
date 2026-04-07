import type { CloudProfile } from "@/types/sync";
import { letters } from "~/constants/alphabet";

// Sync configuration
const SYNC_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
};

export const useSyncStore = defineStore("sync", () => {
  //   const isSyncing = ref(false);
  //   const lastSync = ref<Date | null>(null);
  //   const syncError = ref<string | null>(null);
  //   // Other Stores - State/Getters
  //   const { profiles } = storeToRefs(useProfileStore());
  //   const { profileCoinsMap, profileRewardsMap } = storeToRefs(useRewardStore());
  //   const { settings } = storeToRefs(useSettingsStore());
  //   const { analyticsMap } = storeToRefs(useAnalyticsStore());
  //   const { currentProfileStickers } = storeToRefs(useStickerStore());
  //   const { profileProgressMap } = storeToRefs(useStorybookStore());
  //   // Other Stores - Actions
  //   // const { loadFromCloud: loadProfilesFromCloud, reset: resetProfileStore } =
  //   //   useProfileStore();
  //   const { loadFromCloud: loadRewardsFromCloud, reset: resetRewardStore } =
  //     useRewardStore();
  //   const { loadFromCloud: loadStickersFromCloud, reset: resetStickerStore } =
  //     useStickerStore();
  //   const { loadFromCloud: loadAnalyticsFromCloud, reset: resetAnalyticsStore } =
  //     useAnalyticsStore();
  //   // const {
  //   //   loadFromCloud: loadAlphabetFromCloud,
  //   //   reset: resetAlphabetStore,
  //   //   getAlphabetChallangeProgress,
  //   // } = useAlphabetStore();
  //   const { loadFromCloud: loadSettingsFromCloud, reset: resetSettingsStore } =
  //     useSettingsStore();
  //   const { loadFromCloud: loadStorybookFromCloud, reset: resetStorybookStore } =
  //     useStorybookStore();
  //   const triggerSync = async (retryCount = 0): Promise<void> => {
  //     if (profiles.value.length === 0) return;
  //     isSyncing.value = true;
  //     syncError.value = null;
  //     try {
  //       // 1. Gather consolidated data for ALL profiles
  //       // Variables and logic to be used in modular sync where applicable
  //       // 2. Perform modular SYNC (Push)
  //       try {
  //         await syncProfile(0);
  //       } catch (e) {
  //         console.error("Profile sync inside triggerSync failed", e);
  //       }
  //       try {
  //         await syncAlphabet(0);
  //       } catch (e) {
  //         console.error("Alphabet sync inside triggerSync failed", e);
  //       }
  //       // 3. The cloud data updating is done inside each modular sync function.
  //       lastSync.value = new Date();
  //     } catch (error) {
  //       const errorMsg = String(error);
  //       syncError.value = errorMsg;
  //       const remainingRetries = SYNC_CONFIG.maxRetries - retryCount;
  //       if (remainingRetries > 0) {
  //         const delay = Math.min(
  //           SYNC_CONFIG.baseDelay * Math.pow(2, retryCount),
  //           SYNC_CONFIG.maxDelay,
  //         );
  //         await new Promise((resolve) => setTimeout(resolve, delay));
  //         return triggerSync(retryCount + 1);
  //       }
  //       throw error;
  //     } finally {
  //       isSyncing.value = false;
  //     }
  //   };
  //   const syncProfile = async (retryCount = 0): Promise<void> => {
  //     if (profiles.value.length === 0) return;
  //     isSyncing.value = true;
  //     syncError.value = null;
  //     try {
  //       const syncData: Partial<CloudProfile>[] = profiles.value.map((p) => {
  //         const id = p.id;
  //         return {
  //           id: id,
  //           name: p.name,
  //           avatar: p.avatar,
  //           coins: profileCoinsMap.value[id] || 0,
  //           letterCase: settings.value.letterCase,
  //           timerDuration: settings.value.timerDuration,
  //           rewards: (profileRewardsMap.value[id] || []).map((r) => ({
  //             id: r.id,
  //             title: r.title,
  //             cost: r.cost,
  //             emoji: r.emoji,
  //             status: r.status as "available" | "claimed" | "fulfilled",
  //             claimedAt: r.claimedAt,
  //           })),
  //           stickers: (currentProfileStickers.value[id] || []).map(
  //             (sid: string) => ({
  //               stickerId: sid,
  //             }),
  //           ),
  //           analytics: Object.entries(analyticsMap.value[id] || {}).map(
  //             ([tid, data]) => ({
  //               type: "word",
  //               targetId: tid,
  //               mistakes: data.mistakes,
  //               lastAttempt: data.lastAttempt,
  //             }),
  //           ),
  //         };
  //       });
  //       const cloudData = await $fetch<CloudProfile[]>("/api/sync/profile", {
  //         method: "POST",
  //         body: syncData,
  //       });
  //       await updateStores(cloudData);
  //       lastSync.value = new Date();
  //     } catch (error) {
  //       const errorMsg = String(error);
  //       syncError.value = errorMsg;
  //       const remainingRetries = SYNC_CONFIG.maxRetries - retryCount;
  //       if (remainingRetries > 0) {
  //         const delay = Math.min(
  //           SYNC_CONFIG.baseDelay * Math.pow(2, retryCount),
  //           SYNC_CONFIG.maxDelay,
  //         );
  //         await new Promise((resolve) => setTimeout(resolve, delay));
  //         return syncProfile(retryCount + 1);
  //       }
  //       throw error;
  //     } finally {
  //       isSyncing.value = false;
  //     }
  //   };
  //   const syncAlphabet = async (retryCount = 0): Promise<void> => {
  //     if (profiles.value.length === 0) return;
  //     isSyncing.value = true;
  //     syncError.value = null;
  //     try {
  //       const syncData: Partial<CloudProfile>[] = profiles.value.map((p) => {
  //         const id = p.id;
  //         // Transform storybook indices to letter objects
  //         const storybook = (profileProgressMap.value[id] || [])
  //           .map((idx) => ({
  //             letter: letters[idx] || "",
  //             isCompleted: true,
  //             lastRead: new Date().toISOString(),
  //           }))
  //           .filter((s) => s.letter !== "");
  //         return {
  //           id: id,
  //           alphabetProgress: (() => {
  //             const state = getAlphabetChallangeProgress(id);
  //             return {
  //               score: state.score,
  //               level: state.level,
  //               weights: JSON.stringify(state.weights),
  //               challengeConfig: JSON.stringify(state.challengeConfig ?? []),
  //               updatedAt: state.updatedAt,
  //             };
  //           })(),
  //           storybookProgress: storybook,
  //         };
  //       });
  //       const cloudData = await $fetch<CloudProfile[]>("/api/sync/alphabet", {
  //         method: "POST",
  //         body: syncData,
  //       });
  //       await updateStores(cloudData);
  //       lastSync.value = new Date();
  //     } catch (error) {
  //       const errorMsg = String(error);
  //       syncError.value = errorMsg;
  //       const remainingRetries = SYNC_CONFIG.maxRetries - retryCount;
  //       if (remainingRetries > 0) {
  //         const delay = Math.min(
  //           SYNC_CONFIG.baseDelay * Math.pow(2, retryCount),
  //           SYNC_CONFIG.maxDelay,
  //         );
  //         await new Promise((resolve) => setTimeout(resolve, delay));
  //         return syncAlphabet(retryCount + 1);
  //       }
  //       throw error;
  //     } finally {
  //       isSyncing.value = false;
  //     }
  //   };
  //   const updateStores = async (cloudData: CloudProfile[]) => {
  //     // await loadProfilesFromCloud(cloudData);
  //     await loadRewardsFromCloud(cloudData);
  //     await loadStickersFromCloud(cloudData);
  //     await loadAnalyticsFromCloud(cloudData);
  //     // await loadAlphabetFromCloud(cloudData);
  //     await loadSettingsFromCloud(cloudData);
  //     await loadStorybookFromCloud(cloudData);
  //   };
  //   // const loadFromCloud = async (): Promise<void> => {
  //   //   try {
  //   //     const cloudData  = await $fetch<CloudProfile[]>("/api/sync");
  //   //     await updateStores(cloudData);
  //   //   } catch (error) {
  //   //     throw new Error("Failed to load from cloud");
  //   //   }
  //   // };
  //   const clearAllData = async () => {
  //     resetProfileStore();
  //     resetRewardStore();
  //     resetStickerStore();
  //     resetAnalyticsStore();
  //     resetAlphabetStore();
  //     resetSettingsStore();
  //     resetStorybookStore();
  //     lastSync.value = null;
  //     syncError.value = null;
  //   };
  //   return {
  //     isSyncing,
  //     lastSync,
  //     syncError,
  //     triggerSync,
  //     syncAlphabet,
  //     syncProfile,
  //     // loadFromCloud,
  //     clearAllData,
  //   };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSyncStore, import.meta.hot));
}
