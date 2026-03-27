import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useProfileStore } from './profileStore'
import { useRewardStore } from './rewardStore'
import { useStickerStore } from './stickerStore'
import { useAnalyticsStore } from './analyticsStore'
import { useAlphabetStore } from './alphabetStore'
import { useSettingsStore } from './settingsStore'
import { useStorybookStore } from './storybookStore'
import type { CloudProfile } from '@/types/sync'

// Sync configuration
const SYNC_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
}

export const useSyncStore = defineStore('sync', () => {
  const isSyncing = ref(false)
  const lastSync = ref<Date | null>(null)
  const syncError = ref<string | null>(null)

  const triggerSync = async (retryCount = 0): Promise<void> => {
    const profileStore = useProfileStore()

    const profiles = profileStore.profiles
    if (profiles.length === 0) return

    isSyncing.value = true
    syncError.value = null

    try {
      // 1. Gather consolidated data for ALL profiles
      // Variables and logic to be used in modular sync where applicable

      // 2. Perform modular SYNC (Push)
      try {
        await syncProfile(0)
      } catch (e) {
        console.error("Profile sync inside triggerSync failed", e)
      }

      try {
        await syncAlphabet(0)
      } catch (e) {
        console.error("Alphabet sync inside triggerSync failed", e)
      }

      // 3. The cloud data updating is done inside each modular sync function.

      lastSync.value = new Date()
    } catch (error) {
      const errorMsg = String(error)
      syncError.value = errorMsg

      const remainingRetries = SYNC_CONFIG.maxRetries - retryCount
      if (remainingRetries > 0) {
        const delay = Math.min(SYNC_CONFIG.baseDelay * Math.pow(2, retryCount), SYNC_CONFIG.maxDelay)
        await new Promise(resolve => setTimeout(resolve, delay))
        return triggerSync(retryCount + 1)
      }
      throw error
    } finally {
      isSyncing.value = false
    }
  }

  const syncProfile = async (retryCount = 0): Promise<void> => {
    const profileStore = useProfileStore()
    const rewardStore = useRewardStore()
    const settingsStore = useSettingsStore()
    const analyticsStore = useAnalyticsStore()

    const profiles = profileStore.profiles
    if (profiles.length === 0) return

    isSyncing.value = true
    syncError.value = null

    try {
      const syncData: Partial<CloudProfile>[] = profiles.map(p => {
        const id = p.id
        return {
          id: id,
          name: p.name,
          avatar: p.avatar,
          points: rewardStore.profilePointsMap[id] || 0,
          letterCase: settingsStore.settings.letterCase,
          timerDuration: settingsStore.settings.timerDuration,
          analytics: Object.entries(analyticsStore.analyticsMap[id] || {}).map(([tid, data]) => ({
            type: 'word',
            targetId: tid,
            mistakes: data.mistakes,
            lastAttempt: data.lastAttempt
          }))
        }
      })

      const response = await fetch('/api/sync/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(syncData)
      })

      if (!response.ok) throw new Error(`Profile sync failed: ${response.statusText}`)

      const cloudData = await response.json()
      await updateStores(cloudData)

      lastSync.value = new Date()
    } catch (error) {
      const errorMsg = String(error)
      syncError.value = errorMsg

      const remainingRetries = SYNC_CONFIG.maxRetries - retryCount
      if (remainingRetries > 0) {
        const delay = Math.min(SYNC_CONFIG.baseDelay * Math.pow(2, retryCount), SYNC_CONFIG.maxDelay)
        await new Promise(resolve => setTimeout(resolve, delay))
        return syncProfile(retryCount + 1)
      }
      throw error
    } finally {
      isSyncing.value = false
    }
  }

  const syncAlphabet = async (retryCount = 0): Promise<void> => {
    const profileStore = useProfileStore()
    const alphabetStore = useAlphabetStore()
    const storybookStore = useStorybookStore()

    const profiles = profileStore.profiles
    if (profiles.length === 0) return

    isSyncing.value = true
    syncError.value = null

    try {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      const syncData: Partial<CloudProfile>[] = profiles.map(p => {
        const id = p.id

        // Transform storybook indices to letter objects
        const storybook = (storybookStore.profileProgressMap[id] || []).map(idx => ({
          letter: alphabet[idx] || '',
          isCompleted: true,
          lastRead: new Date().toISOString()
        })).filter(s => s.letter !== '')

        return {
          id: id,
          alphabetProgress: (() => {
            const state = alphabetStore.getAlphabetState(id)
            return {
              score: state.score,
              level: state.level,
              weights: JSON.stringify(state.weights),
              challengeConfig: JSON.stringify(state.challengeConfig ?? []),
              updatedAt: state.updatedAt
            }
          })(),
          storybookProgress: storybook
        }
      })

      const response = await fetch('/api/sync/alphabet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(syncData)
      })

      if (!response.ok) throw new Error(`Alphabet sync failed: ${response.statusText}`)

      const cloudData = await response.json()
      await updateStores(cloudData)

      lastSync.value = new Date()
    } catch (error) {
      const errorMsg = String(error)
      syncError.value = errorMsg

      const remainingRetries = SYNC_CONFIG.maxRetries - retryCount
      if (remainingRetries > 0) {
        const delay = Math.min(SYNC_CONFIG.baseDelay * Math.pow(2, retryCount), SYNC_CONFIG.maxDelay)
        await new Promise(resolve => setTimeout(resolve, delay))
        return syncAlphabet(retryCount + 1)
      }
      throw error
    } finally {
      isSyncing.value = false
    }
  }

  const updateStores = async (cloudData: CloudProfile[]) => {
    const profileStore = useProfileStore()
    const rewardStore = useRewardStore()
    const stickerStore = useStickerStore()
    const analyticsStore = useAnalyticsStore()
    const alphabetStore = useAlphabetStore()
    const settingsStore = useSettingsStore()
    const storybookStore = useStorybookStore()

    await profileStore.loadFromCloud(cloudData)
    await rewardStore.loadFromCloud(cloudData)
    await stickerStore.loadFromCloud(cloudData)
    await analyticsStore.loadFromCloud(cloudData)
    await alphabetStore.loadFromCloud(cloudData)
    await settingsStore.loadFromCloud(cloudData)
    await storybookStore.loadFromCloud(cloudData)
  }

  const loadFromCloud = async (): Promise<void> => {
    const response = await fetch('/api/sync')
    if (!response.ok) throw new Error('Failed to load from cloud')

    const cloudData = await response.json()
    await updateStores(cloudData)
  }

  const clearAllData = async () => {
    const profileStore = useProfileStore()
    const rewardStore = useRewardStore()
    const stickerStore = useStickerStore()
    const analyticsStore = useAnalyticsStore()
    const alphabetStore = useAlphabetStore()
    const settingsStore = useSettingsStore()
    const storybookStore = useStorybookStore()

    profileStore.reset()
    rewardStore.reset()
    stickerStore.reset()
    analyticsStore.reset()
    alphabetStore.reset()
    settingsStore.reset()
    storybookStore.reset()

    lastSync.value = null
    syncError.value = null
  }

  return {
    isSyncing,
    lastSync,
    syncError,
    triggerSync,
    syncAlphabet,
    syncProfile,
    loadFromCloud,
    clearAllData
  }
})
