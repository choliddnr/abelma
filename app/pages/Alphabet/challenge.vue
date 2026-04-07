<script setup lang="ts">
defineOptions({ name: 'AlphabetChallenge' })

const { preloadSounds } = useAlphabetAudio()

onMounted(() => {
  preloadSounds()
})

const stopChallenge = () => {
  navigateTo('/alphabet')
}
</script>

<template>
  <div class="alphabet-view-container overflow-x-hidden mt-4">
    <AlphabetChallengeMode @stop-challenge="stopChallenge" />
  </div>
</template>

<style scoped>
.alphabet-view-container {
  min-height: calc(100vh - 120px);
}
</style>
