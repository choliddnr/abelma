<script setup lang="ts">
import { useAudio } from "~/composables/useAudio";

const props = withDefaults(
  defineProps<{
    text: string;
    colorClass?: string;
    isActive?: boolean;
    disabled?: boolean;
    isMerged?: boolean;
  }>(),
  {
    colorClass: "bg-[#4D96FF]",
    isActive: false,
    disabled: false,
    isMerged: false,
  }
);

const { playSyllableAudio } = useAudio();

const handleClick = () => {
  if (props.disabled) return;
  playSyllableAudio(props.text);
};
</script>

<template>
  <div
    class="relative group cursor-pointer select-none transition-all duration-300"
    :class="[
      isMerged ? 'scale-110' : 'hover:scale-105 active:scale-95',
      disabled ? 'pointer-events-none opacity-80' : ''
    ]"
    @click="handleClick"
  >
    <BubbleCard
      class="w-24 h-28 sm:w-32 sm:h-40 md:w-40 md:h-52 rounded-2xl md:rounded-[2.5rem] shadow-xl border-t-4 border-white/50"
      :class="[
        colorClass,
        isActive ? 'ring-8 ring-white scale-110 z-10 brightness-110' : 'hover:-translate-y-2'
      ]"
    >
      <span
        class="text-4xl sm:text-5xl md:text-7xl font-black text-white drop-shadow-[0_6px_0_rgba(0,0,0,0.15)] tracking-widest font-quicksand"
      >
        {{ text }}
      </span>

      <!-- Active Indicator Glow -->
      <div
        v-if="isActive"
        class="absolute inset-0 bg-white/20 animate-pulse rounded-[inherit]"
      ></div>
    </BubbleCard>
  </div>
</template>

<style scoped>
.tracking-widest {
  letter-spacing: 0.1em;
}
</style>
