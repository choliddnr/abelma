<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  story: string
  themeColor: string   // Tailwind bg class e.g. 'bg-red-500'
  letter: string       // uppercase letter for emoji lookup
  title: string
}>()

// Emoji map matching AlphabetView.vue's idLetterMap
const emojiMap: Record<string, { emoji: string; word: string }> = {
  A: { emoji: '🍎', word: 'Apel' },
  B: { emoji: '⚽', word: 'Bola' },
  C: { emoji: '🍒', word: 'Ceri' },
  D: { emoji: '🐑', word: 'Domba' },
  E: { emoji: '🦅', word: 'Elang' },
  F: { emoji: '📷', word: 'Foto' },
  G: { emoji: '🐘', word: 'Gajah' },
  H: { emoji: '🚁', word: 'Helikopter' },
  I: { emoji: '🐟', word: 'Ikan' },
  J: { emoji: '🦒', word: 'Jerapah' },
  K: { emoji: '🐈', word: 'Kucing' },
  L: { emoji: '💡', word: 'Lampu' },
  M: { emoji: '🥭', word: 'Mangga' },
  N: { emoji: '🍍', word: 'Nanas' },
  O: { emoji: '💊', word: 'Obat' },
  P: { emoji: '🍌', word: 'Pisang' },
  Q: { emoji: '📖', word: "Qur'an" },
  R: { emoji: '🏠', word: 'Rumah' },
  S: { emoji: '🐄', word: 'Sapi' },
  T: { emoji: '🎩', word: 'Topi' },
  U: { emoji: '🐪', word: 'Unta' },
  V: { emoji: '🏺', word: 'Vas' },
  W: { emoji: '🥕', word: 'Wortel' },
  X: { emoji: '🎼', word: 'Xilofon' },
  Y: { emoji: '🪀', word: 'Yoyo' },
  Z: { emoji: '🦓', word: 'Zebra' },
}

const letterEmoji = computed(() => emojiMap[props.letter]?.emoji ?? '✨')

// Highlight capital letters matching the current letter in the story text
const highlightedStory = computed(() => {
  // Wrap occurrences of the letter (upper and lower) in a span for visual pop
  return props.story.replace(
    new RegExp(`(${props.letter}|${props.letter.toLowerCase()})`, 'g'),
    `<mark class="story-highlight">$1</mark>`
  )
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Illustration zone -->
    <div
      class="w-full rounded-3xl flex items-center justify-center py-6 border-4 border-white/50 shadow-inner relative overflow-hidden"
      :class="themeColor"
      style="min-height: 140px;"
    >
      <!-- Soft inner glow -->
      <div class="absolute inset-0 bg-white/10 rounded-inherit pointer-events-none" />
      <!-- Large emoji illustration -->
      <span
        class="text-8xl sm:text-9xl drop-shadow-xl select-none animate-float-slow"
        aria-hidden="true"
      >
        {{ letterEmoji }}
      </span>

      <!-- Corner letter watermark -->
      <span
        class="absolute top-3 left-4 text-5xl font-black text-white/25 select-none"
        style="font-family: 'Baloo Bhaijaan 2', sans-serif;"
      >
        {{ letter }}
      </span>
    </div>

    <!-- Story text card -->
    <div class="glass-card p-6 sm:p-8 relative">
      <span
        class="absolute -top-4 left-6 text-xs font-black uppercase tracking-widest text-slate-400 bg-white/80 px-3 py-1 rounded-full border border-slate-200 backdrop-blur-sm"
      >
        📖 Cerita
      </span>
      <p
        class="text-xl sm:text-2xl leading-relaxed text-slate-700 font-medium mt-2"
        style="font-family: 'Outfit', sans-serif;"
        v-html="highlightedStory"
      />
    </div>
  </div>
</template>

<style scoped>
:deep(.story-highlight) {
  background: rgba(255, 220, 0, 0.55);
  border-radius: 4px;
  padding: 0 2px;
  font-weight: 900;
  color: #7c5200;
  text-decoration: none;
  box-shadow: 0 2px 0 rgba(202, 138, 4, 0.5);
}

@keyframes float-slow {
  0%, 100% { transform: translateY(0) rotate(-3deg); }
  50%       { transform: translateY(-14px) rotate(3deg); }
}

.animate-float-slow {
  animation: float-slow 4s ease-in-out infinite;
}
</style>
