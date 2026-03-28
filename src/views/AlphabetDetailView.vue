<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const letter = route.params.id as string

const words = {
  A: { word: 'Apel', icon: '🍎' },
  B: { word: 'Bola', icon: '⚽' },
  C: { word: 'Cicak', icon: '🦎' },
  D: { word: 'Domba', icon: '🐑' },
  E: { word: 'Elang', icon: '🦅' },
  F: { word: 'Foto', icon: '📷' },
  G: { word: 'Gajah', icon: '🐘' },
  H: { word: 'Harimau', icon: '🐅' },
  I: { word: 'Ikan', icon: '🐟' },
  J: { word: 'Jerapah', icon: '🦒' },
  K: { word: 'Kucing', icon: '🐱' },
  L: { word: 'Lampu', icon: '💡' },
  M: { word: 'Mobil', icon: '🚗' },
  N: { word: 'Nanas', icon: '🍍' },
  O: { word: 'Obat', icon: '💊' },
  P: { word: 'Pisang', icon: '🍌' },
  Q: { word: 'Quran', icon: '📖' },
  R: { word: 'Roti', icon: '🍞' },
  S: { word: 'Susu', icon: '🥛' },
  T: { word: 'Topi', icon: '🎩' },
  U: { word: 'Ular', icon: '🐍' },
  V: { word: 'Vas', icon: '🏺' },
  W: { word: 'Wortel', icon: '🥕' },
  X: { word: 'Xylophone', icon: '🎹' },
  Y: { word: 'Yoyo', icon: '🪀' },
  Z: { word: 'Zebra', icon: '🦓' },
}

const item = words[letter as keyof typeof words] || { word: '???', icon: '❓' }

const goBack = () => router.push('/alphabet')
</script>

<template>
  <div class="flex flex-col items-center gap-12">
    <div class="w-full flex justify-start">
      <button @click="goBack" class="btn-bubble bg-white px-6 py-3 text-xl font-bold text-gray-700 border-2">
        ← Kembali
      </button>
    </div>

    <div class="glass-card p-12 w-full max-w-4xl flex flex-col md:flex-row items-center justify-around gap-12">
      <div class="text-[200px] md:text-[300px] font-black leading-none text-accent animate-bounce">
        {{ letter }}
      </div>

      <div class="flex flex-col items-center gap-6">
        <div class="text-[120px] md:text-[200px] bg-white rounded-full w-48 h-48 md:w-64 md:h-64 flex items-center justify-center shadow-lg border-8 border-primary">
          {{ item.icon }}
        </div>
        <div class="text-center space-y-2">
          <p class="text-3xl font-bold text-gray-500">untuk...</p>
          <h2 class="text-6xl md:text-8xl font-black text-danger tracking-wide">
            {{ item.word }}
          </h2>
        </div>
      </div>
    </div>

    <div class="flex gap-6">
      <button class="btn-primary flex items-center gap-4 px-12 py-6 text-3xl">
        <span>🔊</span> Dengar Suara
      </button>
      
      <button @click="router.push(`/alphabet/${letter}/trace`)" class="btn-primary bg-accent hover:bg-[#3b82f6] shadow-[#3b82f6]/50 flex items-center gap-4 px-12 py-6 text-3xl">
        <span>✍️</span> Latihan Menulis
      </button>
    </div>
  </div>
</template>
