<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const wordId = route.params.id as string

const words = [
  { id: 'apel', name: 'Apel', icon: '🍎', syllables: ['A', 'pel'], color: 'bg-[#FF6B6B]' },
  { id: 'pisang', name: 'Pisang', icon: '🍌', syllables: ['Pi', 'sang'], color: 'bg-[#FFD93D]' },
  { id: 'jeruk', name: 'Jeruk', icon: '🍊', syllables: ['Je', 'ruk'], color: 'bg-[#FFD93D]' },
  { id: 'roti', name: 'Roti', icon: '🍞', syllables: ['Ro', 'ti'], color: 'bg-[#A084E8]' },
  { id: 'susu', name: 'Susu', icon: '🥛', syllables: ['Su', 'su'], color: 'bg-[#4D96FF]' },
  { id: 'meja', name: 'Meja', icon: '🪑', syllables: ['Me', 'ja'], color: 'bg-[#A084E8]' },
  { id: 'buku', name: 'Buku', icon: '📚', syllables: ['Bu', 'ku'], color: 'bg-[#6BCB77]' },
  { id: 'bola', name: 'Bola', icon: '⚽', syllables: ['Bo', 'la'], color: 'bg-[#4D96FF]' },
  { id: 'makan', name: 'Makan', icon: '😋', syllables: ['Ma', 'kan'], color: 'bg-[#6BCB77]' },
  { id: 'lari', name: 'Lari', icon: '🏃', syllables: ['La', 'ri'], color: 'bg-[#4D96FF]' },
  { id: 'tidur', name: 'Tidur', icon: '😴', syllables: ['Ti', 'dur'], color: 'bg-[#A084E8]' },
  { id: 'sapu', name: 'Sapu', icon: '🧹', syllables: ['Sa', 'pu'], color: 'bg-[#6BCB77]' },
]

const currentWord = computed(() => words.find(w => w.id === wordId))

const speakSyllable = (syllable: string) => {
  const utterance = new SpeechSynthesisUtterance(syllable.toLowerCase())
  utterance.lang = 'id-ID'
  utterance.rate = 0.8
  window.speechSynthesis.speak(utterance)
}

const speakFullWord = () => {
  if (!currentWord.value) return
  const utterance = new SpeechSynthesisUtterance(currentWord.value.name.toLowerCase())
  utterance.lang = 'id-ID'
  window.speechSynthesis.speak(utterance)
}

const goBack = () => router.push('/1/learn')

const activeSyllable = ref('')

const handleSyllableClick = (s: string) => {
  activeSyllable.value = s
  speakSyllable(s)
  setTimeout(() => {
    activeSyllable.value = ''
  }, 300)
}
</script>

<template>
  <div v-if="currentWord" class="h-[90vh] flex flex-col items-center gap-12">
    <div class="w-full flex justify-start">
      <button @click="goBack" class="btn-bubble bg-white px-6 py-2 text-xl font-bold border-2">
        ← Kembali
      </button>
    </div>

    <div class="glass-card p-12 w-full max-w-4xl flex flex-col items-center gap-12">
      <!-- Icon -->
      <div
        class="text-[150px] md:text-[200px] w-64 h-64 md:w-80 md:h-80 flex items-center justify-center rounded-full border-8 border-white shadow-xl transition-all duration-500 hover:rotate-6 cursor-pointer"
        :class="currentWord.color"
        @click="speakFullWord"
      >
        {{ currentWord.icon }}
      </div>

      <!-- Word Display -->
      <div class="flex flex-col items-center gap-8">
        <h2 class="text-4xl font-bold text-gray-400 tracking-[0.2em] uppercase">
          {{ currentWord.name.split('').join(' ') }}
        </h2>

        <!-- Syllables -->
        <div class="flex gap-4">
          <button
            v-for="(s, index) in currentWord.syllables"
            :key="index"
            @click="handleSyllableClick(s)"
            class="btn-bubble px-10 py-6 text-5xl md:text-7xl font-black text-white hover:scale-110 active:scale-95 transition-all relative overflow-hidden group"
            :class="[
              currentWord.color,
              activeSyllable === s ? 'ring-8 ring-white' : ''
            ]"
          >
            <!-- Sparkle/Shine effect -->
            <div class="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 slant"></div>
            {{ s }}
          </button>
        </div>
      </div>
    </div>

    <button @click="speakFullWord" class="btn-primary flex items-center gap-4 px-12 py-6 text-3xl">
      <span>🔊</span> Dengar Kata
    </button>
  </div>
  <div v-else class="text-center py-20">
    <h1 class="text-4xl font-bold">Kata tidak ditemukan</h1>
    <button @click="goBack" class="btn-primary mt-8">Kembali</button>
  </div>
</template>

<style scoped>
.slant {
  transform: skewX(-20deg);
}
</style>
