<script setup lang="ts">
import { wordCategories } from "~/constants/words";

const { activeProfileId, profiles } = storeToRefs(useProfileStore());
const { analyticsMap } = storeToRefs(useAnalyticsStore());

const strugglingWords = computed(() => {
  if (!activeProfileId.value) return [];
  const analytics = analyticsMap.value[activeProfileId.value] || {};
  const allWords = wordCategories.flatMap((c) => c.words);

  return Object.entries(analytics)
    .map(([id, data]) => {
      const word = allWords.find((w) => w.id === id);
      return {
        word: word?.word || id,
        emoji: word?.emoji || "❓",
        mistakes: data.mistakes,
      };
    })
    .filter((item) => item.mistakes > 0)
    .sort((a, b) => b.mistakes - a.mistakes)
    .slice(0, 5);
});
</script>

<template>
  <div class="flex-1 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
    <div v-if="activeProfileId" class="space-y-6">
      <div class="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 class="text-xl font-black text-slate-800">
          Laporan:
          {{ profiles.find((p: any) => p.id === activeProfileId)?.name }}
        </h3>
      </div>

      <div v-if="strugglingWords.length > 0" class="space-y-4">
        <p class="text-slate-500 font-bold text-sm uppercase tracking-wider italic">
          Anak sering bingung pada kata-kata ini:
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="item in strugglingWords"
            :key="item.word"
            class="flex items-center gap-4 bg-rose-50 p-4 rounded-2xl border-2 border-rose-100 shadow-xs group"
          >
            <span class="text-4xl group-hover:scale-125 transition-transform duration-300">{{
              item.emoji
            }}</span>
            <div class="flex-1">
              <p class="font-black text-rose-700 uppercase font-quicksand text-lg">
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
          <h4 class="font-black text-emerald-800 text-2xl mb-1">Wah, Sangat Bagus!</h4>
          <p class="text-emerald-600 font-bold text-lg">
            Belum ada hambatan berarti. Terus dukung semangat belajarnya ya!
          </p>
        </div>
      </div>

      <!-- Section for future Alphabet analytics -->
      <div class="mt-8 pt-8 border-t border-slate-100 opacity-50 grayscale pointer-events-none">
        <h4 class="font-black text-slate-500 text-sm uppercase tracking-widest mb-4">
          Laporan Huruf (Segera Hadir)
        </h4>
        <div
          class="h-24 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center"
        >
          <span class="font-bold text-slate-400">Menunggu integrasi data huruf...</span>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-12">
      <p class="text-slate-500 font-bold">Silakan pilih profil anak...</p>
    </div>
  </div>
</template>

<style scoped>
.font-quicksand {
  font-family: "Quicksand", sans-serif;
}
</style>
