<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import BubbleCard from '@/components/BubbleCard.vue'
import { letters, idLetterMap, getLetterColor } from '@/constants/alphabet'
import { useAlphabetAudio } from '@/composables/useAlphabetAudio'
import confetti from 'canvas-confetti'

const emit = defineEmits(['start-challenge'])

const { speaking, playLetterSound } = useAlphabetAudio()

const isUpperCase = ref(true)
const isRandomized = ref(false)
const learningLetters = ref([...letters])
const feedback = ref('')

const shuffleLetters = (arrayToShuffle: string[]) => {
  const array = [...arrayToShuffle]
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i]
    array[i] = array[j]!
    array[j] = temp!
  }
  return array
}

const toggleRandomize = () => {
  isRandomized.value = !isRandomized.value
  if (isRandomized.value) {
    learningLetters.value = shuffleLetters(learningLetters.value)
  } else {
    learningLetters.value = [...letters]
  }
}

// Auto Play Logic
const isAutoPlaying = ref(false)
const autoPlayIndex = ref(0)
const autoPlayTimeout = ref<number | null>(null)

const toggleAutoPlay = () => {
  if (isAutoPlaying.value) {
    stopAutoPlay()
  } else {
    startAutoPlay()
  }
}

const startAutoPlay = () => {
  isAutoPlaying.value = true
  autoPlayIndex.value = 0
  const firstLetter = learningLetters.value[0]
  if (firstLetter) {
    handleLetterClick(firstLetter)
  }
}

const stopAutoPlay = () => {
  isAutoPlaying.value = false
  if (autoPlayTimeout.value) {
    clearTimeout(autoPlayTimeout.value)
    autoPlayTimeout.value = null
  }
}

watch(speaking, (newVal) => {
  if (!newVal && isAutoPlaying.value) {
    autoPlayTimeout.value = window.setTimeout(() => {
      autoPlayIndex.value++
      if (autoPlayIndex.value >= learningLetters.value.length) {
        stopAutoPlay()
      } else {
        const nextLetter = learningLetters.value[autoPlayIndex.value]
        if (nextLetter) {
          handleLetterClick(nextLetter)
        }
      }
    }, 1000)
  }
})

const popConfetti = (e: Event) => {
  const target = e.currentTarget as HTMLElement
  if (!target) return
  const rect = target.getBoundingClientRect()
  const x = (rect.left + rect.width / 2) / window.innerWidth
  const y = (rect.top + rect.height / 2) / window.innerHeight
  confetti({
    particleCount: 30,
    spread: 30,
    origin: { x, y },
    colors: ['#FFD93D', '#6BCB77', '#4D96FF', '#ff9a9a', '#A084E8'],
    ticks: 50,
    gravity: 0.8,
    scalar: 0.8,
    zIndex: 100
  })
}

