/**
 * Utility to play audio with local file fallback.
 * It looks for files in /public/audio/... and falls back to window.speechSynthesis
 */

export const playWordAudio = async (text: string, path?: string) => {
    window.speechSynthesis.cancel()

    // 1. Try playing local file if path is provided
    if (path) {
        try {
            const audio = new Audio(path)
            await audio.play()
            return // Success
        } catch {
            console.warn(`Local audio not found at ${path}, falling back to TTS.`)
        }
    }

    // 2. Fallback to Web Speech API
    const utterance = new SpeechSynthesisUtterance(text.toLowerCase())
    utterance.lang = 'id-ID'
    utterance.rate = 0.9 // Slightly slower for children
    window.speechSynthesis.speak(utterance)
}

export const playSyllableAudio = async (syllable: string, path?: string) => {
    window.speechSynthesis.cancel()

    if (path) {
        try {
            const audio = new Audio(path)
            await audio.play()
            return
        } catch {
            // silent fallback
        }
    }

    const utterance = new SpeechSynthesisUtterance(syllable.toLowerCase())
    utterance.lang = 'id-ID'
    utterance.rate = 0.8 // Even slower for syllables
    window.speechSynthesis.speak(utterance)
}

export const playEffectAudio = (type: 'correct' | 'wrong' | 'sticker') => {
    // These could be actual .mp3 files later
    const texts = {
        correct: 'Pintar!',
        wrong: 'Tetot, coba lagi',
        sticker: 'Wah! Kamu dapat stiker baru!'
    }
    
    const utterance = new SpeechSynthesisUtterance(texts[type])
    utterance.lang = 'id-ID'
    window.speechSynthesis.speak(utterance)
}
