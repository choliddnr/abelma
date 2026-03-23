<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import confetti from 'canvas-confetti'

const props = defineProps<{
  target: string
  options: string[]        // target is already included in options from JSON
  instruction: string
  themeColor: string
}>()

const emit = defineEmits<{
  success: []
  fail: []
}>()

// Seeded shuffle so options order randomises on each new letter
const shuffled = ref<string[]>([])

const shuffleOptions = () => {
  const arr = [...props.options]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  shuffled.value = arr
}

watch(() => props.target, shuffleOptions, { immediate: true })

// State
type FeedbackState = 'idle' | 'success' | 'fail'
const feedbackState = ref<FeedbackState>('idle')
const wrongLetter    = ref('')
const correctClicked = ref('')

const buttonColors = [
  'bg-amber-400 border-amber-600 text-amber-900',
  'bg-sky-400   border-sky-600   text-sky-900',
  'bg-rose-400  border-rose-600  text-white',
  'bg-emerald-400 border-emerald-600 text-emerald-900',
  'bg-violet-400 border-violet-600 text-white',
  'bg-orange-400 border-orange-600 text-orange-900',
]

const colorForIndex = (i: number) => buttonColors[i % buttonColors.length]!

const isLocked = computed(() => feedbackState.value === 'success')

const popConfetti = (el: Element) => {
  const rect = el.getBoundingClientRect()
  const x = (rect.left + rect.width  / 2) / window.innerWidth
  const y = (rect.top  + rect.height / 2) / window.innerHeight
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { x, y },
    colors: ['#FFD93D', '#6BCB77', '#4D96FF', '#ff9a9a', '#A084E8'],
    gravity: 0.9,
    scalar: 1.1,
    ticks: 80,
    zIndex: 200,
  })
}

const handleClick = (letter: string, event: MouseEvent) => {
  if (isLocked.value) return

  if (letter === props.target) {
    feedbackState.value = 'success'
    correctClicked.value = letter
    wrongLetter.value    = ''
    popConfetti(event.currentTarget as Element)
    emit('success')
  } else {
    wrongLetter.value = letter
    feedbackState.value = 'fail'
    emit('fail')
    setTimeout(() => {
      wrongLetter.value   = ''
      feedbackState.value = 'idle'
    }, 700)
  }
}

// Expose reset so parent can call after moving to next letter
const reset = () => {
  feedbackState.value  = 'idle'
  wrongLetter.value    = ''
  correctClicked.value = ''
  shuffleOptions()
}
defineExpose({ reset })
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Instruction banner -->
    <div class="glass-card px-6 py-4 flex items-center gap-3 shadow-md">
      <span class="text-3xl select-none">🎯</span>
      <p class="text-xl sm:text-2xl font-black text-slate-700" style="font-family: 'Baloo Bhaijaan 2', sans-serif;">
        {{ instruction }}
      </p>
    </div>

    <!-- Success overlay message -->
    <transition name="pop-in">
      <div
        v-if="feedbackState === 'success'"
        class="flex items-center justify-center gap-3 py-4 rounded-3xl bg-emerald-100 border-4 border-emerald-400 shadow-lg"
      >
        <span class="text-4xl">🌟</span>
        <span class="text-2xl font-black text-emerald-700">
          Hebat! Itu huruf {{ target }}!
        </span>
        <span class="text-4xl">🌟</span>
      </div>
    </transition>

    <!-- Letter option buttons -->
    <div
      class="grid gap-3 sm:gap-4"
      :class="options.length <= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3 sm:grid-cols-3'"
    >
      <button
        v-for="(letter, idx) in shuffled"
        :key="letter"
        :id="`storybook-option-${letter}`"
        @click="handleClick(letter, $event)"
        :disabled="isLocked"
        class="
          relative flex items-center justify-center
          min-h-20 sm:min-h-24 w-full rounded-3xl
          border-b-6 border-b-[rgba(0,0,0,0.18)]
          font-black text-5xl sm:text-6xl
          transition-all duration-200
          active:border-b-0 active:translate-y-1.5
          select-none
          overflow-hidden
          shadow-[0_8px_20px_rgba(0,0,0,0.1)]
        "
        :class="[
          colorForIndex(idx),
          letter === correctClicked
            ? 'success-glow scale-105'
            : letter === wrongLetter
              ? 'shake-it opacity-80 bg-red-400! border-red-600!'
              : 'hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(0,0,0,0.18)]',
          isLocked && letter !== correctClicked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        ]"
        style="font-family: 'Baloo Bhaijaan 2', sans-serif;"
      >
        <!-- Glossy highlight -->
        <div class="absolute top-0 inset-x-0 h-2/5 bg-white/30 rounded-t-3xl pointer-events-none" />
        {{ letter }}
      </button>
    </div>

    <!-- Fail hint -->
    <transition name="fade">
      <p
        v-if="feedbackState === 'fail' && wrongLetter"
        class="text-center text-lg font-bold text-rose-500 animate-bounce mt-1"
      >
        Bukan itu! Coba lagi yuk! 💪
      </p>
    </transition>
  </div>
</template>

<style scoped>
/* Success green glow */
.success-glow {
  box-shadow:
    0 0 0 5px rgba(74, 222, 128, 0.6),
    0 0 30px rgba(74, 222, 128, 0.5),
    0 10px 20px rgba(0, 0, 0, 0.1);
  background-color: #4ade80 !important;
  color: #14532d !important;
  border-color: #16a34a !important;
}

/* Shake animation on wrong */
.shake-it {
  animation: shake 0.55s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-2px, 0, 0); }
  20%, 80% { transform: translate3d(4px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-6px, 0, 0); }
  40%, 60% { transform: translate3d(6px, 0, 0); }
}

/* Pop-in for success banner */
.pop-in-enter-active {
  animation: pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pop-in-leave-active {
  transition: opacity 0.2s ease;
}
.pop-in-leave-to { opacity: 0; }

@keyframes pop {
  0%   { transform: scale(0.7); opacity: 0; }
  60%  { transform: scale(1.08); }
  100% { transform: scale(1);   opacity: 1; }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
