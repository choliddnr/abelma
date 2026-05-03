<script setup lang="ts">
import SyllableCard from "~/components/cvc/SyllableCard.vue";

const props = defineProps<{
  vowel1: string;
  vowel2: string;
  isAnimating: boolean;
  isComplete: boolean;
  type: "diphthong" | "cluster";
}>();

// Colors: warm gold for diphthongs, different scheme for clusters
const part1Color = computed(() => (props.type === "diphthong" ? "bg-[#FFD93D]" : "bg-[#6BCB77]"));
const part2Color = computed(() => (props.type === "diphthong" ? "bg-[#4D96FF]" : "bg-[#14B8A6]"));
</script>

<template>
  <div class="relative w-full flex flex-col items-center py-8">
    <!-- Game Board -->
    <div class="relative flex items-center justify-center gap-8 md:gap-16 w-full max-w-2xl min-h-[300px]">
      
      <!-- Vowel 1 Slot -->
      <div
        class="transition-all duration-700 ease-in-out transform"
        :class="[
          isAnimating ? 'translate-x-[calc(50%+4px)] md:translate-x-[calc(50%+8px)] rotate-3' : '',
          isComplete ? 'translate-x-[calc(50%+4px)] md:translate-x-[calc(50%+8px)] scale-110 z-20' : ''
        ]"
      >
        <SyllableCard
          :text="vowel1"
          :colorClass="part1Color"
          :disabled="isAnimating || isComplete"
          :isMerged="isComplete"
        />
      </div>

      <!-- Vowel 2 Slot -->
      <div
        class="transition-all duration-700 ease-in-out transform"
        :class="[
          isAnimating ? '-translate-x-[calc(50%+4px)] md:translate-x-[calc(-50%-8px)] -rotate-3' : '',
          isComplete ? '-translate-x-[calc(50%+4px)] md:translate-x-[calc(-50%-8px)] scale-110 z-20' : ''
        ]"
      >
        <SyllableCard
          :text="vowel2"
          :colorClass="part2Color"
          :disabled="isAnimating || isComplete"
          :isMerged="isComplete"
        />
      </div>

      <!-- Success Flash -->
      <div
        v-if="isAnimating"
        class="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
      >
        <div class="w-20 h-20 bg-white rounded-full blur-3xl animate-ping opacity-75"></div>
      </div>
    </div>
    
    <!-- Connector Hint -->
    <div
      v-if="!isAnimating && !isComplete"
      class="mt-4 flex items-center gap-2 text-teal-400/40 animate-pulse"
    >
      <Icon name="lucide:arrow-right-left" class="size-8" />
    </div>
  </div>
</template>

<style scoped>
.ease-in-out {
  transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
