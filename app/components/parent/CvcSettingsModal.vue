<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "switchToWord"): void;
}>();

const { saveConfig, fetch } = useCvcStore();
const { cvcProgress } = storeToRefs(useCvcStore());
const { activeProfileId } = storeToRefs(useProfileStore());

const lastSavedSettings = ref<string>("");
const isSaving = ref(false);

// Use local state for editing
const localConfig = ref<any>({});

// Watch for store changes to update local state
watch(
  () => cvcProgress.value.config,
  (newVal) => {
    if (newVal) {
      localConfig.value = JSON.parse(JSON.stringify(newVal));
      if (!lastSavedSettings.value) {
        lastSavedSettings.value = JSON.stringify(newVal);
      }
    }
  },
  { immediate: true, deep: true },
);

const hasChanges = computed(() => {
  return JSON.stringify(localConfig.value) !== lastSavedSettings.value;
});

const notification = useNotification();

const handleSave = async () => {
  if (!activeProfileId.value) return;

  isSaving.value = true;
  try {
    const success = await saveConfig(activeProfileId.value, localConfig.value);
    if (success) {
      lastSavedSettings.value = JSON.stringify(localConfig.value);
      notification.success("Pengaturan Lab Kata berhasil disimpan! ✨");
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
    title="Pengaturan Lab Kata"
    subtitle="Sesuaikan hadiah koin dan sistem streak untuk CVC."
    icon="🧪"
    icon-class="bg-indigo-500 shadow-indigo-100"
    @close="emit('close')"
  >
    <div class="space-y-8">
      <div class="bg-white rounded-4xl border-2 border-slate-100 p-6 space-y-6 shadow-sm">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-black text-slate-500 uppercase">Hadiah Benar 🪙</label>
              <input
                type="number"
                v-model.number="localConfig.coinReward"
                min="0"
                max="100"
                class="w-full text-center text-sm font-black p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:outline-none bg-slate-50/50"
              />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-black text-slate-500 uppercase">Bonus Lvl Up (Kuis)</label>
              <input
                type="number"
                v-model.number="localConfig.levelUpReward"
                min="0"
                max="1000"
                class="w-full text-center text-sm font-black p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:outline-none bg-slate-50/50"
              />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-black text-slate-500 uppercase">Bonus Lvl Up (Belajar)</label>
              <input
                type="number"
                v-model.number="localConfig.learningLevelUpReward"
                min="0"
                max="1000"
                class="w-full text-center text-sm font-black p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:outline-none bg-slate-50/50"
              />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-black text-slate-500 uppercase">Batas Streak</label>
              <input
                type="number"
                v-model.number="localConfig.streakThreshold"
                min="1"
                max="20"
                class="w-full text-center text-sm font-black p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:outline-none bg-slate-50/50"
              />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-black text-slate-500 uppercase">Bonus Streak</label>
              <input
                type="number"
                v-model.number="localConfig.streakReward"
                min="0"
                max="500"
                class="w-full text-center text-sm font-black p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:outline-none bg-slate-50/50"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="p-6 bg-indigo-50 rounded-3xl border-2 border-indigo-100 text-indigo-800 text-sm leading-relaxed shadow-sm">
        <strong class="font-black text-base flex items-center gap-2 mb-1">
          <span>💡</span> Tips Orang Tua
        </strong>
        Lab Kata (CVC) membantu anak mengenali bunyi konsonan akhir. Memberikan bonus koin yang lebih besar saat <span class="font-black underline">Naik Level Belajar</span> dapat memotivasi anak untuk menyelesaikan tantangan yang lebih sulit.
      </div>
    </div>

    <template #footer>
      <button
        @click="emit('switchToWord')"
        class="flex items-center gap-2 text-indigo-600 font-black hover:-translate-x-1 transition-transform"
      >
        ← Pengaturan Kata
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
