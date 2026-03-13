import { reactive, watch } from 'vue'

export type LetterCase = 'uppercase' | 'lowercase'

export interface WordSettings {
  timerDuration: number // 0 for off, otherwise seconds
  letterCase: LetterCase
}

const STORAGE_KEY = 'abelma_word_settings'

const defaultSettings: WordSettings = {
  timerDuration: 30,
  letterCase: 'uppercase'
}

const saved = localStorage.getItem(STORAGE_KEY)
const initialSettings = saved ? JSON.parse(saved) : defaultSettings

export const wordSettings = reactive<WordSettings>(initialSettings)

watch(wordSettings, (newVal) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
}, { deep: true })
