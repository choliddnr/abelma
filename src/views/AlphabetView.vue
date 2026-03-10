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
const level = ref(0)
const streak = ref(0)
const maxStreak = ref(0)
const speaking = ref(false)

const router = useRouter()
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const challengeLetters = ref([...letters])
const STORAGE_KEY = 'abelma-belajar-huruf-state'

const shuffleLetters = () => {
  const array = [...letters]
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
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
  const maxTotalWeight = targetWeight.value * allLetters.length
  return Math.min(100, Math.max(0, (currentTotalWeight / maxTotalWeight) * 100))
})

const pickNextLetter = (lastLetter: string = '', targetWeight: number = 0): string => {
  const allLetters = [...letters, ...letters.map(l => l.toLowerCase())]
  const weights = Object.values(letterWeights.value)
  const maxWeight = Math.max(0, ...weights)

  const filteredLetters = allLetters.filter(l => l !== lastLetter && (letterWeights.value[l] || 0) < targetWeight)
  
  if (filteredLetters.length === 0) return allLetters[0]

  const priorities = filteredLetters.map(letter => {
    return Math.max(1, maxWeight - (letterWeights.value[letter] || 0) + 1)
  })

  // Weighted random selection
  let randomVal = Math.random() * priorities.reduce((sum, p) => sum + p, 0)
  for (let i = 0; i < filteredLetters.length; i++) {
    randomVal -= priorities[i]!
    if (randomVal <= 0) {
      const picked = filteredLetters[i]!
      // Update the UI state based on the picked letter's case
      isUpperCase.value = picked === picked.toUpperCase()
      return picked
    }
  }
  return filteredLetters[0]!
}



const checkLevelUp = (): boolean => {
  const allLetters = [...letters, ...letters.map(l => l.toLowerCase())]
  const minWeight = Math.min(...allLetters.map(l => letterWeights.value[l] || 0))

  if (minWeight >= targetWeight.value) {
    level.value++
    allLetters.forEach(l => letterWeights.value[l] = 0)
    return true
  }
  return false
}
const isChallengeMode = ref(false)
const isUpperCase = ref(true)
const targetLetter = ref('')
const feedback = ref<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null })
const wrongLetter = ref('') // Track the last wrong letter for animation

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
  feedback.value = { message: 'Waktu habis! Memuat huruf baru...', type: 'error' }
  speak('Waktu habis. Dengarkan suara, lalu pilih huruf yang benar!')
  wrongLetter.value = targetLetter.value

  setTimeout(() => {
    wrongLetter.value = ''
    if (isChallengeMode.value) {
      if (level.value >= 1) shuffleLetters()
      targetLetter.value = nextLetter
      feedback.value = { message: 'Dengarkan suara, lalu pilih huruf yang benar!', type: null }
      playLetterSound(targetLetter.value)
      startTimer()
    }
  }, 2000)
}

