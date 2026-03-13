import { reactive, watch } from 'vue'

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

const STORAGE_KEY = 'abelma_earned_stickers'

const saved = localStorage.getItem(STORAGE_KEY)
const initialEarned: string[] = saved ? JSON.parse(saved) : []

export const earnedStickers = reactive<Set<string>>(new Set(initialEarned))

watch(earnedStickers, () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(earnedStickers)))
}, { deep: true })

export const checkAndEarnStickers = (currentScore: number) => {
    let earnedNew = false
    allAvailableStickers.forEach(sticker => {
        if (currentScore >= sticker.requiredScore && !earnedStickers.has(sticker.id)) {
            earnedStickers.add(sticker.id)
            earnedNew = true
        }
    })
    return earnedNew
}
