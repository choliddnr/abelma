<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "switchToAlphabet"): void;
}>();

const { saveConfig } = useWordStore();
const { wordChallengeProgress } = storeToRefs(useWordStore());
const { activeProfileId } = storeToRefs(useProfileStore());

const lastSavedWordSettings = ref<string>("");
const isSaving = ref(false);

// Use local state for editing to allow "Cancel" or "Save" pattern
const localLevels = ref<any[]>([]);

// Watch for store changes to update local state
watch(
  () => wordChallengeProgress.value.challengeConfig,
  (newVal) => {
    if (newVal && newVal.length > 0) {
      localLevels.value = JSON.parse(JSON.stringify(newVal));
      if (!lastSavedWordSettings.value) {
        lastSavedWordSettings.value = JSON.stringify(newVal);
      }
    }
  },
  { immediate: true, deep: true },
);

const hasChanges = computed(() => {
  return JSON.stringify(localLevels.value) !== lastSavedWordSettings.value;
});

const notification = useNotification();

const handleSave = async () => {
  if (!activeProfileId.value) return;

  isSaving.value = true;
  try {
    const success = await saveConfig(activeProfileId.value, localLevels.value);
    if (success) {
      lastSavedWordSettings.value = JSON.stringify(localLevels.value);
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
  <Transition name="modal">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        @click="emit('close')"
      ></div>

      <!-- Modal Container -->
      <div
        class="relative w-full max-w-4xl bg-slate-50 rounded-[3rem] shadow-2xl border-4 border-white overflow-hidden flex flex-col max-h-[90vh] animate-bounce-in"
      >
        <!-- Modal Header -->
        <div
          class="p-6 md:p-8 bg-white border-b border-slate-100 flex items-center justify-between shrink-0"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-2xl bg-violet-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-violet-100"
            >
              📖
            </div>
            <div>
              <h3 class="text-2xl font-black text-slate-800 font-quicksand">
                Pengaturan Belajar Kata
              </h3>
              <p class="text-sm font-bold text-slate-400">
                Sesuaikan gaya tulisan dan timer untuk kuis kata.
              </p>
            </div>
          </div>

          <button
            @click="emit('close')"
            class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div class="space-y-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="(cfg, idx) in localLevels"
                :key="idx"
                class="bg-white rounded-4xl border-2 border-slate-100 p-6 space-y-6 shadow-sm"
              >
                <!-- Level Header -->
                <div
                  class="flex items-center gap-4 pb-4 border-b border-slate-50"
                >
                  <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-lg"
                    :class="
                      [
                        'bg-violet-400',
                        'bg-indigo-400',
                        'bg-purple-400',
                        'bg-pink-400',
                      ][idx] || 'bg-slate-400'
                    "
                  >
                    {{ idx + 1 }}
                  </div>
                  <div>
                    <p class="font-black text-slate-800 font-quicksand">
                      Level {{ idx + 1 }}
                    </p>
                    <p
                      class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                    >
                      {{
                        ["Pemula", "Terampil", "Mahir", "Sultan"][idx] ||
                        "Kustom"
                      }}
                    </p>
                  </div>
                </div>

                <!-- Fields -->
                <div class="space-y-4">
                  <!-- Case Selection -->
                  <div class="space-y-2">
                    <label class="text-xs font-black text-slate-600"
                      >Gaya Tulisan</label
                    >
                    <div class="flex gap-2">
                      <button
                        v-for="c in ['uppercase', 'lowercase', 'mixed']"
                        :key="c"
                        @click="cfg.letterCase = c as any"
                        class="flex-1 py-2 px-1 rounded-xl border-2 text-[10px] font-black uppercase transition-all"
                        :class="
                          cfg.letterCase === c
                            ? 'bg-violet-50 border-violet-500 text-violet-700 shadow-sm'
                            : 'bg-white border-slate-50 text-slate-400 opacity-60'
                        "
                      >
                        {{
                          c === "uppercase"
                            ? "ABC"
                            : c === "lowercase"
                              ? "abc"
                              : "AbC"
                        }}
                      </button>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <label
                        class="text-[10px] font-black text-slate-500 uppercase"
                        >Waktu (s)</label
                      >
                      <input
                        type="number"
                        v-model.number="cfg.timer"
                        min="0"
                        max="60"
                        class="w-full text-center text-sm font-black p-2 rounded-xl border-2 border-slate-50 focus:border-violet-400 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                    <div class="space-y-1">
                      <label
                        class="text-[10px] font-black text-slate-500 uppercase"
                        >Hadiah 🪙</label
                      >
                      <input
                        type="number"
                        v-model.number="cfg.coinReward"
                        min="0"
                        max="100"
                        class="w-full text-center text-sm font-black p-2 rounded-xl border-2 border-slate-50 focus:border-violet-400 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                    <div class="space-y-1">
                      <label
                        class="text-[10px] font-black text-slate-500 uppercase"
                        >Opsi Kata</label
                      >
                      <input
                        type="number"
                        v-model.number="cfg.numOptions"
                        min="2"
                        max="6"
                        class="w-full text-center text-sm font-black p-2 rounded-xl border-2 border-slate-50 focus:border-violet-400 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="p-6 bg-amber-50 rounded-3xl border-2 border-amber-100 text-amber-800 text-sm leading-relaxed shadow-sm"
            >
              <strong class="font-black text-base flex items-center gap-2 mb-1">
                <span>💡</span> Tips Orang Tua
              </strong>
              Gunakan
              <span class="font-black underline">Huruf Kecil</span> untuk anak
              yang sudah mulai membaca, dan
              <span class="font-black underline">Mixed (AbC)</span> untuk
              tantangan lebih tinggi yang memadukan huruf kapital dan kecil
              secara acak.
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div
          class="p-6 bg-white border-t border-slate-100 flex items-center justify-between shrink-0"
        >
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
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.font-quicksand {
  font-family: "Quicksand", sans-serif;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@keyframes bounce-in {
  0% {
    transform: scale(0.9) translateY(10px);
    opacity: 0;
  }
  50% {
    transform: scale(1.05) translateY(-5px);
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.animate-bounce-in {
  animation: bounce-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
