import { reactive, watch } from 'vue'
import { profileState } from './profileStore'
import { triggerSync } from './syncService'

export interface Reward {
  id: string
  title: string
  cost: number
  emoji: string
  status: 'available' | 'claimed' | 'fulfilled'
  claimedAt?: string
}

const POINTS_STORAGE_KEY = 'abelma_profile_points'
const REWARDS_STORAGE_KEY = 'abelma_profile_rewards'

// Points Map: profileId -> number
const savedPoints = localStorage.getItem(POINTS_STORAGE_KEY)
export const profilePointsMap = reactive<Record<string, number>>(savedPoints ? JSON.parse(savedPoints) : {})

// Rewards Map: profileId -> Reward[]
const savedRewards = localStorage.getItem(REWARDS_STORAGE_KEY)
export const profileRewardsMap = reactive<Record<string, Reward[]>>(savedRewards ? JSON.parse(savedRewards) : {})

// Persistence
watch(profilePointsMap, () => {
    localStorage.setItem(POINTS_STORAGE_KEY, JSON.stringify(profilePointsMap))
    triggerSync()
}, { deep: true })

watch(profileRewardsMap, () => {
    localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(profileRewardsMap))
    triggerSync()
}, { deep: true })

// Helper to get balance for current profile
export const getCurrentPoints = () => {
    return profilePointsMap[profileState.activeProfileId] || 0
}

export const addPoints = (amount: number) => {
    const profileId = profileState.activeProfileId
    if (!profilePointsMap[profileId]) profilePointsMap[profileId] = 0
    profilePointsMap[profileId] += amount
}

export const deductPoints = (amount: number) => {
    const profileId = profileState.activeProfileId
    if (!profilePointsMap[profileId]) profilePointsMap[profileId] = 0
    if (profilePointsMap[profileId] >= amount) {
        profilePointsMap[profileId] -= amount
        return true
    }
    return false
}

// Default rewards for new profiles
const defaultRewards: Reward[] = [
    { id: 'ice_cream', title: 'Es Krim Lezat', cost: 50, emoji: '🍦', status: 'available' },
    { id: 'playtime', title: 'Main Game 30 Menit', cost: 100, emoji: '🎮', status: 'available' },
    { id: 'new_toy', title: 'Beli Mainan Baru', cost: 500, emoji: '🧸', status: 'available' },
]

export const getProfileRewards = () => {
    const profileId = profileState.activeProfileId
    if (!profileRewardsMap[profileId]) {
        profileRewardsMap[profileId] = [...defaultRewards]
    }
    return profileRewardsMap[profileId]
}

export const addCustomReward = (title: string, cost: number, emoji: string) => {
    const profileId = profileState.activeProfileId
    const newReward: Reward = {
        id: `reward-${Date.now()}`,
        title,
        cost,
        emoji,
        status: 'available'
    }
    if (!profileRewardsMap[profileId]) profileRewardsMap[profileId] = []
    profileRewardsMap[profileId].push(newReward)
}

export const claimReward = (rewardId: string) => {
    const profileId = profileState.activeProfileId
    const rewards = profileRewardsMap[profileId] || []
    const reward = rewards.find(r => r.id === rewardId)
    
    if (reward && reward.status === 'available' && deductPoints(reward.cost)) {
        reward.status = 'claimed'
        reward.claimedAt = new Date().toISOString()
        return true
    }
    return false
}

export const fulfillReward = (rewardId: string) => {
    const profileId = profileState.activeProfileId
    const rewards = profileRewardsMap[profileId] || []
    const reward = rewards.find(r => r.id === rewardId)
    if (reward) {
        reward.status = 'fulfilled'
    }
}

export const deleteReward = (rewardId: string) => {
    const profileId = profileState.activeProfileId
    if (profileRewardsMap[profileId]) {
        profileRewardsMap[profileId] = profileRewardsMap[profileId].filter(r => r.id !== rewardId)
    }
}
