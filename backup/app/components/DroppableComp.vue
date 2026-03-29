<script lang="ts" setup>
import { useDroppable } from '@vue-dnd-kit/core'

const emit = defineEmits(['update-letter', 'drag-over'])
const letter = ref<string | undefined>()
const props = defineProps<{
  target: string,
  resetTrigger?: number // Used to force reset from parent
}>()

const { elementRef, isOvered } = useDroppable({
  groups: ['items'],
  events: {
    onDrop: (store, payload) => {
      const draggedItem = payload.items[0]
      const droppedLetter = draggedItem!.data!.letter as string
      letter.value = droppedLetter
      emit('update-letter', droppedLetter)
    },
  },
})

const clearLetter = () => {
  if (letter.value) {
    letter.value = undefined
    emit('update-letter', '')
  }
}

// Allow external reset
watch(() => props.resetTrigger, () => {
  letter.value = undefined
})
</script>
<template>
  <div ref="elementRef" :class="{ over: isOvered }">
    <div
      v-if="!letter"
      class="ring-4 ring-dashed ring-gray-300 rounded-2xl h-20 w-20 md:h-24 md:w-24 grid place-items-center bg-white/50 transition-all"
      :class="{ 'ring-accent bg-accent/20 scale-110': isOvered }"
    >
      <span class="text-4xl text-gray-300 font-bold opacity-30 select-none">?</span>
    </div>
    <div
      v-else
      @click="clearLetter"
      class="bg-white ring-4 ring-accent rounded-2xl h-20 w-20 md:h-24 md:w-24 grid place-items-center shadow-lg transition-all animate-bounce cursor-pointer group hover:ring-red-400 relative"
    >
      <span class="text-4xl md:text-5xl font-black text-accent group-hover:text-red-400">
        {{ letter }}
      </span>
      <!-- Delete Hint -->
      <div class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
        ✕
      </div>
    </div>
  </div>
</template>

<style scoped>
.over {
  transform: scale(1.05);
}
</style>


