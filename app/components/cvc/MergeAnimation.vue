<script setup lang="ts">
import SyllableCard from "./SyllableCard.vue";

const props = defineProps<{
  part1: string;
  part2: string;
  isAnimating: boolean;
  isComplete: boolean;
  type: "blend" | "word";
}>();

// Colors: 3.1 & 3.2 (blend) uses Yellow/Purple, 3.3 (word) uses Green/Blue
const part1Color = computed(() => (props.type === "blend" ? "bg-[#FFD93D]" : "bg-[#6BCB77]"));
const part2Color = computed(() => (props.type === "blend" ? "bg-[#A084E8]" : "bg-[#4D96FF]"));
</script>

<template>
  <div class="relative w-full flex flex-col items-center py-8">
    <!-- Game Board -->
    <div class="relative flex items-center justify-center gap-8 md:gap-16 w-full max-w-2xl min-h-[300px]">
      
      <!-- Part 1 Slot -->
      <div
        class="transition-all duration-700 ease-in-out transform"
        :class="[
          isAnimating ? 'translate-x-[calc(50%+4px)] md:translate-x-[calc(50%+8px)] rotate-3' : '',
          isComplete ? 'translate-x-[calc(50%+4px)] md:translate-x-[calc(50%+8px)] scale-110 z-20' : ''
        ]"
      >
        <SyllableCard
          :text="part1"
          :colorClass="part1Color"
          :disabled="isAnimating || isComplete"
          :isMerged="isComplete"
        />
      </div>

      <!-- Part 2 Slot -->
      <div
        class="transition-all duration-700 ease-in-out transform"
        :class="[
          isAnimating ? '-translate-x-[calc(50%+4px)] md:translate-x-[calc(-50%-8px)] -rotate-3' : '',
          isComplete ? '-translate-x-[calc(50%+4px)] md:translate-x-[calc(-50%-8px)] scale-110 z-20' : ''
        ]"
      >
        <SyllableCard
          :text="part2"
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
    
    <!-- Connector Hint (Only when not animating) -->
    <div
      v-if="!isAnimating && !isComplete"
      class="mt-4 flex items-center gap-2 text-[#A084E8]/40 animate-pulse"
    >
      <Icon name="lucide:arrow-right-left" class="size-8" />
    </div>
  </div>
</template>

<style scoped>
/* Custom curve for the slide-together effect */
.ease-in-out {
  transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
