<script setup lang="ts">
import { idLetterMap } from "~/constants/alphabet";

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "switchToWord"): void;
}>();

const { activeProfileId } = storeToRefs(useProfileStore());
const { analyticsMap } = storeToRefs(useAnalyticsStore());
const { alphabetQuizProgress } = storeToRefs(useAlphabetStore());
const { profileProgressMap } = storeToRefs(useStorybookStore());

const strugglingLetters = computed(() => {
  if (!activeProfileId.value) return [];
  const analytics = analyticsMap.value[activeProfileId.value] || {};

  return Object.entries(analytics)
    .filter(([id]) => id.length === 1)
    .map(([id, data]) => {
      const upperId = id.toUpperCase();
      const letterData = idLetterMap[upperId];
      return {
        letter: upperId,
        emoji: letterData?.emoji || "❓",
        mistakes: data.mistakes,
      };
    })
    .filter((item) => item.mistakes > 0)
    .sort((a, b) => b.mistakes - a.mistakes);
});

const storyProgress = computed(() => {
  if (!activeProfileId.value) return 0;
  const completedIndices = profileProgressMap.value[activeProfileId.value] || [];
  return Math.round((completedIndices.length / 26) * 100);
});

// Prevent scrolling when modal is open
watch(
  () => props.isOpen,
  (val) => {
    if (process.client) {
      document.body.style.overflow = val ? "hidden" : "";
    }
  },
);
</script>

<template>
  <SharedBaseModal
    :is-open="isOpen"
    title="Laporan Belajar Huruf"
    subtitle="Progres tantangan dan buku cerita."
    icon="🔤"
    icon-class="bg-indigo-500 shadow-indigo-100"
    @close="emit('close')"
  >
    <div class="space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Quiz Progress Card -->
        <div
          class="bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-100 shadow-sm"
        >
          <div class="flex items-center justify-between mb-4">
            <h5
              class="font-black text-indigo-700 uppercase text-xs tracking-widest"
            >
              Progres Tantangan
            </h5>
            <span
              class="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full"
              >LEVEL {{ alphabetQuizProgress.level }}</span
            >
          </div>
          <div class="flex items-end gap-2">
            <span class="text-4xl font-black text-indigo-900">{{
              alphabetQuizProgress.score
            }}</span>
            <span class="text-indigo-400 font-bold mb-1"
              >Poin Terkumpul</span
            >
          </div>
        </div>

        <!-- Storybook Progress Card -->
        <div
          class="bg-amber-50 p-6 rounded-3xl border-2 border-amber-100 shadow-sm"
        >
          <div class="flex items-center justify-between mb-4">
            <h5
              class="font-black text-amber-700 uppercase text-xs tracking-widest"
            >
              Buku Cerita
            </h5>
            <span class="text-amber-600 font-black text-xs"
              >{{ Math.round((storyProgress / 100) * 26) }}/26
              Selesai</span
            >
          </div>
          <div class="space-y-2">
            <div
              class="h-4 bg-amber-200/50 rounded-full overflow-hidden border border-amber-200"
            >
              <div
                class="h-full bg-amber-400 transition-all duration-1000 ease-out"
                :style="{ width: `${storyProgress}%` }"
              ></div>
            </div>
            <p class="text-amber-600 font-bold text-xs">
              {{ storyProgress }}% petualangan huruf selesai
            </p>
          </div>
        </div>
      </div>

      <!-- Struggling Letters -->
      <div v-if="strugglingLetters.length > 0" class="space-y-4">
        <p
          class="text-slate-500 font-bold text-sm uppercase tracking-wider italic"
        >
          Huruf yang perlu perhatian lebih:
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <div
            v-for="item in strugglingLetters"
            :key="item.letter"
            class="flex flex-col items-center gap-2 bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-xs hover:border-indigo-200 transition-colors group"
          >
            <span
              class="text-3xl group-hover:scale-110 transition-transform"
              >{{ item.emoji }}</span
            >
            <div class="text-center">
              <p
                class="font-black text-slate-800 text-2xl font-quicksand"
              >
                {{ item.letter }}
              </p>
              <p class="text-rose-500 text-[10px] font-bold">
                {{ item.mistakes }} kali keliru
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        v-else
        class="bg-emerald-50 p-12 rounded-3xl border-2 border-emerald-100 flex flex-col items-center gap-4 text-center"
      >
        <span class="text-6xl animate-bounce">✨</span>
        <p class="text-emerald-700 font-bold text-lg">
          Hebat! Si kecil menguasai semua huruf dengan baik.
        </p>
      </div>
    </div>

    <template #footer>
      <button
        @click="emit('switchToWord')"
        class="flex items-center gap-2 text-rose-600 font-black hover:translate-x-1 transition-transform"
      >
        Laporan Kata →
      </button>

      <UiButton @click="emit('close')" variant="white"> Tutup </UiButton>
    </template>
  </SharedBaseModal>
</template>

<style scoped>
.font-quicksand {
  font-family: "Quicksand", sans-serif;
}
</style>
