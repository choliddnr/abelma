<script setup lang="ts">
import { useAlphabetAudio } from "~/composables/useAlphabetAudio";
import { idLetterMap, getLetterColor } from "~/constants/alphabet";
import { ALPHABET_STORYBOOK } from "~/constants/alphabetStorybook";
import type { AlphabetStorybook } from "@/types/alphabet";
import TracingCanvas from "@/components/TracingCanvas.vue";
import AlphabetStoryOverlay from "@/components/alphabet/AlphabetStoryOverlay.vue";

const route = useRoute();
const router = useRouter();
const letter = ((route.params.id as string) || "A").toUpperCase(); // e.g. 'A'

const { playLetterSound } = useAlphabetAudio();
const { changeCoins } = useProfileStore();

// Phases: 'intro' -> 'object' -> 'trace'
// (Story is handled as an overlay on top of 'object')
type Phase = "intro" | "object" | "trace";
const currentPhase = ref<Phase>("intro");

// --- Story Integration ---
const showStoryOverlay = ref(false);
const isSpeakingStory = ref(false);

const data = ALPHABET_STORYBOOK as AlphabetStorybook[];
const currentStory = computed(() => {
  return data.find((d) => d.letter.upper === letter) || null;
});

const emojiMap = computed(() => {
  const map: Record<string, string> = {};
  for (const k in idLetterMap) {
    if (Object.prototype.hasOwnProperty.call(idLetterMap, k)) {
      map[k] = idLetterMap[k]!.emoji;
    }
  }
  return map;
});

const buildPhonicsText = (entry: AlphabetStorybook): string => {
  const u = entry.letter.upper;
  const l = entry.letter.lower;
  return `Huruf ${u}. ${u} besar dan ${l} kecil. ${entry.title}. ${entry.story}`;
};

const speakStory = () => {
  const story = currentStory.value;
  if (!story) return;
  window.speechSynthesis.cancel();
  isSpeakingStory.value = true;
  const utterance = new SpeechSynthesisUtterance(buildPhonicsText(story));
  utterance.lang = "id-ID";
  utterance.rate = 0.85;
  utterance.pitch = 1.1;
  utterance.onend = utterance.onerror = () => {
    isSpeakingStory.value = false;
  };
  window.speechSynthesis.speak(utterance);
};

const openStory = () => {
  showStoryOverlay.value = true;
  speakStory();
};

const closeStory = () => {
  showStoryOverlay.value = false;
  window.speechSynthesis.cancel();
  isSpeakingStory.value = false;
};

const onStorySuccess = () => {
  // Upon completing the story challenge, close story and proceed to TRACE phase
  closeStory();
  currentPhase.value = "trace";
};

// --- Tracing Integration ---
const tracingCanvasRef = ref<InstanceType<typeof TracingCanvas> | null>(null);
const showResult = ref(false);
const scoreResult = ref({ score: 0, stars: 0, coverage: 0, accuracy: 0 });
const coinsEarned = ref(0);
const showIncompleteToast = ref(false);

const clearTracing = () => {
  if (tracingCanvasRef.value) {
    tracingCanvasRef.value.clearCanvas();
  }
};

const onSaved = () => {
  if (tracingCanvasRef.value) {
    const result = tracingCanvasRef.value.calculateScore();

    if (result.score === 0) {
      showIncompleteToast.value = true;
      setTimeout(() => {
        showIncompleteToast.value = false;
      }, 3000);
      return;
    }

    scoreResult.value = result;

    if (result.stars === 5) {
      coinsEarned.value = 15;
      changeCoins(15);
    } else if (result.stars === 4) {
      coinsEarned.value = 10;
      changeCoins(10);
    } else if (result.stars === 3) {
      coinsEarned.value = 5;
      changeCoins(5);
    } else if (result.stars === 2) {
      coinsEarned.value = 2;
      changeCoins(2);
    } else {
      coinsEarned.value = 0;
    }

    showResult.value = true;
  }
};

const retryTrace = () => {
  showResult.value = false;
  clearTracing();
};

const goBackToAlphabet = () => router.push(`/alphabet`);

// --- Interaction Handlers ---
const playIntroSound = () => {
  playLetterSound(letter, true);
};

const gotoObjectPhase = () => {
  currentPhase.value = "object";
};

onMounted(() => {
  // Optional: auto-play sound on mount
  playIntroSound();
});

