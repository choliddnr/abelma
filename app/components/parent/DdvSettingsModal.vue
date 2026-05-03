<script setup lang="ts">
import { useNotification } from "~/composables/useNotification";

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "switchToCvc"): void;
}>();

const { saveConfig, fetch } = useDdvStore();
const { ddvProgress } = storeToRefs(useDdvStore());
const { activeProfileId } = storeToRefs(useProfileStore());

const lastSavedSettings = ref<string>("");
const isSaving = ref(false);

// Use local state for editing
const config = ref<any>({
  coinReward: 5,
  levelUpReward: 50,
  learningLevelUpReward: 50,
  streakThreshold: 5,
  streakReward: 10,
});

// Watch for store changes to update local state
watch(
  () => ddvProgress.value.config,
  (newVal) => {
    if (newVal) {
      config.value = { ...newVal };
      if (!lastSavedSettings.value) {
        lastSavedSettings.value = JSON.stringify(newVal);
      }
    }
  },
  { immediate: true, deep: true },
);

const hasChanges = computed(() => {
  return JSON.stringify(config.value) !== lastSavedSettings.value;
});

const notification = useNotification();

const handleSave = async () => {
  if (!activeProfileId.value) return;

  isSaving.value = true;
  try {
    const success = await saveConfig(activeProfileId.value, config.value);
    if (success) {
      lastSavedSettings.value = JSON.stringify(config.value);
      notification.success("Pengaturan Vokal Rangkap berhasil disimpan! ✨");
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
    title="Pengaturan Vokal Rangkap"
    subtitle="Sesuaikan hadiah koin dan sistem streak untuk Vokal Rangkap."
    icon="🧩"
    icon-class="bg-teal-500 shadow-teal-100"
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
                v-model.number="config.coinReward"
                min="0"
                max="100"
                class="w-full text-center text-sm font-black p-3 rounded-xl border-2 border-slate-200 focus:border-teal-400 focus:outline-none bg-slate-50/50"
              />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-black text-slate-500 uppercase">Bonus Lvl Up (Kuis)</label>
              <input
                type="number"
                v-model.number="config.levelUpReward"
                min="0"
                max="1000"
                class="w-full text-center text-sm font-black p-3 rounded-xl border-2 border-slate-200 focus:border-teal-400 focus:outline-none bg-slate-50/50"
              />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-black text-slate-500 uppercase">Bonus Selesai Belajar</label>
              <input
                type="number"
                v-model.number="config.learningLevelUpReward"
                min="0"
                max="1000"
                class="w-full text-center text-sm font-black p-3 rounded-xl border-2 border-slate-200 focus:border-teal-400 focus:outline-none bg-slate-50/50"
              />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-black text-slate-500 uppercase">Batas Streak</label>
              <input
                type="number"
                v-model.number="config.streakThreshold"
                min="1"
                max="20"
                class="w-full text-center text-sm font-black p-3 rounded-xl border-2 border-slate-200 focus:border-teal-400 focus:outline-none bg-slate-50/50"
              />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-black text-slate-500 uppercase">Bonus Streak</label>
              <input
                type="number"
                v-model.number="config.streakReward"
                min="0"
                max="500"
                class="w-full text-center text-sm font-black p-3 rounded-xl border-2 border-slate-200 focus:border-teal-400 focus:outline-none bg-slate-50/50"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="p-6 bg-teal-50 rounded-3xl border-2 border-teal-100 text-teal-800 text-sm leading-relaxed shadow-sm">
        <strong class="font-black text-base flex items-center gap-2 mb-1">
          <span>💡</span> Tips Orang Tua
        </strong>
        Vokal Rangkap (Diftong & Cluster) adalah tahap lanjutan setelah anak menguasai huruf dan kata dasar. 
        Memberikan <span class="font-black underline">Hadiah Benar</span> yang sedikit lebih tinggi dapat membantu anak tetap semangat saat menghadapi tantangan vokal yang lebih kompleks.
      </div>
    </div>

    <template #footer>
      <button
        @click="emit('switchToCvc')"
        class="flex items-center gap-2 text-teal-600 font-black hover:-translate-x-1 transition-transform"
      >
        ← Pengaturan Lab CVC
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
