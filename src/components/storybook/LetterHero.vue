<script setup lang="ts">
defineProps<{
  upper: string
  lower: string
  themeColor: string // e.g. 'bg-red-500'
  title: string
  phonicsText: string // spoken aloud via Web Speech API
}>()

const emit = defineEmits<{
  speak: []
}>()
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <!-- Title badge -->
    <div class="glass-card px-6 py-2 flex items-center gap-2 shadow-md">
      <span class="text-2xl font-bold text-slate-700" style="font-family: 'Baloo Bhaijaan 2', sans-serif;">
        {{ title }}
      </span>
    </div>

    <!-- Letter display pair -->
    <div class="flex items-center justify-center gap-6 sm:gap-10">
      <!-- Uppercase -->
      <div
        class="letter-hero-card group"
        :class="themeColor"
      >
        <div class="glossy-top" />
        <span class="letter-text text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]">
          {{ upper }}
        </span>
        <div class="letter-depth-shadow" />
      </div>

      <!-- Divider dot -->
      <div class="flex flex-col gap-2">
        <span class="w-3 h-3 rounded-full bg-slate-300" />
        <span class="w-3 h-3 rounded-full bg-slate-300" />
        <span class="w-3 h-3 rounded-full bg-slate-300" />
      </div>

      <!-- Lowercase -->
      <div
        class="letter-hero-card group opacity-80"
        :class="themeColor"
      >
        <div class="glossy-top" />
        <span class="letter-text text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]">
          {{ lower }}
        </span>
        <div class="letter-depth-shadow" />
      </div>
    </div>

    <!-- Speak button -->
    <button
      @click="emit('speak')"
      class="ui-capsule-interactive bg-white border-indigo-200 text-indigo-700 w-auto px-8 hover:bg-indigo-50 shadow-lg"
    >
      <span class="text-2xl">🔊</span>
      <span class="font-black text-base hidden sm:inline">Dengarkan</span>
    </button>
  </div>
</template>

<style scoped>
.letter-hero-card {
  position: relative;
  width: clamp(100px, 25vw, 160px);
  aspect-ratio: 1 / 1;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 12px 0 rgba(0, 0, 0, 0.15), 0 20px 40px rgba(0, 0, 0, 0.15);
  border: 4px solid rgba(255, 255, 255, 0.35);
  animation: entrance 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  cursor: default;
}

.letter-hero-card:hover {
  animation: bouncy-letter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.letter-text {
  font-family: 'Baloo Bhaijaan 2', sans-serif;
  font-size: clamp(3.5rem, 12vw, 7rem);
  font-weight: 900;
  line-height: 1;
  z-index: 2;
  user-select: none;
}

.glossy-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.45), transparent);
  border-radius: inherit;
  pointer-events: none;
  z-index: 3;
}

.letter-depth-shadow {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 25%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.2), transparent);
  pointer-events: none;
  z-index: 1;
}

@keyframes bouncy-letter {
  0%   { transform: scale(1) translateY(0); }
  30%  { transform: scale(1.12) translateY(-12px); }
  55%  { transform: scale(0.96) translateY(4px); }
  75%  { transform: scale(1.04) translateY(-5px); }
  90%  { transform: scale(0.99) translateY(2px); }
  100% { transform: scale(1) translateY(0); }
}

@keyframes entrance {
  from { opacity: 0; transform: scale(0.7) translateY(20px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
