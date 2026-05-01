<script setup lang="ts">
defineOptions({ name: "AlphabetLearning" });

// const { preloadAlphabetSounds } = useAudio();

onMounted(() => {
  // preloadAlphabetSounds();
});

const startQuiz = () => {
  navigateTo("/alphabet/quiz");
};
</script>

<template>
  <div class="alphabet-view-container overflow-x-hidden mt-4">
    <AlphabetLearningMode @start-quiz="startQuiz" />
  </div>
</template>

<style scoped>
.alphabet-view-container {
  min-height: calc(100vh - 120px);
}
</style>
