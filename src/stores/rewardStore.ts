import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Reward, DefaultReward, CloudProfile } from '@/types/stores'
import { useProfileStore } from './profileStore'

export const useRewardStore = defineStore('reward', () => {
  const profileStore = useProfileStore()
  const activeProfileId = computed(() => profileStore.activeProfileId)

  // State
  const profilePointsMap = ref<Record<string, number>>({})
  const profileRewardsMap = ref<Record<string, Reward[]>>({})

  const currentPoints = computed({
    get: () => (activeProfileId.value ? profilePointsMap.value[activeProfileId.value] || 0 : 0),
    set: (val) => {
      if (activeProfileId.value) {
        profilePointsMap.value[activeProfileId.value] = val
      }
    }
  })

  const rewards = computed({
    get: () => {
      if (!activeProfileId.value) return []
      if (!profileRewardsMap.value[activeProfileId.value]) {
        profileRewardsMap.value[activeProfileId.value] = [
          { id: 'ice_cream', title: 'Es Krim Lezat', cost: 50, emoji: '🍦', status: 'available' },
          { id: 'playtime', title: 'Main Game 30 Menit', cost: 100, emoji: '🎮', status: 'available' },
          { id: 'new_toy', title: 'Beli Mainan Baru', cost: 500, emoji: '🧸', status: 'available' }
        ]
      }
      return profileRewardsMap.value[activeProfileId.value]!
    },
    set: (val) => {
      if (activeProfileId.value) {
        profileRewardsMap.value[activeProfileId.value] = val
      }
    }
  })

  const defaultRewards: DefaultReward[] = [
    { id: 'ice_cream', title: 'Es Krim Lezat', cost: 50, emoji: '🍦' },
    { id: 'playtime', title: 'Main Game 30 Menit', cost: 100, emoji: '🎮' },
    { id: 'new_toy', title: 'Beli Mainan Baru', cost: 500, emoji: '🧸' }
  ]

  // Actions
  const addPoints = async (amount: number) => {
    if (!activeProfileId.value) return
    currentPoints.value += amount
  }

  const deductPoints = async (amount: number): Promise<boolean> => {
    if (!activeProfileId.value) return false
    if (currentPoints.value >= amount) {
      currentPoints.value -= amount
      return true
    }
    return false
  }

  const claimReward = async (rewardId: string): Promise<boolean> => {
    const reward = rewards.value.find(r => r.id === rewardId)
    if (!reward || reward.status !== 'available') {
      return false
    }

    const success = await deductPoints(reward.cost)
    if (success) {
      reward.status = 'claimed'
      reward.claimedAt = new Date().toISOString()
      await triggerSync()
    }
    return success
  }

  const fulfillReward = async (rewardId: string) => {
    const reward = rewards.value.find(r => r.id === rewardId)
    if (reward) {
      reward.status = 'fulfilled'
      await triggerSync()
    }
  }

  const addCustomReward = async (title: string, cost: number, emoji: string) => {
    if (!activeProfileId.value) return
    const newReward: Reward = {
      id: `reward-${Date.now()}`,
      title,
      cost,
      emoji,
      status: 'available'
    }
    rewards.value.push(newReward)
    await triggerSync()
  }

  const deleteReward = async (rewardId: string) => {
    const index = rewards.value.findIndex(r => r.id === rewardId)
    if (index !== -1) {
      rewards.value.splice(index, 1)
      await triggerSync()
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
        cloudData.forEach(p => {
          profilePointsMap.value[p.id] = p.points
          profileRewardsMap.value[p.id] = p.rewards
        })
      }
    } catch (error) {
      console.error('Cloud load error:', error)
    }
  }

  const triggerSync = async () => {
    const { useSyncStore } = await import('./syncStore')
    const syncStore = useSyncStore()
    await syncStore.syncRewards()
  }

  // Computed
  const availableRewards = computed(() => {
    return rewards.value.filter(r => r.status === 'available')
  })

  const claimedRewards = computed(() => {
    return rewards.value.filter(r => r.status === 'claimed')
  })

  const fulfilledRewards = computed(() => {
    return rewards.value.filter(r => r.status === 'fulfilled')
  })

  const canAfford = (cost: number): boolean => {
    return currentPoints.value >= cost
  }

  const reset = () => {
    profilePointsMap.value = {}
    profileRewardsMap.value = {}
  }

  return {
    profilePointsMap,
    profileRewardsMap,
    currentPoints,
    rewards,
    defaultRewards,
    availableRewards,
    claimedRewards,
    fulfilledRewards,
    canAfford,
    addPoints,
    deductPoints,
    claimReward,
    fulfillReward,
    addCustomReward,
    deleteReward,
    loadFromCloud,
    reset
  }
}, {
  persist: true
})