const handleLetterClick = (letter: string, event?: Event) => {
  if (event) popConfetti(event)
  playLetterSound(letter, true)
  
  // Visual feedback
  const detail = idLetterMap[letter]
  feedback.value = `${letter} untuk ${detail?.word || ''} ${detail?.emoji || ''}`
  
  setTimeout(() => {
    feedback.value = ''
  }, 2000)
}

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<template>
  <div class="flex flex-col gap-4 animate-entrance">
    <!-- Learning Dashboard -->
    <div class="shrink-0 px-4 flex flex-col items-center justify-center min-h-[80px]">
      <div
        class="flex flex-wrap items-center justify-center gap-3 md:gap-4 bg-white/30 backdrop-blur-lg p-3 md:p-4 rounded-4xl border-4 border-slate-50 shadow-xl"
        style="box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05), inset 0 2px 4px 0 rgba(255, 255, 255, 0.5)">

        <!-- Case Toggle -->
        <button @click="isUpperCase = !isUpperCase"
          class="ui-capsule-interactive bg-white border-slate-200 text-slate-700 w-auto hover:bg-slate-50"
          title="Ganti Huruf Besar/Kecil">
          <span class="text-xl md:text-2xl font-black">{{ isUpperCase ? 'abc' : 'ABC' }}</span>
          <span class="font-black text-sm md:text-base hidden sm:inline ml-1">{{ isUpperCase ? 'Kecil' : 'Besar' }}</span>
        </button>

        <!-- Randomize -->
        <button @click="toggleRandomize" class="ui-capsule-interactive w-auto border-slate-200"
          :class="isRandomized ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-white text-slate-700'">
          <span class="text-xl md:text-2xl">🎲</span>
          <span class="font-black text-sm md:text-base hidden sm:inline ml-1">{{ isRandomized ? 'Normal' : 'Acak' }}</span>
        </button>

        <!-- Auto Play -->
        <button @click="toggleAutoPlay" class="ui-capsule-interactive w-auto border-slate-200"
          :class="isAutoPlaying ? 'bg-indigo-100 text-indigo-700 border-indigo-300' : 'bg-white text-slate-700'">
          <span class="text-xl md:text-2xl">{{ isAutoPlaying ? '⏹️' : '▶️' }}</span>
          <span class="font-black text-sm md:text-base hidden sm:inline ml-1">{{ isAutoPlaying ? 'Berhenti' : 'Otomatis' }}</span>
        </button>

        <div class="w-px h-8 bg-slate-200 hidden md:block mx-1"></div>

        <!-- Start Challenge CTA -->
        <button @click="emit('start-challenge')"
          class="ui-capsule-interactive bg-yellow-400 border-yellow-500 text-yellow-900 py-2 px-6 hover:scale-105 shadow-[0_4px_0_#ca8a04] active:shadow-none active:translate-y-1 transition-all">
          <span class="text-2xl md:text-3xl drop-shadow-sm">🎮</span>
          <span class="text-lg md:text-xl font-black uppercase tracking-tight ml-2">Mulai Tantangan!</span>
        </button>
      </div>
    </div>

    <!-- Instructions / Feedback Area -->
    <div class="shrink-0 text-center h-14 md:h-16 flex items-center justify-center my-2 px-4">
      <transition name="fade" mode="out-in">
        <div v-if="feedback" :key="feedback"
          class="text-xl md:text-2xl lg:text-3xl font-black text-slate-600 drop-shadow-sm animate-bounce">
          {{ feedback }}
        </div>
        <h1 v-else class="text-2xl md:text-3xl lg:text-4xl font-black text-slate-600 drop-shadow-sm">Klik huruf untuk dengar suara!</h1>
      </transition>
    </div>

    <!-- Alphabet Grid -->
    <div class="flex-1 px-4 pb-12 w-full max-w-7xl mx-auto overflow-visible">
      <div class="grid grid-cols-[repeat(auto-fit,minmax(70px,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(90px,1fr))] md:grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-3 sm:gap-4 lg:gap-5 w-full place-content-center">
        <BubbleCard v-for="(letter, index) in learningLetters" :key="letter"
          as="button" @click="handleLetterClick(letter, $event)"
          class="group cursor-pointer w-full aspect-square border-none rounded-[20%] sm:rounded-3xl transition-all duration-300 animate-entrance"
          :class="[
            getLetterColor(letter),
            (isAutoPlaying && index === autoPlayIndex) ? 'scale-110 shadow-2xl ring-4 ring-white z-20' : 'hover:-translate-y-2 hover:shadow-xl shadow-md'
          ]" :style="{ animationDelay: `${index * 0.05}s` }">

          <div class="flex flex-col items-center justify-center gap-0.5 sm:gap-1 w-full h-full relative">
            <span class="text-[2.5rem] sm:text-6xl md:text-7xl lg:text-8xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.15)] select-none font-quicksand">
              {{ isUpperCase ? letter : letter.toLowerCase() }}
            </span>
            <span class="text-xl sm:text-3xl lg:text-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block absolute bottom-2 xl:bottom-4">
              {{ idLetterMap[letter]?.emoji }}
            </span>
          </div>
        </BubbleCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.animate-entrance {
  animation: entrance 0.5s ease-out forwards;
}

@keyframes entrance {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
