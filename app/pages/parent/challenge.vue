<script setup lang="ts">
import type { ChallengeLevelConfig } from "@/types/stores";

const { activeProfileId } = storeToRefs(useProfileStore());
const { alphabetChallangeProgress } = storeToRefs(useAlphabetStore());

const levelLabels = ["Pemula", "Mantap", "Berwaktu", "Sprint"];

const updateConfigField = async (
  levelIndex: number,
  field: keyof ChallengeLevelConfig,
  value: number,
) => {
  if (!activeProfileId.value) return;

  // Use store method ideally, but for now we're just updating the reactive progress
  const config = alphabetChallangeProgress.value?.challengeConfig;
  if (!config) return;

  const updatedConfig = [...config];
  updatedConfig[levelIndex] = {
    ...updatedConfig[levelIndex],
    [field]: Math.max(0, Number(value)),
  } as ChallengeLevelConfig;

  alphabetChallangeProgress.value.challengeConfig = updatedConfig;
};
</script>

<template>
  <div
    class="flex-1 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300"
  >
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-xl font-black text-slate-700">
          Pengaturan Tantangan Huruf
        </h3>
        <p class="text-sm font-semibold text-slate-400 mt-1">
          Sesuaikan level kesulitan untuk kemampuan anak.
        </p>
      </div>
    </div>

    <div
      v-if="!activeProfileId"
      class="bg-slate-50 p-8 rounded-3xl text-center text-slate-400 font-bold"
    >
      Pilih profil anak terlebih dahulu.
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-12">
      <div
        v-for="(cfg, idx) in alphabetChallangeProgress?.challengeConfig || []"
        :key="idx"
        class="bg-white/70 backdrop-blur-md rounded-4xl border-4 border-white/50 p-8 space-y-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      >
        <!-- Level Header -->
        <div class="flex items-center gap-4 pb-4 border-b border-slate-200/50">
          <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg"
            :class="
              [
                'bg-sky-400',
                'bg-emerald-400',
                'bg-amber-400',
                'bg-rose-400',
              ][idx] || 'bg-slate-400'
            "
          >
            {{ idx + 1 }}
          </div>
          <div>
            <p class="font-black text-slate-800 text-xl font-quicksand">
              Level {{ idx + 1 }}
            </p>
            <p
              class="text-xs font-bold text-slate-400 uppercase tracking-widest"
            >
              {{ levelLabels[idx] || "Kustom" }}
            </p>
          </div>
        </div>

        <!-- Fields -->
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-4">
            <div>
              <label class="text-sm font-black text-slate-600"
                >Target Bobot</label
              >
              <p class="text-xs text-slate-400">
                Berapa kali benar sebelum naik level
              </p>
            </div>
            <input
              type="number"
              min="1"
              max="10"
              :value="cfg.targetWeight"
              @change="
                updateConfigField(
                  idx,
                  'targetWeight',
                  ($event.target as HTMLInputElement).valueAsNumber,
                )
              "
              class="w-20 text-center text-lg font-black p-2 rounded-2xl border-2 border-slate-100 focus:border-violet-400 focus:outline-none"
            />
          </div>

          <div class="flex items-center justify-between gap-4">
            <div>
              <label class="text-sm font-black text-slate-600"
                >Timer (detik)</label
              >
              <p class="text-xs text-slate-400">0 = tidak ada batas waktu</p>
            </div>
            <input
              type="number"
              min="0"
              max="60"
              :value="cfg.timer"
              @change="
                updateConfigField(
                  idx,
                  'timer',
                  ($event.target as HTMLInputElement).valueAsNumber,
                )
              "
              class="w-20 text-center text-lg font-black p-2 rounded-2xl border-2 border-slate-100 focus:border-violet-400 focus:outline-none"
            />
          </div>

          <div class="flex items-center justify-between gap-4">
            <div>
              <label class="text-sm font-black text-slate-600"
                >Target Beruntun 🔥</label
              >
              <p class="text-xs text-slate-400">0 = tidak ada bonus</p>
            </div>
            <input
              type="number"
              min="0"
              max="20"
              :value="cfg.streak"
              @change="
                updateConfigField(
                  idx,
                  'streak',
                  ($event.target as HTMLInputElement).valueAsNumber,
                )
              "
              class="w-20 text-center text-lg font-black p-2 rounded-2xl border-2 border-slate-100 focus:border-violet-400 focus:outline-none"
            />
          </div>

          <div class="flex items-center justify-between gap-4">
            <div>
              <label class="text-sm font-black text-slate-600"
                >Bonus Koin 🪙</label
              >
              <p class="text-xs text-slate-400"> Hadiah saat beruntun tercapai </p>
            </div>
            <input
              type="number"
              min="0"
              max="500"
              :value="cfg.streakReward"
              @change="
                updateConfigField(
                  idx,
                  'streakReward',
                  ($event.target as HTMLInputElement).valueAsNumber,
                )
              "
              class="w-20 text-center text-lg font-black p-2 rounded-2xl border-2 border-slate-100 focus:border-violet-400 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-quicksand {
  font-family: "Quicksand", sans-serif;
}
</style>
