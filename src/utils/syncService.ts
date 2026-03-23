import { profileState } from './profileStore'
import { profilePointsMap, profileRewardsMap } from './rewardStore'
import { profileStickersMap } from './stickerStore'
import { analyticsMap } from './analyticsStore'
import { profileAlphabetMap } from './alphabetStore'
import type { CloudProfile, CloudAnalytics } from '../types/sync'

const STORAGE_KEY = 'abelma-local-storage'

// Retry configuration
const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000

// Collect data for sync
const collectData = () => {
  return profileState.profiles.map(p => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    points: profilePointsMap[p.id] || 0,
    rewards: profileRewardsMap[p.id] || [],
    stickers: (profileStickersMap[p.id] || []).map(id => ({ stickerId: id })),
    analytics: Object.entries(analyticsMap[p.id] || {}).map(([targetId, meta]) => ({
      type: targetId.length === 1 ? 'letter' : 'word',
      targetId,
      mistakes: meta.mistakes,
      lastAttempt: meta.lastAttempt
    })),
    alphabetProgress: profileAlphabetMap[p.id] ? {
      score: profileAlphabetMap[p.id]!.score,
      level: profileAlphabetMap[p.id]!.level,
      weights: JSON.stringify(profileAlphabetMap[p.id]!.weights)
    } : null
  }))
}

// Sync with retry logic and exponential backoff
export const triggerSync = async () => {
  const data = collectData()

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        console.log('Sync successful, attempt:', attempt + 1)
        return true
      }

      const retryDelay = BASE_DELAY_MS * Math.pow(2, attempt)
      console.log('Sync failed, retrying in', retryDelay, 'ms (attempt', attempt + 1, 'of', MAX_RETRIES, ')')
      await new Promise(resolve => setTimeout(resolve, retryDelay))

      // Check for rate limit or server error
      if (res.status === 429 || res.status >= 500) {
        continue
      }
    } catch (error) {
      console.error('Sync error (attempt', attempt + 1, '):', error)
      if (attempt < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, BASE_DELAY_MS * Math.pow(2, attempt)))
      }
    }
  }

  console.error('All sync attempts failed')
  return false
}

// Load from cloud with error handling
export const loadFromCloud = async () => {
  try {
    const res = await fetch('/api/sync')
    if (!res.ok) {
      console.error('Failed to load from cloud, status:', res.status)
      return false
    }
    const cloudData = await res.json() as CloudProfile[]

    // Merge strategy: Cloud wins
    cloudData.forEach(p => {
      const localP = profileState.profiles.find(lp => lp.id === p.id)
      if (localP) {
        localP.name = p.name
        localP.avatar = p.avatar
      } else {
        profileState.profiles.push({ id: p.id, name: p.name, avatar: p.avatar })
      }

      profilePointsMap[p.id] = p.points
      profileRewardsMap[p.id] = p.rewards || []
      profileStickersMap[p.id] = (p.stickers || []).map(s => s.stickerId)

      const pAnalytics: Record<string, { mistakes: number, lastAttempt: string }> = {}
      if (p.analytics) {
        p.analytics.forEach((a: CloudAnalytics) => {
          pAnalytics[a.targetId] = { mistakes: a.mistakes, lastAttempt: a.lastAttempt }
        })
      }
      analyticsMap[p.id] = pAnalytics

      if (p.alphabetProgress) {
        profileAlphabetMap[p.id] = {
          score: p.alphabetProgress.score,
          level: p.alphabetProgress.level,
          weights: JSON.parse(p.alphabetProgress.weights)
        }
      }
    })
    return true
  } catch (error) {
    console.error('Fetch failed, error:', error)
    return false
  }
}

// Local storage persistence with debounce
let debounceTimer: NodeJS.Timeout | null = null
export const persistToLocalStorage = (data: any) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, 500)
}

// Load from local storage
export const loadFromLocalStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    return null
  } catch (error) {
    console.error('Failed to load from local storage, error:', error)
    return null
  }
}

// Clear local storage
export const clearLocalStorage = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  localStorage.removeItem(STORAGE_KEY)
}
