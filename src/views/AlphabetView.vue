<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authClient } from '@/lib/auth-client'

const session = authClient.useSession()
const colors = [
  'bg-[#FFD93D]', // Yellow
  'bg-[#6BCB77]', // Green
  'bg-[#4D96FF]', // Blue
  'bg-[#ff9a9a]', // Pink
  'bg-[#A084E8]', // Purple
]

const getLetterColor = (letter: string) => {
  const index = letters.indexOf(letter.toUpperCase())
  return colors[index % colors.length]
}

// Fixed mapping for more accurate Indonesian learning
const idLetterMap: Record<string, { emoji: string; word: string }> = {
  A: { emoji: '🍎', word: 'Apel' },
  B: { emoji: '🎈', word: 'Balon' },
  C: { emoji: '🍒', word: 'Ceri' },
  D: { emoji: '🐕', word: 'Domba' },
  E: { emoji: '🐘', word: 'Elang' },
  F: { emoji: '🍄', word: 'Fungi' },
  G: { emoji: '🦒', word: 'Gajah' },
  H: { emoji: '🚁', word: 'Helikopter' },
  I: { emoji: '🐟', word: 'Ikan' },
  J: { emoji: '🦒', word: 'Jerapah' },
  K: { emoji: '🐈', word: 'Kucing' },
  L: { emoji: '🦁', word: 'Lumba' },
  M: { emoji: '🐒', word: 'Monyet' },
  N: { emoji: '🍍', word: 'Nanas' },
  O: { emoji: '🐙', word: 'Oktopus' },
  P: { emoji: '🦅', word: 'Pinguin' },
  Q: { emoji: '👑', word: 'Ratu' },
  R: { emoji: '🏠', word: 'Rumah' },
  S: { emoji: '🐍', word: 'Sapi' },
  T: { emoji: '🐘', word: 'Tikus' },
  U: { emoji: '🦒', word: 'Unta' },
  V: { emoji: '🎻', word: 'Violet' },
  W: { emoji: '🦒', word: 'Wortel' },
  X: { emoji: '🎸', word: 'Xilofon' },
  Y: { emoji: '🐙', word: 'Yoyo' },
  Z: { emoji: '🦓', word: 'Zebra' },
}

// Scoring and Challenge State
const score = ref(0)
const level = ref(1)
const streak = ref(0)
const maxStreak = ref(0)
const speaking = ref(false)
const mistakeMadeInCurrentLevel = ref(false)

const router = useRouter()
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const challengeLetters = ref([...letters])
const STORAGE_KEY = 'abelma-belajar-huruf-state'

const shuffleLetters = () => {
  const array = [...letters]
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i]
    array[i] = array[j]!
    array[j] = temp!
  }
  challengeLetters.value = array
}

const letterWeights = ref<Record<string, number>>({})

const initializeWeights = () => {
  const allLetters = [...letters, ...letters.map(l => l.toLowerCase())]
  allLetters.forEach(l => {
    if (letterWeights.value[l] === undefined) {
      letterWeights.value[l] = 0
    }
  })
}

initializeWeights()

const targetWeight = computed(() => {
  // if (level.value === 0) return 5
  // if (level.value === 1) return 10
  return 5
})

const progressPercentage = computed(() => {
  const allLetters = [...letters, ...letters.map(l => l.toLowerCase())]
  const currentTotalWeight = allLetters.reduce((sum, l) => sum + Math.max(0, letterWeights.value[l] || 0), 0)
  const requiredTarget = mistakeMadeInCurrentLevel.value ? targetWeight.value : 1
  const maxTotalWeight = requiredTarget * allLetters.length
  return Math.min(100, Math.max(0, (currentTotalWeight / maxTotalWeight) * 100))
})

