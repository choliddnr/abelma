<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "switchToAlphabet"): void;
}>();

const { saveConfig } = useWordStore();
const { wordQuizProgress } = storeToRefs(useWordStore());
const { activeProfileId } = storeToRefs(useProfileStore());

const lastSavedWordSettings = ref<string>("");
const isSaving = ref(false);

// Use local state for editing to allow "Cancel" or "Save" pattern
const localConfig = ref<any>({});

// Watch for store changes to update local state
watch(
  () => wordQuizProgress.value.quizConfig,
  (newVal) => {
    if (newVal) {
      localConfig.value = JSON.parse(JSON.stringify(newVal));
      if (!lastSavedWordSettings.value) {
        lastSavedWordSettings.value = JSON.stringify(newVal);
      }
    }
  },
  { immediate: true, deep: true },
);

const hasChanges = computed(() => {
  return JSON.stringify(localConfig.value) !== lastSavedWordSettings.value;
});

const notification = useNotification();

const handleSave = async () => {
  if (!activeProfileId.value) return;

  isSaving.value = true;
  try {
    const success = await saveConfig(activeProfileId.value, localConfig.value);
    if (success) {
      lastSavedWordSettings.value = JSON.stringify(localConfig.value);
      notification.success("Pengaturan berhasil disimpan! ✨");
    } else {
      notification.error("Gagal menyimpan pengaturan. Silakan coba lagi.");
    }
  } catch (e) {
    console.error("Save error:", e);
    notification.error("Terjadi kesalahan saat menyimpan pengaturan.");
  } finally {
    isSaving.value = false;
  }
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
    title="Pengaturan Belajar Kata"
    subtitle="Sesuaikan gaya tulisan dan timer untuk kuis kata."
    icon="📖"
    icon-class="bg-violet-500 shadow-violet-100"
    @close="emit('close')"
  >
    <div class="space-y-8">
      <div class="bg-white rounded-4xl border-2 border-slate-100 p-6 space-y-6 shadow-sm">
        <div class="space-y-4">
          <div class="grid grid-cols-2 md:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-sm font-black text-slate-500 uppercase whitespace-nowrap">Hadiah 🪙</label>
              <input
                type="number"
                v-model.number="localConfig.coinReward"
                min="0"
                max="100"
                class="w-full text-center text-sm font-black p-2 rounded-xl border-2 border-slate-200 focus:border-violet-400 focus:outline-none bg-slate-50/50"
              />
            </div>
            <div class="space-y-1">
              <label class="text-sm font-black text-slate-500 uppercase whitespace-nowrap">Bonus Lvl Up</label>
              <input
                type="number"
                v-model.number="localConfig.levelUpReward"
                min="0"
                max="1000"
                class="w-full text-center text-sm font-black p-2 rounded-xl border-2 border-slate-200 focus:border-violet-400 focus:outline-none bg-slate-50/50"
              />
            </div>
            <div class="space-y-1">
              <label class="text-sm font-black text-slate-500 uppercase whitespace-nowrap">Batas Streak</label>
              <input
                type="number"
                v-model.number="localConfig.streakThreshold"
                min="1"
                max="20"
                class="w-full text-center text-sm font-black p-2 rounded-xl border-2 border-slate-200 focus:border-violet-400 focus:outline-none bg-slate-50/50"
              />
            </div>
            <div class="space-y-1">
              <label class="text-sm font-black text-slate-500 uppercase whitespace-nowrap">Bonus Streak</label>
              <input
                type="number"
                v-model.number="localConfig.streakReward"
                min="0"
                max="500"
                class="w-full text-center text-sm font-black p-2 rounded-xl border-2 border-slate-200 focus:border-violet-400 focus:outline-none bg-slate-50/50"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="p-6 bg-amber-50 rounded-3xl border-2 border-amber-100 text-amber-800 text-sm leading-relaxed shadow-sm">
        <strong class="font-black text-base flex items-center gap-2 mb-1">
          <span>💡</span> Tips Orang Tua
        </strong>
        Kini <span class="font-black underline">Waktu Kuis</span> dan <span class="font-black underline">Gaya Tulisan</span> (Huruf Kapital / Kecil) akan otomatis menyesuaikan dengan tingkat level anak Anda untuk memberikan pengalaman belajar yang lebih adaptif dan menantang!
      </div>
    </div>

    <template #footer>
      <button
        @click="emit('switchToAlphabet')"
        class="flex items-center gap-2 text-sky-600 font-black hover:-translate-x-1 transition-transform"
      >
        ← Pengaturan Huruf
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
