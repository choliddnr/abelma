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

const getLetterColor = (index: number) => colors[index % colors.length]

// Scoring and Challenge State
const score = ref(0)
const level = ref(0)

const router = useRouter()
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const STORAGE_KEY = 'abelma-belajar-huruf-state'

const letterWeights = ref<Record<string, number>>(
  letters.reduce((acc, letter) => {
    acc[letter] = 0
    return acc
  }, {} as Record<string, number>)
)

const targetWeight = computed(()=> {
// if (level.value === 0) return 5
// if (level.value === 1) return 10
return 5

})

const pickNextLetter = (lastLetter: string = '', targetWeight: number = 0): string => {
  const weights = Object.values(letterWeights.value)
  const maxWeight = Math.max(0, ...weights)

  const filteredLetters = letters.filter(l => l !== lastLetter && letterWeights.value[l]! < targetWeight)
  console.log( letterWeights.value, filteredLetters, letterWeights.value[lastLetter]! < targetWeight);

  const priorities = filteredLetters.map(letter => {
    return Math.max(1, maxWeight - (letterWeights.value[letter] || 0) + 1)
  })

  // Weighted random selection
  let randomVal = Math.random() * priorities.reduce((sum, p) => sum + p, 0)
  for (let i = 0; i < filteredLetters.length; i++) {
    randomVal -= priorities[i]!
    if (randomVal <= 0) return filteredLetters[i]!
  }
  return filteredLetters[0]!
}



const checkLevelUp = (): boolean => {
  const minWeight = Math.min(...Object.values(letterWeights.value))


  if (minWeight >= targetWeight.value) {
    level.value++
    letters.forEach(l => letterWeights.value[l] = 0)
    return true
  }
  return false
}
const isChallengeMode = ref(false)
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
  if (level.value >= 1) {
    timeLeft.value = level.value === 1 ? 8 : 3
    timerInterval.value = window.setInterval(() => {
      timeLeft.value--
      if (timeLeft.value <= 0) {
        handleTimeout()
      }
    }, 1000)
  }
}

onUnmounted(() => {
  stopTimer()
  console.log('unmounted');

})

const goBack = () => router.push('/')

// User identity (UUID persisted in localStorage)
// const getUserId = (): string => {
//   const key = 'abelma-user-id'
//   let id = localStorage.getItem(key)
//   if (!id) {
//     id = crypto.randomUUID()
//     localStorage.setItem(key, id)
//   }
//   return id
// }

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
  const audioPath = `/Letter-${letter.toUpperCase()}.webm`
  const audio = new Audio(audioPath)
  audio.play().catch(() => {
    console.warn(`Audio for ${letter} not found. Mocking sound...`)
    const utterance = new SpeechSynthesisUtterance(letter.toLowerCase())
    utterance.lang = 'id-ID' // Bahasa Indonesia
    window.speechSynthesis.speak(utterance)
  })
}

const startChallenge = async () => {
  isChallengeMode.value = true
  await loadState()
  wrongLetter.value = ''
  targetLetter.value = pickNextLetter(targetLetter.value, targetWeight.value)
  feedback.value = { message: 'Dengarkan suara, lalu pilih huruf yang benar!', type: null }
  speak(`Ayo bermain tebak huruf, coba tebak mana huruf ${targetLetter.value}`)
  startTimer()
}

const stopChallenge = () => {
  isChallengeMode.value = false
  wrongLetter.value = ''
  feedback.value = { message: '', type: null }
  stopTimer()
}

const speak = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'id-ID' // Bahasa Indonesia
  window.speechSynthesis.speak(utterance)
}

const handleLetterClick = (letter: string) => {
  if (isChallengeMode.value) {
    if (letter === targetLetter.value) {
      stopTimer()
      score.value += 10
      letterWeights.value[letter] = (letterWeights.value[letter] || 0) + 1

      const leveledUp = checkLevelUp()
      if (leveledUp) {
        feedback.value = { message: `Luar Biasa! Naik Level ${level.value}! 🌟`, type: 'success' }
      } else {
        feedback.value = { message: 'Hebat! Kamu Benar! 🎉', type: 'success' }
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
          targetLetter.value = nextLetter
          feedback.value = { message: 'Dengarkan suara, lalu pilih huruf yang benar!', type: null }
          startTimer()
        }
      }, leveledUp ? 3500 : 2000)
    } else {
      score.value -= 5
      letterWeights.value[targetLetter.value] = (letterWeights.value[targetLetter.value] || 0) - 0.5
      letterWeights.value[letter] = (letterWeights.value[letter] || 0) - 0.5
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
  }
}
</script>

