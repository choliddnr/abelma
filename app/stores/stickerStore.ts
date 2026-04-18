import type { Sticker, CloudProfile } from "@/types/stores";

export const useStickerStore = defineStore(
  "sticker",
  () => {
    // Other Stores
    const profileStore = useProfileStore();
    const { activeProfileId: profileId } = storeToRefs(profileStore);

    // State
    const earnedStickers = ref<Set<string>>(new Set());
    const currentProfileStickers = ref<Record<string, string[]>>({});

    const allAvailableStickers: Sticker[] = [
      {
        id: "star_explorer",
        emoji: "⭐",
        name: "Penjelajah Bintang",
        requiredScore: 50,
      },
      { id: "cool_cat", emoji: "🐱", name: "Kucing Keren", requiredScore: 100 },
      {
        id: "word_wizard",
        emoji: "🧙",
        name: "Penyihir Kata",
        requiredScore: 150,
      },
      { id: "fire_dragon", emoji: "🐲", name: "Naga Api", requiredScore: 200 },
      {
        id: "super_owl",
        emoji: "🦉",
        name: "Burung Hantu Pintar",
        requiredScore: 250,
      },
      {
        id: "rainbow_unicorn",
        emoji: "🦄",
        name: "Unicorn Pelangi",
        requiredScore: 300,
      },
    ];

    // Actions
    const addSticker = async (stickerId: string) => {
      if (!profileId.value) return;

      currentProfileStickers.value[profileId.value] =
        currentProfileStickers.value[profileId.value] || [];

      if (!currentProfileStickers.value[profileId.value]!.includes(stickerId)) {
        currentProfileStickers.value[profileId.value]!.push(stickerId);
        earnedStickers.value.add(stickerId);
      }
    };

    const checkAndEarnStickers = (currentScore: number): Sticker | null => {
      let earnedSticker: Sticker | null = null;

      for (const sticker of allAvailableStickers) {
        if (
          currentScore >= sticker.requiredScore &&
          !earnedStickers.value.has(sticker.id)
        ) {
          earnedStickers.value.add(sticker.id);
          if (!earnedSticker) {
            earnedSticker = sticker;
          }
        }
      }

      if (earnedSticker) {
        if (profileId.value) {
          if (!currentProfileStickers.value[profileId.value]) {
            currentProfileStickers.value[profileId.value] = [];
          }
          const profileStickers = currentProfileStickers.value[
            profileId.value
          ] as string[];
          if (!profileStickers.includes(earnedSticker.id)) {
            profileStickers.push(earnedSticker.id);
          }
        }
      }

      return earnedSticker;
    };

    const getProfileStickers = (profileId: string): string[] => {
      return currentProfileStickers.value[profileId] || [];
    };

    const hasSticker = (stickerId: string): boolean => {
      return earnedStickers.value.has(stickerId);
    };

    // Computed
    const earnedStickerList = computed(() => {
      return allAvailableStickers.filter((sticker) =>
        earnedStickers.value.has(sticker.id),
      );
    });

    const unearnedStickers = computed(() => {
      return allAvailableStickers.filter(
        (sticker) => !earnedStickers.value.has(sticker.id),
      );
    });

    const totalEarned = computed(() => {
      return earnedStickers.value.size;
    });

    const reset = () => {
      earnedStickers.value = new Set();
      currentProfileStickers.value = {};
    };

    return {
      earnedStickers,
      currentProfileStickers,
      allAvailableStickers,
      earnedStickerList,
      unearnedStickers,
      totalEarned,
      addSticker,
      checkAndEarnStickers,
      getProfileStickers,
      hasSticker,
      reset,
    };
  },
  {
    persist: {
      serializer: {
        deserialize: (value) => {
          const parsed = JSON.parse(value);
          if (parsed.earnedStickers) {
            parsed.earnedStickers = new Set(parsed.earnedStickers);
          }
          return parsed;
        },
        serialize: (value: unknown) => {
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          const toSerialize = { ...(value as any) };
          if (toSerialize.earnedStickers instanceof Set) {
            toSerialize.earnedStickers = Array.from(toSerialize.earnedStickers);
          }
          return JSON.stringify(toSerialize);
        },
      },
    },
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStickerStore, import.meta.hot));
}
