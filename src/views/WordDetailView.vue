<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { wordCategories } from '@/data/words'
import confetti from 'canvas-confetti'
import { wordSettings } from '@/utils/wordSettings'
import { playSyllableAudio, playWordAudio } from '@/utils/audio'

const route = useRoute()
const router = useRouter()

const categoryId = route.params.category as string
const wordId = route.params.word as string

const wordData = computed(() => {
  const category = wordCategories.find(c => c.id === categoryId)
  if (!category) return null
  return category.words.find(w => w.id === wordId) || null
})

const goBack = () => router.push('/words/learn')
const goExercise = () => router.push(`/words/${categoryId}/${wordId}/exercise`)

const speaking = ref(false)
const activeSyllableIndex = ref<number | null>(null)
let autoPlayTimeout: number | null = null

const fallbackToSpeech = async (text: string, path?: string, onEnd?: () => void) => {
  speaking.value = true
  await playWordAudio(text, path)
  speaking.value = false
  if (onEnd) onEnd()
}

const playSyllable = async (syllable: string, index: number) => {
  if (speaking.value) return
  activeSyllableIndex.value = index
  await playSyllableAudio(syllable, `/audio/syllables/${syllable.toLowerCase()}.mp3`)
  activeSyllableIndex.value = null
}

const playFullWord = () => {
  if (speaking.value || !wordData.value) return
  fallbackToSpeech(wordData.value.word, `/audio/words/${wordData.value.id}.mp3`)
}

const playAuto = async () => {
  if (speaking.value || !wordData.value) return

  const syllables = wordData.value.syllables

  const playNext = (index: number) => {
    if (index >= syllables.length) {
      // Finished syllables, play full word and pop confetti
      activeSyllableIndex.value = null
      autoPlayTimeout = window.setTimeout(() => {
        fallbackToSpeech(wordData.value!.word, `/audio/words/${wordData.value?.id}.mp3`, () => {
          popConfettiCenter()
        })
      }, 500)
      return
    }

    activeSyllableIndex.value = index
    fallbackToSpeech(syllables[index] || "", undefined, () => {
      autoPlayTimeout = window.setTimeout(() => {
        playNext(index + 1)
      }, 400) // slight pause between syllables
    })
  }

  playNext(0)
}

const popConfettiCenter = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#FFD93D', '#6BCB77', '#4D96FF', '#ff9a9a', '#A084E8'],
    zIndex: 100
  })
}

onUnmounted(() => {
  window.speechSynthesis.cancel()
  if (autoPlayTimeout) clearTimeout(autoPlayTimeout)
})

onMounted(() => {
  if (!wordData.value) {
    router.replace('/words') // handle invalid route
  } else {
    // Optional: Auto-play full word on load
    // playFullWord()
  }
})

// Colors for alternating syllables
const syllableColors = ['bg-[#FFD93D]', 'bg-[#4D96FF]', 'bg-[#6BCB77]', 'bg-[#ff9a9a]']
const getSyllableColor = (index: number) => syllableColors[index % syllableColors.length]
</script>

<template>
  <div v-if="wordData" class="flex flex-col gap-4 min-h-screen">
    <!-- Header (Animated) -->
    <div class="flex items-center justify-between shrink-0 px-4 pt-4 pb-2 animate-entrance">
      <button @click="goBack"
        class="ui-capsule-interactive bg-white border-slate-200 text-slate-700 w-auto hover:bg-slate-50">
        <span class="text-xl md:text-2xl">🔙</span>
        <span class="font-black text-sm md:text-base hidden sm:inline">Kembali</span>
      </button>

      <button @click="goExercise"
        class="ui-capsule-interactive bg-emerald-500 border-emerald-600 text-white w-auto shadow-lg shadow-emerald-200">
        <span class="text-xl md:text-2xl font-black">🧩</span>
        <span class="font-black text-sm md:text-base hidden sm:inline">Latihan Mengeja</span>
      </button>
    </div>

    <!-- Main Content -->
    <div class="flex-1 px-4 flex flex-col items-center justify-center max-w-4xl mx-auto w-full gap-8 md:gap-12 py-8">

      <!-- Top Section: Image & Full Word (Animated) -->
      <div class="flex flex-col items-center gap-6 w-full relative animate-entrance" style="animation-delay: 0.2s;">
        <!-- Giant Emoji -->
        <button @click="playFullWord"
          class="relative w-48 h-48 md:w-64 md:h-64 rounded-[3rem] bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border-4 border-white flex items-center justify-center transition-all active:scale-95 group hover:scale-105">
          <span
            class="text-8xl md:text-[140px] drop-shadow-xl select-none group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
            {{ wordData.emoji }}
          </span>
          <!-- Replay Icon Overlay -->
          <div
            class="absolute -bottom-4 -right-4 w-16 h-16 bg-white rounded-full shadow-lg border-4 border-indigo-50 flex items-center justify-center text-3xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
            🔊
          </div>
        </button>
      </div>

      <!-- Bottom Section: Syllables -->
      <div class="w-full flex flex-col items-center gap-6">

        <!-- Controls -->
        <div class="flex justify-center w-full">
          <button @click="playAuto" :disabled="speaking"
            class="ui-capsule-interactive bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 w-auto disabled:opacity-50"
            title="Baca Otomatis">
            <span class="text-2xl md:text-3xl">▶️</span>
            <span class="font-black text-lg md:text-xl">Baca Otomatis</span>
          </button>
        </div>

        <!-- Syllable Boxes (Animated Grid) -->
        <div class="flex flex-wrap justify-center gap-4 w-full">
          <button v-for="(syllable, index) in wordData.syllables" :key="index" @click="playSyllable(syllable, index)"
            class="relative glass-card px-8 py-6 md:px-12 md:py-8 rounded-3xl transition-all duration-300 active:scale-95 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.2)] border-x-4 border-t-4 border-white overflow-hidden animate-entrance"
            :class="[
              getSyllableColor(index),
              activeSyllableIndex === index ? 'scale-110 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.4)] ring-6 ring-white z-10 brightness-110' : 'hover:-translate-y-3 hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)]'
            ]"
            :style="{ animationDelay: `${0.4 + (index * 0.1)}s` }">

            <!-- Glossy Top Highlight -->
            <div
              class="absolute top-0 inset-x-0 h-1/2 bg-linear-to-b from-white/40 to-transparent opacity-80 rounded-t-[inherit] pointer-events-none">
            </div>

            <span
              class="text-5xl md:text-7xl font-black text-white drop-shadow-[0_6px_0_rgba(0,0,0,0.15)] tracking-widest relative z-10"
              style="font-family: 'Quicksand', sans-serif;">
              {{ wordSettings.letterCase === 'uppercase' ? syllable.toUpperCase() : syllable.toLowerCase() }}
            </span>

            <!-- Bottom Depth (3D effect) -->
            <div
              class="absolute bottom-0 inset-x-0 h-1/5 bg-black/10 pointer-events-none rounded-b-[inherit]">
            </div>
          </button>
        </div>

      </div>

    </div>
  </div>
</template>
