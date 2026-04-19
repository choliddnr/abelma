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
              class="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-indigo-100"
            >
              🔤
            </div>
            <div>
              <h3 class="text-2xl font-black text-slate-800 font-quicksand">
                Laporan Belajar Huruf
              </h3>
              <p class="text-sm font-bold text-slate-400">
                Progres tantangan dan buku cerita.
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
        </div>

        <!-- Modal Footer -->
        <div
          class="p-6 bg-white border-t border-slate-100 flex items-center justify-between shrink-0"
        >
          <button
            @click="emit('switchToWord')"
            class="flex items-center gap-2 text-rose-600 font-black hover:translate-x-1 transition-transform"
          >
            Laporan Kata →
          </button>

          <UiButton @click="emit('close')" variant="white"> Tutup </UiButton>
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
