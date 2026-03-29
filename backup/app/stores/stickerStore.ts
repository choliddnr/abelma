import type { Sticker, CloudProfile } from '@/types/stores'

export const useStickerStore = defineStore('sticker', () => {
  // State
  const earnedStickers = ref<Set<string>>(new Set())
  const currentProfileStickers = ref<Record<string, string[]>>({})
  const allAvailableStickers: Sticker[] = [
    { id: 'star_explorer', emoji: '⭐', name: 'Penjelajah Bintang', requiredScore: 50 },
    { id: 'cool_cat', emoji: '🐱', name: 'Kucing Keren', requiredScore: 100 },
    { id: 'word_wizard', emoji: '🧙', name: 'Penyihir Kata', requiredScore: 150 },
    { id: 'fire_dragon', emoji: '🐲', name: 'Naga Api', requiredScore: 200 },
    { id: 'super_owl', emoji: '🦉', name: 'Burung Hantu Pintar', requiredScore: 250 },
    { id: 'rainbow_unicorn', emoji: '🦄', name: 'Unicorn Pelangi', requiredScore: 300 }
  ]
  // Get current profile ID
  const { activeProfileId: profileId } = storeToRefs(useProfileStore())

  // Initialize is no longer needed with persistence plugin.
  const initialize = () => {
    // Logic moved to persist
  }

  // Actions
  const addSticker = async (stickerId: string) => {


    if (!profileId.value) return

    currentProfileStickers.value[profileId.value] = currentProfileStickers.value[profileId.value] || []

    if (!currentProfileStickers.value[profileId.value]!.includes(stickerId)) {
      currentProfileStickers.value[profileId.value]!.push(stickerId)
      earnedStickers.value.add(stickerId)
    }
  }

  const getEarnableStickers = (): Sticker[] => {
    const rewardStore = useRewardStore()
    const currentScore = rewardStore.currentPoints

    return allAvailableStickers.filter(sticker => {
      const alreadyEarned = earnedStickers.value.has(sticker.id)
      const canAfford = currentScore >= sticker.requiredScore
      return !alreadyEarned && canAfford
    })
  }

  const checkAndEarnStickers = (currentScore: number): Sticker | null => {
    let earnedSticker: Sticker | null = null

    for (const sticker of allAvailableStickers) {
      if (currentScore >= sticker.requiredScore && !earnedStickers.value.has(sticker.id)) {
        earnedStickers.value.add(sticker.id)
        if (!earnedSticker) {
          earnedSticker = sticker
        }
      }
    }

    if (earnedSticker) {
      if (profileId.value) {
        if (!currentProfileStickers.value[profileId.value]) {
          currentProfileStickers.value[profileId.value] = []
        }
        const profileStickers = currentProfileStickers.value[profileId.value] as string[]
        if (!profileStickers.includes(earnedSticker.id)) {
          profileStickers.push(earnedSticker.id)
        }
      }
    }

    return earnedSticker
  }

  const getProfileStickers = (profileId: string): string[] => {
    return currentProfileStickers.value[profileId] || []
  }

  const hasSticker = (stickerId: string): boolean => {
    return earnedStickers.value.has(stickerId)
  }

  const loadFromCloud = async (cloudData?: CloudProfile[]) => {
    try {
      if (!cloudData) {
        const response = await fetch('/api/sync')
        if (!response.ok) return
        cloudData = (await response.json()) as CloudProfile[]
      }

      if (Array.isArray(cloudData)) {
        cloudData.forEach(p => {
          if (p.stickers) {
            currentProfileStickers.value[p.id] = p.stickers.map(s => s.stickerId)
          }
        })
      }
    } catch (error) {
      console.error('Cloud load error:', error)
    }
  }

  // Computed
  const earnedStickerList = computed(() => {
    return allAvailableStickers.filter(sticker => earnedStickers.value.has(sticker.id))
  })

  const unearnedStickers = computed(() => {
    return allAvailableStickers.filter(sticker => !earnedStickers.value.has(sticker.id))
  })

  const totalEarned = computed(() => {
    return earnedStickers.value.size
  })

  const reset = () => {
    earnedStickers.value = new Set()
    currentProfileStickers.value = {}
  }

  return {
    earnedStickers,
    currentProfileStickers,
    allAvailableStickers,
    earnedStickerList,
    unearnedStickers,
    totalEarned,
    initialize,
    addSticker,
    getEarnableStickers,
    checkAndEarnStickers,
    getProfileStickers,
    hasSticker,
    loadFromCloud,
    reset
  }
}, {
  persist: {
    // pinia-plugin-persistedstate doesn't handle Set natively well without serializers
    serializer: {
      deserialize: (value) => {
        const parsed = JSON.parse(value)
        if (parsed.earnedStickers) {
          parsed.earnedStickers = new Set(parsed.earnedStickers)
        }
        return parsed
      },
      serialize: (value: unknown) => {
        // We only want to serialize certain fields
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const toSerialize = { ...(value as any) }
        if (toSerialize.earnedStickers instanceof Set) {
          toSerialize.earnedStickers = Array.from(toSerialize.earnedStickers)
        }
        return JSON.stringify(toSerialize)
      }
    }
  }
})

