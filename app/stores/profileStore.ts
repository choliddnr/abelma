import type { Profile, CloudProfile } from '@/types/stores'
import { DEFAULT_CHALLENGE_CONFIG } from '@/constants/challengeDefaults'

export const useProfileStore = defineStore('profile', () => {
  // State
  const profiles = ref<Profile[]>([])
  const activeProfileId = ref<string | null>(null)
  const selectedProfile = computed(() => {
    return activeProfileId.value ? profiles.value.find(p => p.id === activeProfileId.value) || profiles.value[0] : null
  })

  const isHeaderHidden = ref(false)
  const isLoaded = ref(false)


  // Actions
  const selectProfile = (id: string) => {
    activeProfileId.value = id
  }

  const createProfile = async (name: string, avatar?: string): Promise<Profile> => {
    const newProfile: Profile = {
      id: `profile-${Date.now()}`,
      name,
      avatar: avatar || '🧒'
    }
    profiles.value.push(newProfile)
    activeProfileId.value = newProfile.id

    // Sync profile to backend FIRST so the row exists before inserting alphabetProgress.
    const { useSyncStore } = await import('./syncStore')
    const syncStore = useSyncStore()
    await syncStore.syncProfile()

    // Seed default challenge config for the new profile
    const { useAlphabetStore } = await import('./alphabetStore')
    const alphabetStore = useAlphabetStore()
    await alphabetStore.updateChallengeConfig(newProfile.id, [...DEFAULT_CHALLENGE_CONFIG])

    return newProfile
  }

  const deleteProfile = async (id: string) => {
    if (profiles.value.length <= 1) return // Keep at least one profile

    try {
      const response = await fetch(`/api/sync/profile?id=${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        console.error('Failed to delete profile from backend')
      }
    } catch (e) {
      console.error('Failed to contact backend for profile deletion', e)
    }

    profiles.value = profiles.value.filter(p => p.id !== id)

    if (activeProfileId.value === id) {
      if (profiles.value.length > 0) {
        activeProfileId.value = profiles.value[0]!.id
      } else {
        activeProfileId.value = null
      }
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
        // Update or add profiles from cloud
        cloudData.forEach((p) => {
          const localProfile = profiles.value.find(lp => lp.id === p.id)
          if (localProfile) {
            localProfile.name = p.name
            localProfile.avatar = p.avatar
          } else {
            profiles.value.push({
              id: p.id,
              name: p.name,
              avatar: p.avatar
            })
          }
        })
      }
    } catch (error) {
      console.error('Cloud load error:', error)
    } finally {
      isLoaded.value = true
    }
  }

  // Computed
  const activeProfile = computed(() => {
    return selectedProfile.value
  })

  const allProfiles = computed(() => {
    return profiles.value
  })

  const reset = () => {
    profiles.value = []
    activeProfileId.value = null
  }

  return {
    profiles,
    activeProfileId,
    selectedProfile,
    activeProfile,
    allProfiles,
    selectProfile,
    createProfile,
    deleteProfile,
    loadFromCloud,
    isHeaderHidden,
    isLoaded,
    reset
  }
}, {
  unstorage: {}
})

