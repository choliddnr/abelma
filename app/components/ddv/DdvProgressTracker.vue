<script setup lang="ts">
defineProps<{
  current: number;
  total: number;
  levelName: string;
}>();
</script>

<template>
  <div class="w-full max-w-2xl mx-auto px-4 py-2 md:py-6">
    <div class="flex items-center justify-between mb-3">
      <div class="flex flex-col">
        <span class="text-xs font-black text-teal-600 uppercase tracking-widest">Level</span>
        <h2 class="text-xl font-black text-slate-800">{{ levelName }}</h2>
      </div>
      <div class="flex flex-col items-end">
        <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Kemajuan</span>
        <span class="text-xl font-black text-teal-600">{{ current }} / {{ total }}</span>
      </div>
    </div>

    <!-- Progress Bar Container -->
    <div class="relative h-6 bg-slate-200/50 backdrop-blur-sm rounded-full border-2 border-white shadow-inner p-1">
      <!-- Animated Progress Fill -->
      <div
        class="h-full bg-linear-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-500 shadow-lg relative overflow-hidden"
        :style="{ width: `${(current / total) * 100}%` }"
      >
        <!-- Shine effect -->
        <div class="absolute inset-0 bg-linear-to-b from-white/30 to-transparent"></div>
        <div class="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
      </div>

      <!-- Segment markers -->
      <div class="absolute inset-0 flex justify-evenly items-center pointer-events-none">
        <div
          v-for="i in total - 1"
          :key="i"
          class="w-1 h-2 bg-white/20 rounded-full"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.animate-shimmer {
  animation: shimmer 2s infinite linear;
}
</style>
