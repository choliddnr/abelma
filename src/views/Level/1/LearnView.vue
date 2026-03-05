<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import SpellingChallenge from '@/components/SpellingChallenge.vue'

const router = useRouter()

const categories = ['Semua', 'Buah', 'Makanan', 'Benda', 'Kegiatan']
const activeCategory = ref('Semua')
const showChallenge = ref(false)
const selectedWord = ref<typeof words[0] | null>(null)

const words = [
  { id: 'apel', name: 'Apel', category: 'Buah', icon: '🍎', syllables: ['A', 'pel'], color: 'bg-[#FF6B6B]' },
  { id: 'pisang', name: 'Pisang', category: 'Buah', icon: '🍌', syllables: ['Pi', 'sang'], color: 'bg-[#FFD93D]' },
  { id: 'jeruk', name: 'Jeruk', category: 'Buah', icon: '🍊', syllables: ['Je', 'ruk'], color: 'bg-[#FFD93D]' },
  { id: 'roti', name: 'Roti', category: 'Makanan', icon: '🍞', syllables: ['Ro', 'ti'], color: 'bg-[#A084E8]' },
  { id: 'susu', name: 'Susu', category: 'Makanan', icon: '🥛', syllables: ['Su', 'su'], color: 'bg-[#4D96FF]' },
  { id: 'meja', name: 'Meja', category: 'Benda', icon: '🪑', syllables: ['Me', 'ja'], color: 'bg-[#A084E8]' },
  { id: 'buku', name: 'Buku', category: 'Benda', icon: '📚', syllables: ['Bu', 'ku'], color: 'bg-[#6BCB77]' },
  { id: 'bola', name: 'Bola', category: 'Benda', icon: '⚽', syllables: ['Bo', 'la'], color: 'bg-[#4D96FF]' },
  { id: 'makan', name: 'Makan', category: 'Kegiatan', icon: '😋', syllables: ['Ma', 'kan'], color: 'bg-[#6BCB77]' },
  { id: 'lari', name: 'Lari', category: 'Kegiatan', icon: '🏃', syllables: ['La', 'ri'], color: 'bg-[#4D96FF]' },
  { id: 'tidur', name: 'Tidur', category: 'Kegiatan', icon: '😴', syllables: ['Ti', 'dur'], color: 'bg-[#A084E8]' },
  { id: 'sapu', name: 'Sapu', category: 'Benda', icon: '🧹', syllables: ['Sa', 'pu'], color: 'bg-[#6BCB77]' },
]

const filteredWords = ref(words)

const filterByCategory = (cat: string) => {
  activeCategory.value = cat
  if (cat === 'Semua') {
    filteredWords.value = words
  } else {
    filteredWords.value = words.filter(w => w.category === cat)
  }
}

const goBack = () => {
  if (showChallenge.value) {
    showChallenge.value = false
    selectedWord.value = null
  } else {
    router.push('/')
  }
}

const handleWordClick = (word: typeof words[0]) => {
  if (showChallenge.value) {
    selectedWord.value = word
  } else {
    router.push(`/learn/${word.id}`)
  }
}

const toggleChallenge = (value: boolean) => {
  showChallenge.value = value
  selectedWord.value = null
}
</script>

<template>
  <div class="h-[90vh] flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between shrink-0">
      <button @click="goBack" class="btn-bubble bg-white px-6 py-2 text-xl font-bold border-2">
        ← Kembali
      </button>
      <h1 class="text-4xl md:text-5xl font-black text-[#5C4D00]">
        {{ showChallenge ? 'Tantangan Mengeja' : 'Belajar Mengeja' }}
      </h1>
      <div class="flex gap-2">
        <button
          @click="toggleChallenge(false)"
          class="px-6 py-2 text-lg font-bold rounded-full transition-all"
          :class="!showChallenge ? 'btn-primary shadow-lg scale-105' : 'bg-white/50 text-gray-500'"
        >
          💡 Belajar
        </button>
        <button
          @click="toggleChallenge(true)"
          class="px-6 py-2 text-lg font-bold rounded-full transition-all"
          :class="showChallenge ? 'btn-accent shadow-lg scale-105' : 'bg-white/50 text-gray-500'"
        >
          🎮 Tantangan
        </button>
      </div>
    </div>

    <!-- Selection View (Common for Learning and starting a Challenge) -->
    <div v-if="!showChallenge || (showChallenge && !selectedWord)" class="flex flex-col gap-6 flex-1 overflow-hidden">
      <!-- Category Tabs -->
      <div class="flex gap-3 overflow-x-auto pb-2 no-scrollbar shrink-0">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="filterByCategory(cat)"
          class="px-6 py-2 rounded-full font-bold transition-all text-lg whitespace-nowrap"
          :class="activeCategory === cat ? 'bg-[#4D96FF] text-white shadow-lg' : 'bg-white/70 text-gray-600 hover:bg-white'"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Word Grid -->
      <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 pb-8">
          <button
            v-for="word in filteredWords"
            :key="word.id"
            @click="handleWordClick(word)"
            class="glass-card p-6 flex flex-col items-center gap-4 transition-all duration-300 hover:scale-105 hover:rotate-2 hover:shadow-xl cursor-pointer group"
          >
            <div class="text-7xl md:text-8xl transition-transform duration-500 group-hover:scale-110">
              {{ word.icon }}
            </div>
            <div class="bg-[#FFD93D] px-6 py-1 rounded-full shadow-sm border-2 border-white">
              <span class="text-2xl font-black text-[#634E00] uppercase tracking-wider">
                {{ word.name }}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Active Challenge View -->
    <div v-else class="flex-1">
      <SpellingChallenge
        :word="selectedWord!"
        @back="selectedWord = null"
        @success="selectedWord = null"
      />
    </div>
  </div>
</template>


<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.05);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: 10px;
}
</style>