const startTimer = () => {
  stopTimer()
  if (level.value >= 2) {
    timeLeft.value = level.value === 2 ? 8 : 3
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
      if (typeof data.level === 'number') level.value = data.level
      if (data.weights) {
        Object.assign(letterWeights.value, data.weights)
        initializeWeights() // Ensure any new letters (cases) are added
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
        if (typeof data.level === 'number') level.value = data.level
        if (data.weights) {
          Object.assign(letterWeights.value, data.weights)
          initializeWeights() // Ensure any new letters (cases) are added
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
  loadState()
})

watch([score, level, letterWeights], () => {
  saveToLocal()
}, { deep: true })

const playLetterSound = (letter: string) => {
  speaking.value = true
  const audioPath = `/Letter-${letter.toUpperCase()}.webm`
  const audio = new Audio(audioPath)

  audio.addEventListener('ended', () => {
    speaking.value = false
  })

  audio.play().catch(() => {
    console.warn(`Audio for ${letter} not found. Mocking sound...`)
    const utterance = new SpeechSynthesisUtterance(letter.toLowerCase())
    utterance.lang = 'id-ID' // Bahasa Indonesia
    utterance.onend = () => {
      speaking.value = false
    }
    window.speechSynthesis.speak(utterance)
  })
}

const startChallenge = async () => {
  isChallengeMode.value = true
  await loadState()
  wrongLetter.value = ''
  if (level.value >= 1) shuffleLetters()
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
  if (speaking.value) return
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
          if (level.value >= 1) shuffleLetters()
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
  <div class="h-[90vh] flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center justify-between shrink-0 mb-6 px-4">
      <button @click="goBack"
        class="ui-capsule-interactive bg-white border-gray-200 text-gray-700 min-w-[140px]">
        <span class="text-xl">🏠</span>
        <span class="font-black">Kembali</span>
      </button>

      <div v-if="isChallengeMode" class="flex items-center gap-3">
        <!-- Timer -->
        <div v-if="level >= 1"
          class="ui-capsule bg-red-100 border-red-400 min-w-[110px]"
          :class="{ 'animate-pulse bg-red-200 border-red-500': timeLeft <= 3 }">
          <span class="text-xl">⏱️</span>
          <span class="text-xl font-black text-red-700">{{ timeLeft }}s</span>
        </div>
        
        <!-- Streak -->
        <div v-if="streak >= 2" class="ui-capsule bg-orange-100 border-orange-400 animate-bounce min-w-[90px]">
          <span class="text-xl">🔥</span>
          <span class="text-xl font-black text-orange-600">{{ streak }}</span>
        </div>

        <!-- Level -->
        <div class="ui-capsule bg-blue-50 border-blue-300 min-w-[120px]">
          <span class="text-xl">📈</span>
          <div class="flex flex-col items-start leading-tight">
            <span class="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Level</span>
            <span class="text-lg font-black text-blue-700">{{ level }}</span>
          </div>
        </div>

        <!-- Score -->
        <div class="ui-capsule bg-indigo-50 border-indigo-300 min-w-[130px]">
          <span class="text-xl">🏆</span>
          <div class="flex flex-col items-start leading-tight">
            <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Skor</span>
            <span class="text-lg font-black text-indigo-700">{{ score }}</span>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex items-center gap-3 ml-2">
          <button @click="stopChallenge"
            class="ui-capsule-interactive bg-red-500 border-red-700 text-white min-w-[120px]">
             <span class="font-black">Berhenti</span>
          </button>

          <button v-if="session.data" @click="saveState"
            class="ui-capsule-interactive bg-emerald-500 border-emerald-700 text-white min-w-[120px]">
            <span class="text-xl">☁️</span>
            <span class="font-black">Simpan</span>
          </button>
        </div>
      </div>

      <!-- Level Progress Bar -->
      <div v-if="isChallengeMode" class="w-full max-w-2xl mx-auto mt-4 px-4 overflow-visible">
        <div class="flex items-center justify-between mb-1">
          <span class="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Kemajuan Belajar</span>
          <span class="text-sm font-black text-indigo-600">{{ Math.round(progressPercentage) }}%</span>
        </div>
        <div class="h-4 bg-indigo-100 rounded-full border-2 border-indigo-200 p-0.5 overflow-hidden shadow-inner relative group">
          <!-- Glossy shine -->
          <div class="absolute inset-0 bg-linear-to-b from-white/20 to-transparent pointer-events-none z-10 rounded-full"></div>
          
          <div class="h-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out relative shadow-[0_0_10px_rgba(99,102,241,0.5)]"
            :style="{ width: `${progressPercentage}%` }">
            <!-- Animated pulse for the tip -->
            <div class="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full blur-xs animate-pulse"></div>
          </div>
        </div>
      </div>

      <div v-else class="flex items-center gap-4">
        <button @click="startChallenge"
          class="ui-capsule-interactive bg-primary border-[#CCAD31] text-[#634E00] py-4 px-10">
          <span class="text-3xl">🎮</span>
          <span class="text-2xl font-black uppercase tracking-tight">Main Tebak Huruf</span>
        </button>
        
        <div v-if="session.data" class="hidden md:flex flex-col items-start text-gray-400">
          <span class="text-[10px] font-black uppercase tracking-widest">Cloud Sync Aktif</span>
          <span class="text-xs">Kemajuanmu aman! ☁️</span>
        </div>

        <!-- Case Toggle Button -->
        <button @click="isUpperCase = !isUpperCase"
          class="ui-capsule-interactive bg-white border-gray-200 text-gray-700 min-w-[100px] hover:bg-gray-50">
          <span class="text-xl">{{ isUpperCase ? 'abc' : 'ABC' }}</span>
          <span class="font-black">{{ isUpperCase ? 'Kecil' : 'Besar' }}</span>
        </button>
      </div>
    </div>

    <!-- Instructions / Feedback Area -->
    <div class="shrink-0 text-center h-16 flex items-center justify-center">
      <transition name="fade" mode="out-in">
        <div v-if="feedback.message" :key="feedback.message"
          class="text-2xl font-black drop-shadow-sm transition-all animate-bounce" :class="{
            'text-[#6BCB77]': feedback.type === 'success',
            'text-[#FF6B6B]': feedback.type === 'error',
            'text-[#5C4D00]': feedback.type === null
          }">
          {{ feedback.message }}
        </div>
        <h1 v-else class="text-3xl md:text-4xl font-black text-[#5C4D00]">Klik huruf untuk dengar suara!</h1>
      </transition>
    </div>

    <!-- Alphabet Grid -->
    <div class="flex-1 overflow-visible relative">
      <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-4 h-full pb-8">
        <button v-for="letter in (isChallengeMode ? challengeLetters : letters)" :key="letter" @click="handleLetterClick(letter)"
          class="group relative glass-card flex items-center justify-center transition-all duration-300 active:scale-90 cursor-pointer h-full max-h-46 max-w-46 border-none ring-0 focus:outline-none overflow-hidden"
          :class="[
            getLetterColor(letter),
            wrongLetter === letter ? 'shake-animation bg-red-500 border-4 border-red-800' : 'hover:scale-110 shadow-lg'
          ]">
          <!-- Shiny background effect -->
          <div
            class="absolute inset-0 bg-linear-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          </div>

          <div class="flex flex-col items-center gap-1 z-10 transition-transform duration-300"
            :class="!isChallengeMode ? 'group-hover:scale-110' : ''">
            <span class="text-4xl md:text-7xl font-black text-white drop-shadow-[0_6px_0_rgba(0,0,0,0.1)]">
              {{ isUpperCase ? letter : letter.toLowerCase() }}
            </span>
            <span v-if="!isChallengeMode"
              class="text-2xl md:text-4xl opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0 duration-300">
              {{ idLetterMap[letter]?.emoji }}
            </span>
          </div>

          <!-- Decorative border -->
          <div class="absolute inset-0 border-4 border-white/20 rounded-[inherit] pointer-events-none"></div>
        </button>
      </div>

      <!-- Challenge Button Overlay (when in challenge mode and need to replay sound) -->
      <div v-if="isChallengeMode" class="absolute bottom-4 right-4 animate-pulse">
        <button @click="playLetterSound(targetLetter)" class="btn-bubble bg-white p-4 shadow-xl border-4 border-accent">
          <span class="text-4xl">🔊</span>
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
