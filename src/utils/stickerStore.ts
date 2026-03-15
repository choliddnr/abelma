import { reactive, watch } from 'vue'
import { triggerSync } from './syncService'
import { profileState } from './profileStore'

export interface Sticker {
  id: string
  emoji: string
  name: string
  requiredScore: number
}

export const allAvailableStickers: Sticker[] = [
  { id: 'star_explorer', emoji: '⭐', name: 'Penjelajah Bintang', requiredScore: 50 },
  { id: 'cool_cat', emoji: '🐱', name: 'Kucing Keren', requiredScore: 100 },
  { id: 'word_wizard', emoji: '🧙', name: 'Penyihir Kata', requiredScore: 150 },
  { id: 'fire_dragon', emoji: '🐲', name: 'Naga Api', requiredScore: 200 },
  { id: 'super_owl', emoji: '🦉', name: 'Burung Hantu Pintar', requiredScore: 250 },
  { id: 'rainbow_unicorn', emoji: '🦄', name: 'Unicorn Pelangi', requiredScore: 300 },
]

const STORAGE_KEY = 'abelma_stickers_map'

// Map of profileId -> Array of stickerIds
const saved = localStorage.getItem(STORAGE_KEY)
const initialStickersMap: Record<string, string[]> = saved ? JSON.parse(saved) : {}

export const profileStickersMap = reactive<Record<string, string[]>>(initialStickersMap)

watch(profileStickersMap, () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profileStickersMap))
    triggerSync()
}, { deep: true })

export const earnedStickers = reactive<Set<string>>(new Set())

// Logic to sync earnedStickers Set with the current profile in the map
watch(() => profileState.activeProfileId, (profileId) => {
    const ids = profileStickersMap[profileId] || []
    earnedStickers.clear()
    ids.forEach(id => earnedStickers.add(id))
}, { immediate: true })

// Sync back from Set to Map
watch(earnedStickers, () => {
    profileStickersMap[profileState.activeProfileId] = Array.from(earnedStickers)
}, { deep: true })

export const checkAndEarnStickers = (currentScore: number): Sticker | null => {
    let earnedSticker: Sticker | null = null
    allAvailableStickers.forEach(sticker => {
        if (currentScore >= sticker.requiredScore && !earnedStickers.has(sticker.id)) {
            earnedStickers.add(sticker.id)
            if (!earnedSticker) earnedSticker = sticker
        }
    })
    return earnedSticker
}
