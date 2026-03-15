import { reactive, watch } from 'vue'
import { triggerSync } from './syncService'
import { profileState } from './profileStore'

export interface WordAnalytics {
  mistakes: number
  lastAttempt: string
}

const STORAGE_KEY = 'abelma_analytics_map'

// profileId -> wordId -> WordAnalytics
const saved = localStorage.getItem(STORAGE_KEY)
const initialMap: Record<string, Record<string, WordAnalytics>> = saved ? JSON.parse(saved) : {}

export const analyticsMap = reactive<Record<string, Record<string, WordAnalytics>>>(initialMap)

watch(analyticsMap, () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(analyticsMap))
  triggerSync()
}, { deep: true })

export const recordMistake = (wordId: string) => {
  const profileId = profileState.activeProfileId
  if (!analyticsMap[profileId]) {
    analyticsMap[profileId] = {}
  }
  
  if (!analyticsMap[profileId][wordId]) {
    analyticsMap[profileId][wordId] = { mistakes: 0, lastAttempt: '' }
  }
  
  analyticsMap[profileId][wordId].mistakes++
  analyticsMap[profileId][wordId].lastAttempt = new Date().toISOString()
}

export const getProfileAnalytics = () => {
  return analyticsMap[profileState.activeProfileId] || {}
}