<template>
  <div class="h-[90vh] flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center justify-between shrink-0">
      <button @click="goBack" class="btn-bubble bg-white px-6 py-2 text-xl font-bold border-2">
        ← Kembali
      </button>

      <div v-if="isChallengeMode" class="flex items-center gap-6">
        <div v-if="level >= 1" class="glass-card px-6 py-2 bg-red-100 flex items-center gap-2 border-2 transition-colors" :class="timeLeft <= 3 ? 'border-red-500 animate-pulse bg-red-200' : 'border-red-300'">
           <span class="text-xl font-bold" :class="timeLeft <= 3 ? 'text-red-700' : 'text-red-600'">⏱️ {{ timeLeft }}s</span>
        </div>
        <div class="glass-card px-8 py-1 bg-white flex flex-col items-center">
          <span class="text-sm font-bold text-gray-400 -mb-1">Level <span class="text-[#4D96FF]">{{ level }}</span></span>
          <div class="flex items-baseline gap-2">
            <span class="text-xl font-black text-gray-500">Skor:</span>
            <span class="text-3xl font-black text-secondary">{{ score }}</span>
          </div>
        </div>
        <button @click="stopChallenge" class="btn-accent bg-red-600 hover:bg-red-500 px-6 py-2">Berhenti Main</button>
        <button
          v-if="session.data"
          @click="saveState"
          class="btn-accent px-6 py-2 bg-emerald-600 hover:bg-emerald-500"
        >
          <span>☁️</span> Simpan ke Cloud
        </button>
      </div>

      <div v-else class="flex items-center gap-4">
        <button @click="startChallenge" class="btn-primary flex items-center gap-3 shadow-lg">
          <span>🎮</span> Main Tebak Huruf
        </button>

      </div>

      <div class="w-2 hidden md:block"></div>
    </div>

    <!-- Instructions / Feedback Area -->
    <div class="shrink-0 text-center h-16 flex items-center justify-center">
      <transition name="fade" mode="out-in">
        <div
          v-if="feedback.message"
          :key="feedback.message"
          class="text-2xl font-black drop-shadow-sm transition-all animate-bounce"
          :class="{
            'text-[#6BCB77]': feedback.type === 'success',
            'text-[#FF6B6B]': feedback.type === 'error',
            'text-[#5C4D00]': feedback.type === null
          }"
        >
          {{ feedback.message }}
        </div>
        <h1 v-else class="text-3xl md:text-4xl font-black text-[#5C4D00]">Klik huruf untuk dengar suara!</h1>
      </transition>
    </div>

    <!-- Alphabet Grid -->
    <div class="flex-1 overflow-visible relative">
      <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-3 h-full pb-8">
        <button
          v-for="(letter, index) in letters"
          :key="letter"
          @click="handleLetterClick(letter)"
          class="glass-card flex items-center justify-center text-4xl md:text-6xl font-black transition-all duration-300 active:scale-90 hover:shadow-lg cursor-pointer h-full max-h-46 max-w-46 border-none ring-0 focus:outline-none"
          :class="[
            getLetterColor(index),
            wrongLetter === letter ? 'shake-animation bg-[#FF6B6B] text-white border-4 border-red-800' : 'hover:scale-105'
          ]"
        >
          <span class="text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.1)]">
            {{ letter }}
          </span>
        </button>
      </div>

      <!-- Challenge Button Overlay (when in challenge mode and need to replay sound) -->
      <div v-if="isChallengeMode" class="absolute bottom-4 right-4 animate-pulse">
        <button @click="playLetterSound(targetLetter)" class="btn-bubble bg-white p-4 shadow-xl border-4 border-[#4D96FF]">
          <span class="text-4xl">🔊</span>
        </button>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="fixed top-4 right-4 z-100 flex flex-col gap-3 pointer-events-none">
      <transition-group name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto min-w-[300px] p-4 rounded-2xl shadow-2xl border-2 flex items-center gap-3 backdrop-blur-md transform transition-all duration-300"
          :class="{
            'bg-green-100/90 border-green-400 text-green-800': toast.type === 'success',
            'bg-red-100/90 border-red-400 text-red-800': toast.type === 'error',
            'bg-blue-100/90 border-blue-400 text-blue-800': toast.type === 'info'
          }"
        >
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
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>
