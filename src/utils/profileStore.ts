import { reactive, watch, computed } from 'vue'
import { triggerSync } from './syncService'

export interface Profile {
  id: string
  name: string
  avatar: string
}

const STORAGE_KEY = 'abelma_profiles'
const ACTIVE_PROFILE_KEY = 'abelma_active_profile_id'

const defaultProfile: Profile = {
  id: 'default',
  name: 'Anak Hebat',
  avatar: '🧒'
}

const savedProfiles = localStorage.getItem(STORAGE_KEY)
const initialProfiles: Profile[] = savedProfiles ? JSON.parse(savedProfiles) : [defaultProfile]

const savedActiveId = localStorage.getItem(ACTIVE_PROFILE_KEY)
const firstProfile = initialProfiles[0]
const initialActiveId = savedActiveId || (firstProfile ? firstProfile.id : defaultProfile.id)

export const profileState = reactive({
  profiles: initialProfiles,
  activeProfileId: initialActiveId
})

export const activeProfile = computed(() => {
  return profileState.profiles.find(p => p.id === profileState.activeProfileId) || profileState.profiles[0]
})

export const profiles = computed(() => profileState.profiles)

export const selectProfile = (id: string) => {
    profileState.activeProfileId = id
}

watch(() => profileState.profiles, (newProfiles) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfiles))
  triggerSync()
}, { deep: true })

watch(() => profileState.activeProfileId, (newId) => {
  localStorage.setItem(ACTIVE_PROFILE_KEY, newId)
  // Force reload some stores if needed, or rely on reactive computed
})

export const createProfile = (name: string, avatar: string) => {
  const newProfile: Profile = {
    id: `profile-${Date.now()}`,
    name,
    avatar
  }
  profileState.profiles.push(newProfile)
  profileState.activeProfileId = newProfile.id
  return newProfile
}

export const deleteProfile = (id: string) => {
  if (profileState.profiles.length <= 1) return // Keep at least one
  profileState.profiles = profileState.profiles.filter(p => p.id !== id)
  if (profileState.activeProfileId === id) {
    const first = profileState.profiles[0]
    if (first) {
      profileState.activeProfileId = first.id
    }
  }
}
