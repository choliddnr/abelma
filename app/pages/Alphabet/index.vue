<script setup lang="ts">
defineOptions({ name: 'AlphabetIndex' })
const isChallengeMode = ref(false)
const { preloadSounds } = useAlphabetAudio()

onMounted(() => {
  preloadSounds()
})
</script>

<template>
  <div class="alphabet-view-container overflow-x-hidden mt-4">
    <transition name="mode-fade" mode="out-in">
      <AlphabetChallengeMode v-if="isChallengeMode" @stop-challenge="isChallengeMode = false" />
      <AlphabetLearningMode v-else @start-challenge="isChallengeMode = true" />
    </transition>
  </div>
</template>

<style scoped>
.mode-fade-enter-active,
.mode-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.mode-fade-enter-from {
  opacity: 0;
  transform: scale(0.98) translateY(10px);
}

.mode-fade-leave-to {
  opacity: 0;
  transform: scale(1.02) translateY(-10px);
}

.alphabet-view-container {
  /* Ensure container doesn't collapse during transitions */
  min-height: calc(100vh - 120px);
}
</style>

