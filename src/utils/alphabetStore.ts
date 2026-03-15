import { reactive, watch } from 'vue'
import { profileState } from './profileStore'

export interface AlphabetProgress {
    score: number
    level: number
    weights: Record<string, number>
}

const STORAGE_KEY = 'abelma_alphabet_progress_map'

// profileId -> AlphabetProgress
const saved = localStorage.getItem(STORAGE_KEY)
export const profileAlphabetMap = reactive<Record<string, AlphabetProgress>>(saved ? JSON.parse(saved) : {})

watch(profileAlphabetMap, () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profileAlphabetMap))
}, { deep: true })

export const getAlphabetState = (profileId: string): AlphabetProgress => {
    if (!profileAlphabetMap[profileId]) {
        profileAlphabetMap[profileId] = {
            score: 0,
            level: 1,
            weights: {}
        }
    }
    return profileAlphabetMap[profileId]
}

export const getCurrentAlphabetState = () => getAlphabetState(profileState.activeProfileId)
