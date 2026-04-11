<script setup lang="ts">
defineOptions({ name: "AlphabetChallenge" });

const { activeProfileId } = storeToRefs(useProfileStore());
const { alphabetChallangeProgress } = storeToRefs(useAlphabetStore());
const { profile } = storeToRefs(useProfileStore());
const { fetch } = useAlphabetStore();

const { preloadSounds } = useAlphabetAudio();

callOnce(
  async () => await useAsyncData("alphabet-challenge-progress", () => fetch()),
);
onMounted(() => {
  preloadSounds();
});

const stopChallenge = async () => {
  //save state here
  await $fetch(`/api/alphabet/challange/${activeProfileId.value}/progress`, {
    method: "PATCH",
    body: {
      coins: profile.value.coins,
      progress: alphabetChallangeProgress.value,
    },
  });
  navigateTo("/alphabet");
};
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
