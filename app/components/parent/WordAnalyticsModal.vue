<script setup lang="ts">
import { wordCategories } from "~/constants/words";

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "switchToAlphabet"): void;
}>();

const { activeProfileId } = storeToRefs(useProfileStore());
const { analyticsMap } = storeToRefs(useAnalyticsStore());

const strugglingWords = computed(() => {
  if (!activeProfileId.value) return [];
  const analytics = analyticsMap.value[activeProfileId.value] || {};
  const allWords = wordCategories.flatMap((c) => c.words);

  return Object.entries(analytics)
    .filter(([id]) => id.length > 1)
    .map(([id, data]) => {
      const word = allWords.find((w) => w.id === id);
      return {
        word: word?.word || id,
        emoji: word?.emoji || "❓",
        mistakes: data.mistakes,
      };
    })
    .filter((item) => item.mistakes > 0)
    .sort((a, b) => b.mistakes - a.mistakes);
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
    title="Laporan Belajar Kata"
    subtitle="Analisis kata-kata yang sulit bagi anak."
    icon="📖"
    icon-class="bg-rose-500 shadow-rose-100"
    @close="emit('close')"
  >
    <div v-if="strugglingWords.length > 0" class="space-y-6">
      <p
        class="text-slate-500 font-bold text-sm uppercase tracking-wider italic"
      >
        Anak sering bingung pada kata-kata ini:
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="item in strugglingWords"
          :key="item.word"
          class="flex items-center gap-4 bg-rose-50 p-4 rounded-2xl border-2 border-rose-100 shadow-xs group"
        >
          <span
            class="text-4xl group-hover:scale-125 transition-transform duration-300"
            >{{ item.emoji }}</span
          >
          <div class="flex-1">
            <p
              class="font-black text-rose-700 uppercase font-quicksand text-lg"
            >
              {{ item.word }}
            </p>
            <p class="text-rose-500 text-xs font-bold">
              {{ item.mistakes }} kali keliru eja/tebak
            </p>
          </div>
          <div class="w-3 h-3 rounded-full bg-rose-400 animate-pulse"></div>
        </div>
      </div>
    </div>
    <div
      v-else
      class="bg-emerald-50 p-12 rounded-3xl border-2 border-emerald-100 flex flex-col items-center gap-4 text-center"
    >
      <span class="text-6xl animate-bounce">🌟</span>
      <div>
        <h4 class="font-black text-emerald-800 text-2xl mb-1">
          Wah, Sangat Bagus!
        </h4>
        <p class="text-emerald-600 font-bold text-lg">
          Belum ada hambatan berarti pada belajar kata. Terus semangat!
        </p>
      </div>
    </div>

    <template #footer>
      <button
        @click="emit('switchToAlphabet')"
        class="flex items-center gap-2 text-indigo-600 font-black hover:-translate-x-1 transition-transform"
      >
        ← Laporan Huruf
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