const pickNextLetter = (lastLetter: string = '', currentTargetWeight: number = 0): string => {
  const allLetters = [...letters, ...letters.map(l => l.toLowerCase())]

  let candidates = allLetters.filter(l => l !== lastLetter && (letterWeights.value[l] || 0) < currentTargetWeight)

  if (candidates.length === 0) return allLetters[0]!

  const minCurrentWeight = Math.min(...candidates.map(l => letterWeights.value[l] || 0))
  const minWeightCandidates = candidates.filter(l => (letterWeights.value[l] || 0) === minCurrentWeight)

  if (minWeightCandidates.length > 0) {
    candidates = minWeightCandidates
  }

  const randomIndex = Math.floor(Math.random() * candidates.length)
  const picked = candidates[randomIndex]!

  // Update the UI state based on the picked letter's case
  isUpperCase.value = picked === picked.toUpperCase()
  return picked
}



const checkLevelUp = (): boolean => {
  const allLetters = [...letters, ...letters.map(l => l.toLowerCase())]
  const minWeight = Math.min(...allLetters.map(l => letterWeights.value[l] || 0))

  const requiredWeight = mistakeMadeInCurrentLevel.value ? targetWeight.value : 1

  if (minWeight >= requiredWeight) {
    level.value++
    allLetters.forEach(l => letterWeights.value[l] = 0)
    mistakeMadeInCurrentLevel.value = false
    return true
  }
  return false
}
const isChallengeMode = ref(false)
const isUpperCase = ref(true)
const targetLetter = ref('')
const feedback = ref<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null })
const wrongLetter = ref('') // Track the last wrong letter for animation

// Preloaded audio objects for letters
const preloadedAudio = new Map<string, HTMLAudioElement>()
let currentAudio: HTMLAudioElement | null = null

const preloadSounds = () => {
  letters.forEach(letter => {
    const audioPath = `/Letter-${letter.toUpperCase()}.webm`
    const audio = new Audio(audioPath)
    audio.load()
    preloadedAudio.set(letter.toUpperCase(), audio)
  })
}

// Toast Notification System
const toasts = ref<Array<{ id: number; message: string; type: 'success' | 'error' | 'info' }>>([])
let toastId = 0
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  const id = toastId++
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 4000)
}

const timeLeft = ref(0)
const timerInterval = ref<number | null>(null)

const stopTimer = () => {
  if (timerInterval.value) {
    window.clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

const handleTimeout = () => {
  stopTimer()
  score.value -= 5
  if (targetLetter.value) {
    letterWeights.value[targetLetter.value] = (letterWeights.value[targetLetter.value] || 0) - 0.5
  }
  mistakeMadeInCurrentLevel.value = true
  feedback.value = { message: 'Waktu habis! Memuat huruf baru...', type: 'error' }
  speak('Waktu habis. Dengarkan suara, lalu pilih huruf yang benar!')
  wrongLetter.value = targetLetter.value

  setTimeout(() => {
    wrongLetter.value = ''
    if (isChallengeMode.value) {
      if (level.value >= 2) shuffleLetters()
      const nextLetter = pickNextLetter(targetLetter.value, targetWeight.value)
      targetLetter.value = nextLetter
      feedback.value = { message: 'Dengarkan suara, lalu pilih huruf yang benar!', type: null }
      playLetterSound(targetLetter.value)
      startTimer()
    }
  }, 2000)
}

const startTimer = () => {
  stopTimer()
  if (level.value >= 3) {
    timeLeft.value = level.value === 3 ? 8 : 3
    timerInterval.value = window.setInterval(() => {

      if (!speaking.value) timeLeft.value--
      if (timeLeft.value <= 0) {
        handleTimeout()
      }
    }, 1000)
  }
}

onUnmounted(() => {
  stopTimer()

})

const goBack = () => router.push('/')

// State Persistence Logic
const saveToLocal = () => {
  const state = {
    score: score.value,
    level: level.value,
    weights: letterWeights.value
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const saveState = async () => {
  if (!session.value.data?.user.id) {
    showToast('Silakan masuk log terlebih dahulu untuk menyimpan ke cloud!', 'error')
    return
  }

  try {
    const res = await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: session.value.data?.user.id,
        score: score.value,
        level: level.value,
        weights: letterWeights.value
      })
    })

    if (res.ok) {
      showToast('Kemajuan berhasil disimpan ke cloud! ☁️', 'success')
    } else {
      throw new Error('Gagal menyimpan ke cloud')
    }
  } catch (e) {
    console.error('Failed to save state to DB', e)
    showToast('Maaf, gagal menyimpan ke cloud. Coba lagi nanti ya!', 'error')
  }
}

