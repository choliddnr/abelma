import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Analytics, WordAnalytics, CloudProfile } from '@/types/stores'
import { useProfileStore } from './profileStore'

export const useAnalyticsStore = defineStore('analytics', () => {
  // State
  const analyticsMap = ref<Record<string, Record<string, WordAnalytics>>>({})

  // Initialize (Handled by persistence)
  const initialize = () => {}

  // Actions
  const recordMistake = async (profileId: string, type: string, targetId: string) => {
    if (!analyticsMap.value[profileId]) {
      analyticsMap.value[profileId] = {}
    }

    if (!analyticsMap.value[profileId][targetId]) {
      analyticsMap.value[profileId][targetId] = { mistakes: 0, lastAttempt: '' }
    }

    analyticsMap.value[profileId][targetId].mistakes++
    analyticsMap.value[profileId][targetId].lastAttempt = new Date().toISOString()
  }

  const getProfileAnalytics = async (profileId: string): Promise<Record<string, WordAnalytics>> => {
    return analyticsMap.value[profileId] || {}
  }

  const getAllAnalytics = async (): Promise<Analytics[]> => {
    const profileStore = useProfileStore()
    const profiles = profileStore.allProfiles

    const allAnalytics: Analytics[] = []

    for (const profile of profiles) {
      const profileAnalytics = await getProfileAnalytics(profile.id)
      for (const [targetId, analytics] of Object.entries(profileAnalytics)) {
        allAnalytics.push({
          type: 'word',
          targetId,
          mistakes: analytics.mistakes,
          lastAttempt: analytics.lastAttempt
        })
      }
    }

    return allAnalytics
  }

  const resetAnalytics = async (profileId: string) => {
    analyticsMap.value[profileId] = {}
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
          if (p.analytics) {
            analyticsMap.value[p.id] = {}
            p.analytics.forEach(a => {
              analyticsMap.value[p.id]![a.targetId] = {
                mistakes: a.mistakes,
                lastAttempt: a.lastAttempt
              }
            })
          }
        })
      }
    } catch (error) {
      console.error('Cloud load error:', error)
    }
  }

  // Computed
  const totalMistakes = computed(() => {
    let total = 0
    for (const profileAnalytics of Object.values(analyticsMap.value)) {
      for (const analytics of Object.values(profileAnalytics)) {
        total += analytics.mistakes
      }
    }
    return total
  })

  const getMistakeCount = (targetId: string): number => {
    for (const profileAnalytics of Object.values(analyticsMap.value)) {
      if (profileAnalytics[targetId]) {
        return profileAnalytics[targetId].mistakes
      }
    }
    return 0
  }

  const reset = () => {
    analyticsMap.value = {}
  }

  return {
    analyticsMap,
    totalMistakes,
    initialize,
    recordMistake,
    getProfileAnalytics,
    getAllAnalytics,
    resetAnalytics,
    loadFromCloud,
    getMistakeCount,
    reset
  }
}, {
  persist: true
})
