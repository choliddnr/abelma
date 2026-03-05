<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const colors = [
  'bg-[#FFD93D]', // Yellow
  'bg-[#6BCB77]', // Green
  'bg-[#4D96FF]', // Blue
  'bg-[#FF6B6B]', // Pink
  'bg-[#A084E8]', // Purple
]

const getLetterColor = (index: number) => colors[index % colors.length]

// Scoring and Challenge State
const score = ref(0)
const isChallengeMode = ref(false)
const targetLetter = ref('')
const feedback = ref<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null })
const wrongLetter = ref('') // Track the last wrong letter for animation

const goBack = () => router.push('/')

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

const startChallenge = () => {
  isChallengeMode.value = true
  wrongLetter.value = ''
  const randomIndex = Math.floor(Math.random() * letters.length)
  targetLetter.value = letters[randomIndex] ?? ''
  feedback.value = { message: 'Dengarkan suara, lalu pilih huruf yang benar!', type: null }
  playLetterSound(targetLetter.value)
}

const stopChallenge = () => {
  isChallengeMode.value = false
  wrongLetter.value = ''
  feedback.value = { message: '', type: null }
}

const speak = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'id-ID' // Bahasa Indonesia
  window.speechSynthesis.speak(utterance)
}

const handleLetterClick = (letter: string) => {
  if (isChallengeMode.value) {
    if (letter === targetLetter.value) {
      score.value += 10
      feedback.value = { message: 'Hebat! Kamu Benar! 🎉', type: 'success' }
      wrongLetter.value = ''

      const nextIndex = Math.floor(Math.random() * letters.length)
      const nextLetter = letters[nextIndex] ?? ''

      speak(`Benar, Sekarang tebak huruf ${nextLetter}`)

      setTimeout(() => {
        if (isChallengeMode.value) {
          targetLetter.value = nextLetter
          feedback.value = { message: 'Dengarkan suara, lalu pilih huruf yang benar!', type: null }
        }
      }, 2000)
    } else {
      score.value = Math.max(0, score.value - 5)
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
        <div class="glass-card px-8 py-2 bg-white flex items-center gap-4">
          <span class="text-2xl font-black text-gray-500">Skor:</span>
          <span class="text-4xl font-black text-[#6BCB77]">{{ score }}</span>
        </div>
        <button @click="stopChallenge" class="btn-accent px-6 py-2">Berhenti Main</button>
      </div>

      <div v-else>
        <button @click="startChallenge" class="btn-primary flex items-center gap-3">
          <span>🎮</span> Main Tebak Huruf
        </button>
      </div>

      <div class="w-32 hidden md:block"></div>
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
    <div class="flex-1 overflow-hidden relative">
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
  </div>
</template>

<style scoped>
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