const loadFromLocal = (): boolean => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const data = JSON.parse(saved)
      if (typeof data.score === 'number') score.value = data.score
      if (typeof data.level === 'number') level.value = Math.max(1, data.level)
      if (data.weights) {
        Object.assign(letterWeights.value, data.weights)
        initializeWeights() // Ensure any new letters (cases) are added

        const allWeights = Object.values(letterWeights.value)
        if (allWeights.some(w => w < 0 || w > 1 || w % 1 !== 0)) {
          mistakeMadeInCurrentLevel.value = true
        } else {
          mistakeMadeInCurrentLevel.value = false
        }
      }
      return true
    } catch (e) {
      console.error('Failed to parse local state', e)
    }
  }
  return false
}

const loadFromDB = async (): Promise<boolean> => {
  try {
    if (!session.value.data?.user.id) return false
    const res = await fetch(`/api/state?user=${encodeURIComponent(session.value.data?.user.id)}`)
    if (res.ok) {
      const data = await res.json()
      if (data) {
        if (typeof data.score === 'number') score.value = data.score
        if (typeof data.level === 'number') level.value = Math.max(1, data.level)
        if (data.weights) {
          Object.assign(letterWeights.value, data.weights)
          initializeWeights() // Ensure any new letters (cases) are added

          const allWeights = Object.values(letterWeights.value)
          if (allWeights.some(w => w < 0 || w > 1 || w % 1 !== 0)) {
            mistakeMadeInCurrentLevel.value = true
          }
        }
        return true
      }
    }
  } catch (e) {
    console.error('Failed to load state from DB', e)
  }
  return false
}

const loadState = async () => {
  // 1. Try Local Storage
  if (loadFromLocal()) {
    console.log('State loaded from local storage')
    return
  }

  // 2. Try Database
  if (await loadFromDB()) {
    console.log('State loaded from database')
    // Save to local for future sessions
    saveToLocal()
    return
  }

  // 3. Fallback to defaults (already set in refs)
  console.log('Using default state')
}

onMounted(() => {
  preloadSounds()
  loadState()
})

watch([score, level, letterWeights], () => {
  saveToLocal()
}, { deep: true })

const playLetterSound = (letter: string) => {
  // Cancel previous speech to prioritize letter sound
  window.speechSynthesis.cancel()

  // Stop currently playing letter sound if any
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
  }

  speaking.value = true

  const upperLetter = letter.toUpperCase()
  const audio = preloadedAudio.get(upperLetter)

  if (audio) {
    currentAudio = audio
    // Reset if already playing (sanity check)
    audio.pause()
    audio.currentTime = 0

    audio.onended = () => {
      speaking.value = false
      if (currentAudio === audio) currentAudio = null
    }

    audio.play().catch((err) => {
      console.warn(`Failed to play preloaded audio for ${letter}:`, err)
      fallbackToSpeech(letter)
    })
  } else {
    fallbackToSpeech(letter)
  }
}

const fallbackToSpeech = (letter: string) => {
  const utterance = new SpeechSynthesisUtterance(letter.toLowerCase())
  utterance.lang = 'id-ID'
  utterance.onend = () => {
    speaking.value = false
  }
  window.speechSynthesis.speak(utterance)
}

