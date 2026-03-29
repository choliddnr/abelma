import type { AlphabetProgress, CloudProfile, AlphabetChallengeModeConfig } from '@/types/stores'

export const useAlphabetStore = defineStore('alphabet', () => {
  // State
  const profileAlphabetMap = ref<Record<string, AlphabetProgress>>({})

  // Initialize (Handled by persistence)
  const initialize = () => { }

  // Actions
  const getAlphabetState = (profileId: string): AlphabetProgress => {
    if (!profileAlphabetMap.value[profileId]) {
      profileAlphabetMap.value[profileId] = {
        score: 0,
        level: 1,
        weights: {},
        challengeConfig: [],
        updatedAt: new Date(0).toISOString()
      }
    }
    return profileAlphabetMap.value[profileId]
  }

  const getCurrentAlphabetState = (): AlphabetProgress => {
    const profileStore = useProfileStore()
    return getAlphabetState(profileStore.activeProfileId || '')
  }

  const updateProgress = async (profileId: string, data: Partial<AlphabetProgress>) => {
    const state = getAlphabetState(profileId)
    Object.assign(state, {
      ...data,
      updatedAt: new Date().toISOString()
    })
  }

  const updateChallengeConfig = async (profileId: string, config: AlphabetChallengeModeConfig[]) => {
    const state = getAlphabetState(profileId)
    state.challengeConfig = config
    state.updatedAt = new Date().toISOString()
    await triggerSync()
  }

  const resetProgress = async (profileId: string) => {
    profileAlphabetMap.value[profileId] = {
      score: 0,
      level: 1,
      weights: {},
      challengeConfig: [],
      updatedAt: new Date().toISOString()
    }
  }

  const loadFromCloud = async (cloudData?: CloudProfile[]) => {
    try {
      if (!cloudData) {
        const response = await fetch('/api/sync')
        if (!response.ok) return
        cloudData = (await response.json()) as CloudProfile[]
      }

      if (Array.isArray(cloudData)) {
        let needsPush = false

        cloudData.forEach(p => {
          const cloudAP = p.alphabetProgress
          if (!cloudAP) return

          const localAP = profileAlphabetMap.value[p.id]
          const cloudDate = new Date(cloudAP.updatedAt).getTime()
          const localDate = localAP ? new Date(localAP.updatedAt).getTime() : 0

          if (cloudDate > localDate) {
            // Cloud is newer
            profileAlphabetMap.value[p.id] = {
              score: cloudAP.score,
              level: cloudAP.level,
              weights: typeof cloudAP.weights === 'string' ? JSON.parse(cloudAP.weights) : cloudAP.weights || {},
              challengeConfig: cloudAP.challengeConfig
                ? (typeof cloudAP.challengeConfig === 'string' ? JSON.parse(cloudAP.challengeConfig) : cloudAP.challengeConfig)
                : [],
              updatedAt: cloudAP.updatedAt
            }
          } else if (localDate > cloudDate) {
            // Local is newer
            needsPush = true
          }
        })

        if (needsPush) {
          await triggerSync()
        }
      }
    } catch (error) {
      console.error('Cloud load error:', error)
    }
  }

  const triggerSync = async () => {
    const { useSyncStore } = await import('./syncStore')
    const syncStore = useSyncStore()
    await syncStore.syncAlphabet()
  }

  // Computed
  const totalScore = computed(() => {
    return Object.values(profileAlphabetMap.value).reduce((sum, progress) => sum + (progress.score || 0), 0)
  })

  const currentLevel = computed(() => {
    const profileStore = useProfileStore()
    const activeId = profileStore.activeProfileId
    return activeId ? profileAlphabetMap.value[activeId]?.level || 1 : 1
  })

  const reset = () => {
    profileAlphabetMap.value = {}
  }

  return {
    profileAlphabetMap,
    totalScore,
    currentLevel,
    initialize,
    getAlphabetState,
    getCurrentAlphabetState,
    updateProgress,
    updateChallengeConfig,
    resetProgress,
    loadFromCloud,
    reset
  }
}, {
  unstorage: {}
})

