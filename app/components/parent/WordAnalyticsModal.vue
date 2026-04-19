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
              class="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-rose-100"
            >
              📖
            </div>
            <div>
              <h3 class="text-2xl font-black text-slate-800 font-quicksand">
                Laporan Belajar Kata
              </h3>
              <p class="text-sm font-bold text-slate-400">
                Analisis kata-kata yang sulit bagi anak.
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
        </div>

        <!-- Modal Footer -->
        <div
          class="p-6 bg-white border-t border-slate-100 flex items-center justify-between shrink-0"
        >
          <button
            @click="emit('switchToAlphabet')"
            class="flex items-center gap-2 text-indigo-600 font-black hover:-translate-x-1 transition-transform"
          >
            ← Laporan Huruf
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