const startChallenge = async () => {
  isChallengeMode.value = true
  await loadState()
  wrongLetter.value = ''
  if (level.value >= 2) shuffleLetters()
  else challengeLetters.value = [...letters]
  targetLetter.value = pickNextLetter(targetLetter.value, targetWeight.value)
  feedback.value = { message: 'Dengarkan suara, lalu pilih huruf yang benar!', type: null }
  speak(`Ayo bermain tebak huruf, coba tebak mana huruf ${targetLetter.value}`)
  startTimer()
}

const stopChallenge = () => {
  isChallengeMode.value = false
  isUpperCase.value = true // Reset to uppercase for learning mode
  challengeLetters.value = [...letters]
  wrongLetter.value = ''
  feedback.value = { message: '', type: null }
  stopTimer()
}

const speak = (text: string) => {
  // Cancel any ongoing speech to avoid state confusion
  window.speechSynthesis.cancel()

  speaking.value = true
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'id-ID' // Bahasa Indonesia
  utterance.onend = () => {
    speaking.value = false
  }
  utterance.onerror = () => {
    speaking.value = false
  }
  window.speechSynthesis.speak(utterance)
}

const handleLetterClick = (letter: string) => {
  // In challenge mode, we wait for sounds to finish.
  // In learning mode, we allow interruption for better responsiveness.
  if (speaking.value && isChallengeMode.value) return
  if (isChallengeMode.value) {
    if (letter === (isUpperCase.value ? targetLetter.value : targetLetter.value.toUpperCase())) {
      stopTimer()
      streak.value++
      if (streak.value > maxStreak.value) maxStreak.value = streak.value

      const multiplier = Math.min(2, 1 + streak.value * 0.1)
      const points = Math.round(10 * multiplier)
      score.value += points

      // Update the specific case weight
      const caseCorrectLetter = isUpperCase.value ? targetLetter.value : targetLetter.value.toLowerCase()
      letterWeights.value[caseCorrectLetter] = (letterWeights.value[caseCorrectLetter] || 0) + 1

      const leveledUp = checkLevelUp()
      if (leveledUp) {
        feedback.value = { message: `Luar Biasa! Naik Level ${level.value}! 🌟`, type: 'success' }
      } else {
        feedback.value = { message: streak.value > 2 ? `${streak.value} Beruntun! 🎉` : 'Hebat! Kamu Benar! 🎉', type: 'success' }
      }
      wrongLetter.value = ''

      const nextLetter = pickNextLetter(targetLetter.value, targetWeight.value)

      if (leveledUp) {
        speak(`Luar biasa, kamu naik level. Sekarang tebak huruf ${nextLetter}`)
      } else {
        speak(`Benar, Sekarang tebak huruf ${nextLetter}`)
      }

      setTimeout(() => {
        if (isChallengeMode.value) {
          if (level.value >= 2) shuffleLetters()
          targetLetter.value = nextLetter
          feedback.value = { message: 'Dengarkan suara, lalu pilih huruf yang benar!', type: null }
          startTimer()
        }
      }, leveledUp ? 3500 : 1500)
    } else {
      streak.value = 0
      score.value = Math.max(0, score.value - 5)

      // Update weight for the target letter (the one they should have picked)
      const targetCased = isUpperCase.value ? targetLetter.value : targetLetter.value.toLowerCase()
      letterWeights.value[targetCased] = (letterWeights.value[targetCased] || 0) - 0.5

      // Update weight for the incorrect letter they clicked
      const clickedCased = isUpperCase.value ? letter : letter.toLowerCase()
      letterWeights.value[clickedCased] = (letterWeights.value[clickedCased] || 0) - 0.5

      mistakeMadeInCurrentLevel.value = true

      feedback.value = { message: 'Coba lagi yuk! Kamu pasti bisa! 💪', type: 'error' }
      wrongLetter.value = letter // Trigger shake on this letter
      speak(`Ini huruf ${letter}, tebak huruf ${targetLetter.value}`)

      // Clear shake after animation
      setTimeout(() => {
        if (wrongLetter.value === letter) wrongLetter.value = ''
      }, 500)
    }
  } else {
    playLetterSound(letter)
    // Visual feedback for learning mode
    feedback.value = { message: `${letter} untuk ${idLetterMap[letter]?.word || ''} ${idLetterMap[letter]?.emoji || ''}`, type: null }
    setTimeout(() => {
      if (!isChallengeMode.value) feedback.value = { message: '', type: null }
    }, 2000)
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Top Header Navigation -->
    <div class="flex items-center justify-between shrink-0 px-4 pt-4 pb-2">
      <!-- Left side: Back Button -->
      <button @click="goBack"
        class="ui-capsule-interactive bg-white border-slate-200 text-slate-700 w-auto hover:bg-slate-50 focus:ring-slate-200">
        <span class="text-xl md:text-2xl">🏠</span>
        <span class="font-black text-sm md:text-base hidden sm:inline">Kembali</span>
      </button>

      <!-- Right Side: Learning Controls & Case Toggle -->
      <div class="flex items-center gap-2 md:gap-4">
        <div v-if="!isChallengeMode && session.data" class="hidden lg:flex flex-col items-end text-slate-400 mr-2">
          <span class="text-[10px] font-black uppercase tracking-widest text-emerald-500">Cloud Sync Aktif</span>
          <span class="text-xs font-semibold">Kemajuanmu aman! ☁️</span>
        </div>

        <!-- Case Toggle Button (always visible) -->
        <button @click="isUpperCase = !isUpperCase"
          class="ui-capsule-interactive bg-white border-slate-200 text-slate-700 w-auto hover:bg-slate-50 focus:ring-slate-200"
          title="Ganti Huruf Besar/Kecil">
          <span class="text-xl md:text-2xl font-black">{{ isUpperCase ? 'abc' : 'ABC' }}</span>
          <span class="font-black text-sm md:text-base hidden sm:inline">{{ isUpperCase ? 'Kecil' : 'Besar' }}</span>
        </button>
      </div>
    </div>

    <!-- Mode Specific Dashboard / CTA Area -->
    <div class="shrink-0 px-4 flex flex-col items-center justify-center min-h-[80px]">

      <!-- Challenge Dashboard -->
      <div v-if="isChallengeMode" class="w-full max-w-4xl mx-auto flex flex-col gap-3">
        <!-- Stats Row -->
        <div class="flex flex-wrap items-center justify-center gap-2 md:gap-4 w-full">
          <!-- Timer -->
          <div v-if="level >= 3"
            class="ui-capsule bg-rose-50 border-rose-200 w-auto min-w-[80px] md:min-w-[100px] transition-colors duration-300"
            :class="{ 'animate-pulse bg-rose-100 border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)]': timeLeft <= 3 }">
            <span class="text-lg md:text-xl">⏱️</span>
            <span class="text-lg md:text-xl font-black text-rose-600">{{ timeLeft }}s</span>
          </div>

          <!-- Streak -->
          <div v-if="streak >= 2"
            class="ui-capsule bg-orange-50 border-orange-200 animate-bounce w-auto min-w-[70px] md:min-w-[90px]">
            <span class="text-lg md:text-xl">🔥</span>
            <span class="text-lg md:text-xl font-black text-orange-600">{{ streak }}</span>
          </div>

          <!-- Level -->
          <div class="ui-capsule bg-sky-50 border-sky-200 w-auto min-w-[90px] md:min-w-[110px]">
            <span class="text-lg md:text-xl">📈</span>
            <div class="flex flex-col items-start leading-none justify-center">
              <span
                class="text-[9px] md:text-[10px] font-black text-sky-500 uppercase tracking-widest mb-0.5">Level</span>
              <span class="text-base md:text-lg font-black text-sky-700 leading-none">{{ level }}</span>
            </div>
          </div>

          <!-- Score -->
          <div class="ui-capsule bg-indigo-50 border-indigo-200 w-auto min-w-[100px] md:min-w-[120px]">
            <span class="text-lg md:text-xl">🏆</span>
            <div class="flex flex-col items-start leading-none justify-center">
              <span
                class="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Skor</span>
              <span class="text-base md:text-lg font-black text-indigo-700 leading-none">{{ score }}</span>
            </div>
          </div>

          <!-- Actions (Stop & Save) -->
          <div class="flex items-center gap-2 ml-auto">
            <button v-if="session.data" @click="saveState"
              class="ui-capsule-interactive bg-emerald-500 border-emerald-600 text-white w-auto shadow-md hover:bg-emerald-400 hover:-translate-y-1">
              <span class="text-lg md:text-xl">☁️</span>
              <span class="font-black text-sm md:text-base hidden sm:inline">Simpan</span>
            </button>
            <button @click="stopChallenge"
              class="ui-capsule-interactive bg-rose-500 border-rose-600 text-white w-auto shadow-md hover:bg-rose-400 hover:-translate-y-1">
              <span class="text-lg md:text-xl">⏹️</span>
              <span class="font-black text-sm md:text-base hidden sm:inline">Berhenti</span>
            </button>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="w-full pt-1 pb-2 relative">
          <div class="flex items-end justify-between mb-1.5 px-1">
            <span class="text-[10px] md:text-xs font-black text-indigo-400 uppercase tracking-[0.15em]">Progress Level
              {{ level }}</span>
            <span class="text-sm md:text-base font-black text-indigo-600 drop-shadow-sm">{{
              Math.round(progressPercentage) }}%</span>
          </div>
          <div
            class="h-3 md:h-4 bg-indigo-100/80 backdrop-blur-sm rounded-full border border-indigo-200/50 p-[2px] overflow-hidden shadow-inner relative group">
            <!-- Glossy subtle shine -->
            <div
              class="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/40 to-transparent pointer-events-none z-10 rounded-t-full">
            </div>

            <div
              class="h-full bg-linear-to-r from-indigo-400 via-purple-400 to-pink-500 rounded-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] relative shadow-[0_0_12px_rgba(168,85,247,0.4)]"
              :style="{ width: `${progressPercentage}%` }">
              <!-- Animated pulse tip -->
              <div
                class="absolute right-0.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 md:w-3 md:h-3 bg-white rounded-full blur-[2px] animate-pulse">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Learning CTA (When not in challenge) -->
      <div v-else class="flex flex-col items-center justify-center w-full py-2">
        <button @click="startChallenge"
          class="ui-capsule-interactive bg-yellow-400 border-yellow-500 text-yellow-900 py-4 px-8 md:px-12 hover:scale-[1.02] shadow-[0_8px_0_#ca8a04,0_15px_20px_rgba(0,0,0,0.1)] active:shadow-[0_0px_0_#ca8a04,0_0px_0px_rgba(0,0,0,0)] transform active:translate-y-2 transition-all w-full md:w-auto max-w-sm">
          <span class="text-3xl md:text-4xl drop-shadow-md">🎮</span>
          <span class="text-xl md:text-2xl font-black uppercase tracking-tight ml-2">Mulai Tantangan!</span>
        </button>
      </div>
    </div>

    <!-- Instructions / Feedback Area -->
    <div class="shrink-0 text-center h-14 md:h-16 flex items-center justify-center my-2 px-4">
      <transition name="fade" mode="out-in">
        <div v-if="feedback.message" :key="feedback.message"
          class="text-xl md:text-2xl lg:text-3xl font-black drop-shadow-sm transition-all animate-bounce" :class="{
            'text-[#6BCB77]': feedback.type === 'success',
            'text-[#FF6B6B]': feedback.type === 'error',
            'text-slate-600': feedback.type === null
          }">
          {{ feedback.message }}
        </div>
        <h1 v-else class="text-2xl md:text-3xl lg:text-4xl font-black text-slate-600 drop-shadow-sm">Klik huruf untuk
          dengar suara!</h1>
      </transition>
    </div>

    <!-- Alphabet Grid Area -->
    <div class="flex-1 overflow-visible relative px-4 pb-12 w-full max-w-7xl mx-auto custom-scrollbar">
      <div
        class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-9 gap-3 sm:gap-4 lg:gap-5 w-full place-content-start place-items-stretch">
        <button v-for="letter in (isChallengeMode ? challengeLetters : letters)" :key="letter"
          @click="handleLetterClick(letter)"
          class="group relative glass-card flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer w-full aspect-square border-none ring-0 focus:outline-none overflow-hidden rounded-[20%] sm:rounded-3xl"
          :class="[
            getLetterColor(letter),
            wrongLetter === letter ? 'shake-animation bg-red-500 border-4 border-red-800' : 'hover:-translate-y-2 hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)] shadow-[0_8px_20px_-5px_rgba(0,0,0,0.2)]'
          ]">

          <!-- Glossy Top Highlight -->
          <div
            class="absolute top-0 inset-x-0 h-1/3 bg-linear-to-b from-white/60 to-transparent opacity-80 rounded-t-[inherit] pointer-events-none">
          </div>

          <div
            class="flex flex-col items-center justify-center gap-0.5 sm:gap-1 z-10 w-full h-full transition-transform duration-300"
            :class="!isChallengeMode ? 'group-hover:scale-110' : ''">
            <span
              class="text-[2.5rem] sm:text-6xl md:text-7xl lg:text-8xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.15)] leading-none select-none">
              {{ isUpperCase ? letter : letter.toLowerCase() }}
            </span>
            <span v-if="!isChallengeMode"
              class="text-xl sm:text-3xl lg:text-4xl opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300 hidden sm:block absolute bottom-2 xl:bottom-4">
              {{ idLetterMap[letter]?.emoji }}
            </span>
          </div>

          <!-- Bottom Depth Shadow -->
          <div
            class="absolute bottom-0 inset-x-0 h-1/5 bg-linear-to-t from-black/20 to-transparent pointer-events-none rounded-b-[inherit]">
          </div>
          <!-- Internal Border giving it a bubble feel -->
          <div
            class="absolute inset-0 border-[3px] sm:border-[5px] border-white/20 rounded-[inherit] pointer-events-none">
          </div>
        </button>
      </div>

      <!-- Challenge Replay Sound Button Overlay -->
      <div v-if="isChallengeMode" class="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-20 animate-pulse">
        <button @click="playLetterSound(targetLetter)"
          class="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.2)] border-[5px] border-indigo-500 hover:scale-110 hover:bg-indigo-50 transition-all active:scale-95 group">
          <span class="text-3xl md:text-4xl group-hover:scale-110 transition-transform">🔊</span>
        </button>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="fixed top-4 right-4 z-100 flex flex-col gap-3 pointer-events-none">
      <transition-group name="toast">
        <div v-for="toast in toasts" :key="toast.id"
          class="pointer-events-auto min-w-[300px] p-4 rounded-2xl shadow-2xl border-2 flex items-center gap-3 backdrop-blur-md transform transition-all duration-300"
          :class="{
            'bg-green-100/90 border-green-400 text-green-800': toast.type === 'success',
            'bg-red-100/90 border-red-400 text-red-800': toast.type === 'error',
            'bg-blue-100/90 border-blue-400 text-blue-800': toast.type === 'info'
          }">
          <span class="text-2xl">
            <span v-if="toast.type === 'success'">✅</span>
            <span v-else-if="toast.type === 'error'">❌</span>
            <span v-else>ℹ️</span>
          </span>
          <p class="font-bold">{{ toast.message }}</p>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) rotate(5deg);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.shake-animation {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000px;
}

@keyframes shake {

  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}
</style>
