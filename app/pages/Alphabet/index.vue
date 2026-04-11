<script setup lang="ts">
defineOptions({ name: "AlphabetLearning" });

const { preloadSounds } = useAlphabetAudio();

onMounted(() => {
  preloadSounds();
});

const startChallenge = () => {
  navigateTo("/alphabet/challenge");
};
</script>

<template>
  <div class="alphabet-view-container overflow-x-hidden mt-4">
    <AlphabetLearningMode @start-challenge="startChallenge" />
  </div>
</template>

<style scoped>
.alphabet-view-container {
  min-height: calc(100vh - 120px);
}
</style>
