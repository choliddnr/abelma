<script setup lang="ts">
import { useMentorStore } from '@/stores/mentorStore'
import { ref, watch } from 'vue'

const mentorStore = useMentorStore()
//cancel
const { isSpeaking: appIsSpeaking, speak } = useAudio()

const { isVisible, message, isWiggling } = storeToRefs(mentorStore)

// Draggable State
const position = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const hasDragged = ref(false)

const startDrag = (e: MouseEvent | TouchEvent) => {
  isDragging.value = true
  hasDragged.value = false
  const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0]!.clientY : e.clientY
  dragStart.value = { 
    x: clientX - position.value.x, 
    y: clientY - position.value.y 
  }
  
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('touchmove', onDrag, { passive: false })
  window.addEventListener('touchend', stopDrag)
}

const onDrag = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return
  if ('preventDefault' in e) e.preventDefault()
  
  const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0]!.clientY : e.clientY
  
  const deltaX = clientX - dragStart.value.x
  const deltaY = clientY - dragStart.value.y
  
  if (Math.abs(deltaX - position.value.x) > 5 || Math.abs(deltaY - position.value.y) > 5) {
    hasDragged.value = true
  }
  
  position.value = { x: deltaX, y: deltaY }
}

const stopDrag = () => {
  isDragging.value = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchmove', onDrag)
  window.removeEventListener('touchend', stopDrag)
}

const handleClick = () => {
  if (!hasDragged.value) {
    mentorStore.wiggle()
  }
}

watch(message, (newMsg) => {
  if (newMsg) {
    speak(newMsg, {
      onEnd: () => {
        setTimeout(() => {
          if (!appIsSpeaking.value) {
            mentorStore.hideMessage()
          }
        }, 3000)
      }
    })
  } else {
    // cancel()
  }
})
</script>

<template>
  <div 
    class="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none transition-transform duration-75"
    :style="{ transform: `translate(${position.x}px, ${position.y}px)` }"
  >
    <!-- Speech Bubble -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isVisible && message"
        class="mb-4 mr-2 bg-white px-6 py-4 rounded-[2rem] rounded-br-none shadow-2xl border-4 border-indigo-400 max-w-[250px] relative pointer-events-auto"
      >
        <p class="text-indigo-900 font-black text-lg font-quicksand leading-tight text-center">
          {{ message }}
        </p>
        <div class="absolute -bottom-4 right-0 w-8 h-8 bg-white border-r-4 border-b-4 border-indigo-400 rotate-45 -translate-x-1/2"></div>
      </div>
    </Transition>

    <!-- Character Bubble -->
    <Transition
      appear
      enter-active-class="transition duration-500 ease-out delay-300"
      enter-from-class="opacity-0 scale-0 rotate-180"
      enter-to-class="opacity-100 scale-100 rotate-0"
    >
      <div
        class="relative pointer-events-auto cursor-grab group select-none"
        :class="{ 
          'animate-wiggle': isWiggling,
          'animate-speaking': appIsSpeaking,
          'cursor-grabbing scale-110': isDragging
        }"
        @mousedown="startDrag"
        @touchstart="startDrag"
        @click="handleClick"
      >
        <div
          class="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-indigo-50 transform transition-all duration-300 group-hover:scale-110"
          :class="{ 'ring-8 ring-indigo-400/30 scale-105': appIsSpeaking }"
        >
          <img
            src="/img/mentor-boy.png"
            alt="Mentor Boy"
            class="w-full h-full object-cover"
            :class="{ 'animate-pulse-slow': appIsSpeaking }"
          />
        </div>

        <!-- Pulse Effect when speaking -->
        <div
          v-if="appIsSpeaking"
          class="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-20"
        ></div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@keyframes wiggle {
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(-10deg) scale(1.1); }
  75% { transform: rotate(10deg) scale(1.1); }
}

@keyframes speaking {
  0%, 100% { transform: translateY(0) rotate(0); }
  25% { transform: translateY(-5px) rotate(-2deg); }
  75% { transform: translateY(-5px) rotate(2deg); }
}

@keyframes pulse-slow {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.animate-wiggle {
  animation: wiggle 0.5s ease-in-out infinite;
}

.animate-speaking {
  animation: speaking 0.4s ease-in-out infinite;
}

.animate-pulse-slow {
  animation: pulse-slow 2s ease-in-out infinite;
}

.font-quicksand {
  font-family: 'Quicksand', sans-serif;
}
</style>
