<script setup lang="ts">
import type { QuizLevelConfig } from "@/types/stores";

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "switchToWord"): void;
}>();

const { alphabetQuizProgress } = storeToRefs(useAlphabetStore());
const { saveConfig } = useAlphabetStore();
const { activeProfileId } = storeToRefs(useProfileStore());

const levelLabels = ["Pemula", "Mantap", "Berwaktu", "Sprint"];
const lastSavedConfig = ref<string>("");
const isSaving = ref(false);

// Watch for initial load to set baseline
watch(
  () => alphabetQuizProgress.value?.quizConfig,
  (newVal) => {
    if (newVal && !lastSavedConfig.value) {
      lastSavedConfig.value = JSON.stringify(newVal);
    }
  },
  { immediate: true },
);

const hasChanges = computed(() => {
  return (
    alphabetQuizProgress.value?.quizConfig &&
    JSON.stringify(alphabetQuizProgress.value.quizConfig) !== lastSavedConfig.value
  );
});

const handleSave = async () => {
  if (!activeProfileId.value || !alphabetQuizProgress.value?.quizConfig) return;

  isSaving.value = true;
  try {
    const success = await saveConfig(
      activeProfileId.value,
      alphabetQuizProgress.value.quizConfig,
    );
    if (success) {
      lastSavedConfig.value = JSON.stringify(alphabetQuizProgress.value.quizConfig);
    }
  } catch (e) {
    console.error("Save error:", e);
  } finally {
    isSaving.value = false;
  }
};

const updateConfigField = (
  levelIndex: number,
  field: keyof QuizLevelConfig,
  value: number,
) => {
  if (!activeProfileId.value) return;

  const config = alphabetQuizProgress.value?.quizConfig;
  if (!config) return;

  const updatedConfig = [...config];
  updatedConfig[levelIndex] = {
    ...updatedConfig[levelIndex],
    [field]: Math.max(0, Number(value)),
  } as QuizLevelConfig;

  alphabetQuizProgress.value.quizConfig = updatedConfig;
};

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
    title="Pengaturan Tantangan Huruf"
    subtitle="Sesuaikan tingkat kesulitan untuk setiap level."
    icon="🔤"
    icon-class="bg-sky-500 shadow-sky-100"
    @close="emit('close')"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="(cfg, idx) in alphabetQuizProgress?.quizConfig || []"
        :key="idx"
        class="bg-white rounded-4xl border-2 border-slate-100 p-6 space-y-6 shadow-sm"
      >
        <!-- Level Header -->
        <div class="flex items-center gap-4 pb-4 border-b border-slate-50">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-lg"
            :class="
              ['bg-sky-400', 'bg-emerald-400', 'bg-amber-400', 'bg-rose-400'][idx] ||
              'bg-slate-400'
            "
          >
            {{ idx + 1 }}
          </div>
          <div>
            <p class="font-black text-slate-800 font-quicksand">Level {{ idx + 1 }}</p>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {{ levelLabels[idx] || "Kustom" }}
            </p>
          </div>
        </div>

        <!-- Fields -->
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-4">
            <div>
              <label class="text-xs font-black text-slate-600">Target Bobot</label>
              <p class="text-[10px] text-slate-400 italic">Benar untuk naik level</p>
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
              class="w-16 text-center text-base font-black p-2 rounded-xl border-2 border-slate-50 focus:border-sky-400 focus:outline-none"
            />
          </div>

          <div class="flex items-center justify-between gap-4">
            <div>
              <label class="text-xs font-black text-slate-600">Timer (detik)</label>
              <p class="text-[10px] text-slate-400 italic">0 = tanpa batas</p>
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
              class="w-16 text-center text-base font-black p-2 rounded-xl border-2 border-slate-50 focus:border-sky-400 focus:outline-none"
            />
          </div>

          <div class="flex items-center justify-between gap-4">
            <div>
              <label class="text-xs font-black text-slate-600">Streak 🔥</label>
              <p class="text-[10px] text-slate-400 italic">Target beruntun</p>
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
              class="w-16 text-center text-base font-black p-2 rounded-xl border-2 border-slate-50 focus:border-sky-400 focus:outline-none"
            />
          </div>

          <div class="flex items-center justify-between gap-4">
            <div>
              <label class="text-xs font-black text-slate-600">Koin 🪙</label>
              <p class="text-[10px] text-slate-400 italic">Bonus hadiah</p>
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
              class="w-16 text-center text-base font-black p-2 rounded-xl border-2 border-slate-50 focus:border-sky-400 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button
        @click="emit('switchToWord')"
        class="flex items-center gap-2 text-violet-600 font-black hover:translate-x-1 transition-transform"
      >
        Pengaturan Kata →
      </button>

      <UiButton
        :disabled="!hasChanges"
        :loading="isSaving"
        @click="handleSave"
        variant="success"
        class="shadow-lg shadow-emerald-200"
      >
        <span class="flex items-center gap-2 px-2">
          <span v-if="!isSaving">💾</span>
          Simpan Perubahan
        </span>
      </UiButton>
    </template>
  </SharedBaseModal>
</template>

<style scoped>
.font-quicksand {
  font-family: "Quicksand", sans-serif;
}
</style>
