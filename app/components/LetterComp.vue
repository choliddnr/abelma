<script lang="ts" setup>
import { useDraggable } from '@vue-dnd-kit/core'

const props = defineProps<{
  letter: string
}>()

const {
  elementRef,
  isDragging,
  handleDragStart,
} = useDraggable({
  id: `letter-${props.letter}-${Math.random().toString(36).substr(2, 9)}`,
  data: computed(() => ({
    letter: props.letter.toUpperCase(),
  })),
})

const playSound = () => {
  const utterance = new SpeechSynthesisUtterance(props.letter.toLowerCase())
  utterance.lang = 'id-ID'
  window.speechSynthesis.speak(utterance)
}
</script>

<template>
  <div
    ref="elementRef"
    :class="{
      'opacity-50 scale-90': isDragging,
      'hover:scale-110 active:scale-95': !isDragging
    }"
    class="bg-white border-4 border-[#FFD93D] rounded-2xl w-16 h-16 md:w-20 md:h-20 grid place-items-center shadow-md cursor-grab active:cursor-grabbing transition-all duration-200 select-none pb-1"
    @pointerdown="handleDragStart"
    @click="playSound"
  >
    <span class="text-3xl md:text-4xl font-black text-[#5C4D00]">
      {{ letter }}
    </span>
  </div>
</template>

<style scoped>
.dragging {
  z-index: 1000;
}
</style>


