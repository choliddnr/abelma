<script setup lang="ts">
defineOptions({ name: "AlphabetQuiz" });

const { activeProfileId } = storeToRefs(useProfileStore());
const { alphabetQuizProgress } = storeToRefs(useAlphabetStore());
const { profile } = storeToRefs(useProfileStore());
const { fetch } = useAlphabetStore();

const { preloadSounds } = useTTS();

callOnce(async () => await useAsyncData("alphabet-quiz-progress", () => fetch()));
onMounted(() => {
  preloadSounds();
});

const stopQuiz = async () => {
  //save state here
  await $fetch(`/api/alphabet/quiz/${activeProfileId.value}/progress`, {
    method: "PATCH",
    body: {
      coins: profile.value.coins,
      progress: alphabetQuizProgress.value,
    },
  });
  navigateTo("/alphabet");
};
</script>

<template>
  <div class="alphabet-view-container overflow-x-hidden mt-4">
    <AlphabetQuizMode @stop-quiz="stopQuiz" />
  </div>
</template>

<style scoped>
.alphabet-view-container {
  min-height: calc(100vh - 120px);
}
</style>