onUnmounted(() => {
  window.speechSynthesis.cancel();
});
</script>

<template>
  <div
    class="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-6xl mx-auto px-4 py-8 relative"
  >
    <!-- PHASE 1: INTRO (Fast Mode equivalent) -->
    <transition name="fade-scale" mode="out-in">
      <div
        v-if="currentPhase === 'intro'"
        key="intro"
        class="flex flex-col items-center gap-12 w-full"
      >
        <h1
          class="text-4xl md:text-5xl font-black text-slate-500 tracking-wide bg-white/80 px-8 py-4 rounded-full shadow-sm text-center"
        >
          Ayo Belajar Huruf-nya!
        </h1>
        <button
          @click="playIntroSound"
          class="aspect-square bg-white border-8 border-primary rounded-full shadow-2xl flex items-center justify-center w-64 h-64 md:w-80 md:h-80 hover:scale-105 active:scale-95 transition-transform"
        >
          <span
            class="text-[180px] md:text-[240px] font-black leading-none text-accent animate-bounce font-baloo"
          >
            {{ letter }}
          </span>
        </button>
        <p class="text-2xl font-bold text-gray-500">
          Klik hurufnya untuk mendengar suaranya!
        </p>

        <button
          @click="gotoObjectPhase"
          class="btn-primary mt-8 px-12 py-6 text-3xl flex items-center gap-4 hover:-translate-y-1 transition-transform"
        >
          Lanjut ➡️
        </button>
      </div>

      <!-- PHASE 2: OBJECT CORRELATION -->
      <div
        v-else-if="currentPhase === 'object'"
        key="object"
        class="flex flex-col items-center gap-12 w-full animate-entrance"
      >
        <h1
          class="text-4xl md:text-5xl font-black text-blue-600 tracking-wide bg-white/80 px-8 py-4 rounded-full shadow-sm text-center mb-4"
        >
          Huruf ini untuk apa ya? 🤔
        </h1>

        <div
          class="glass-card p-12 w-full flex flex-col md:flex-row items-center justify-around gap-12"
        >
          <div
            class="text-[200px] md:text-[300px] font-black leading-none text-accent drop-shadow-xl font-baloo"
          >
            {{ letter }}
          </div>

          <div class="flex flex-col items-center gap-6">
            <div
              class="text-[120px] md:text-[200px] bg-white rounded-full w-48 h-48 md:w-64 md:h-64 flex items-center justify-center shadow-lg border-8 hover:scale-110 transition-transform"
              :class="'border-' + getLetterColor(letter)!.replace('bg-', '')"
            >
              {{ idLetterMap[letter]?.emoji || "❓" }}
            </div>
            <div class="text-center space-y-2">
              <p class="text-3xl font-bold text-gray-500">untuk...</p>
              <h2
                class="text-6xl md:text-8xl font-black text-danger tracking-wide"
              >
                {{ idLetterMap[letter]?.word || "???" }}
              </h2>
            </div>
          </div>
        </div>

        <div class="flex gap-6 mt-6">
          <button
            @click="currentPhase = 'intro'"
            class="btn-bubble bg-white px-8 py-6 text-2xl font-bold text-gray-700 border-4 border-gray-300"
          >
            ⬅️ Kembali
          </button>

          <button
            @click="openStory"
            class="btn-primary bg-yellow-400 hover:bg-yellow-300 border-yellow-600 shadow-yellow-600/50 text-yellow-900 flex items-center gap-4 px-12 py-6 text-3xl hover:-translate-y-1"
          >
            <span>📖</span> Ayo Baca Cerita!
          </button>
        </div>
      </div>

      <!-- PHASE 3 is handled via the Story Overlay -->

      <!-- PHASE 4: TRACING -->
      <div
        v-else-if="currentPhase === 'trace'"
        key="trace"
        class="flex flex-col items-center justify-center gap-8 w-full animate-entrance h-full"
      >
        <h1
          class="text-4xl md:text-5xl font-black text-green-600 tracking-wide text-center bg-white/80 px-8 py-4 rounded-full shadow-sm w-full max-w-4xl mx-auto shrink-0 mb-2"
        >
          Terakhir, Ayo Belajar Menulis! ✍️
        </h1>

        <!-- Canvas Container -->
        <div
          class="w-full h-[600px] max-w-5xl relative bg-white/50 backdrop-blur-md rounded-[40px] p-6 shadow-xl border-4 border-white flex-1 min-h-[400px]"
        >
          <TracingCanvas ref="tracingCanvasRef" :letter="letter" />
        </div>

        <!-- Actions -->
        <div class="flex gap-6 mt-2 shrink-0">
          <button
            @click="currentPhase = 'object'"
            class="btn-bubble bg-white px-6 py-4 text-xl font-bold text-gray-700 border-4 border-gray-300 mr-4 shadow-md"
          >
            ⬅️ Kembali Cerita
          </button>

          <button
            @click="clearTracing"
            class="flex items-center gap-2 bg-red-100/80 hover:bg-red-200 text-red-600 px-8 py-4 rounded-full font-bold text-2xl border-4 border-red-300 shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <span>🔄</span> Ulangi Tulisan
          </button>

          <button
            @click="onSaved"
            class="flex items-center gap-2 bg-green-400 hover:bg-green-500 text-white px-12 py-4 rounded-full font-black text-2xl border-b-8 border-green-600 shadow-xl transition-transform hover:-translate-y-1 active:translate-y-2"
          >
            <span>🌟</span> Selesai!
          </button>
        </div>
      </div>
    </transition>

    <!-- Overlay & Modals -->
    <!-- Story Overlay for Phase 3 (triggered from Phase 2) -->
    <AlphabetStoryOverlay
      v-if="showStoryOverlay"
      :currentStory="currentStory"
      :isSpeakingStory="isSpeakingStory"
      :data="data"
      :emojiMap="emojiMap"
      @close="closeStory"
      @speak="speakStory"
    />
    <!-- @prev="
        /* Disable prev/next in single journey mode, or implement if needed */
      "
      @next="/* Disable prev/next */"
      @success="onStorySuccess"
      @fail="/* optional handle fail */" -->

    <!-- Result Modal Overlay (from Tracing) -->
    <div
      v-if="showResult"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        class="bg-white rounded-[40px] p-8 max-w-lg w-full shadow-2xl border-8 border-blue-400 flex flex-col items-center text-center animate-bounce-in"
      >
        <h2 class="text-4xl font-black text-blue-600 mb-6 drop-shadow-sm">
          {{
            scoreResult.stars === 5
              ? "Sempurna!"
              : scoreResult.stars === 4
                ? "Luar Biasa!"
                : scoreResult.stars === 3
                  ? "Bagus Sekali!"
                  : scoreResult.stars === 2
                    ? "Cukup Bagus"
                    : "Ayo Coba Lagi!"
          }}
        </h2>

        <div class="flex gap-4 text-6xl mb-6">
          <span
            v-for="i in 5"
            :key="i"
            class="transition-all duration-500 transform"
            :class="
              i <= scoreResult.stars
                ? 'text-yellow-400 scale-110 drop-shadow-lg'
                : 'text-gray-300 scale-90 grayscale'
            "
            >⭐</span
          >
        </div>

        <div
          v-if="coinsEarned > 0"
          class="bg-yellow-100 border-4 border-yellow-400 text-yellow-700 px-6 py-3 rounded-full text-2xl font-bold mb-8 flex items-center gap-2"
        >
          <span>💰</span> +{{ coinsEarned }} Koin!
        </div>
        <div v-else class="text-xl font-bold text-gray-500 mb-8">
          Gambar lebih rapi untuk dapat koin!
        </div>

        <div class="flex gap-4 w-full">
          <button
            @click="retryTrace"
            class="flex-1 btn-bubble bg-gray-100 text-gray-700 font-bold text-xl py-4 border-4 border-gray-300"
          >
            Ulangi
          </button>
          <button
            @click="goBackToAlphabet"
            class="flex-1 btn-primary text-xl py-4"
          >
            Selesai Belajar
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notification (Incomplete Trace) -->
    <transition name="toast">
      <div
        v-if="showIncompleteToast"
        class="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-red-500 border-4 border-red-300 text-white px-8 py-4 rounded-full font-bold text-2xl shadow-2xl flex items-center gap-4"
      >
        <span class="text-3xl">⚠️</span> Sepertinya kamu belum selesai
        menggambar! Ayo coba lagi! 😊
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.animate-entrance {
  animation: entrance 0.5s ease-out forwards;
}

@keyframes entrance {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}

.font-baloo {
  font-family: "Baloo Bhaijaan 2", sans-serif;
}
</style>
