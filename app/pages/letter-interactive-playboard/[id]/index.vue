<script setup lang="ts">
import { useAlphabetAudio } from "~/composables/useAlphabetAudio";
import { idLetterMap, getLetterColor } from "~/constants/alphabet";
import { ALPHABET_STORYBOOK } from "~/constants/alphabetStorybook";
import type { AlphabetStorybook } from "@/types/alphabet";
import TracingCanvas from "@/components/TracingCanvas.vue";
import AlphabetStoryOverlay from "@/components/alphabet/AlphabetStoryOverlay.vue";

const route = useRoute();
const router = useRouter();
const letter = ((route.params.id as string) || "A").toUpperCase();

const { playLetterSound } = useAlphabetAudio();
const { changeCoins } = useProfileStore();

// --- Playboard State ---
const isTracingMode = ref(false);

const goBackToAlphabet = () => router.push(`/alphabet`);

// --- Object Correlation Audio ---
const playObjectWord = () => {
  const word = idLetterMap[letter]?.word || "???";
  // Attempt to bounce the emoji visually using basic CSS class toggle if needed
  const el = document.getElementById("object-emoji");
  if (el) {
    el.classList.remove("animate-bounce");
    void el.offsetWidth; // trigger reflow
    el.classList.add("animate-bounce");
  }

  // Play word
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "id-ID";
  utterance.rate = 0.85;
  utterance.pitch = 1.1;
  window.speechSynthesis.speak(utterance);
};

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

// --- Initial interaction ---
onMounted(() => {
  // Let's greet with the sound immediately
  playLetterSound(letter, true);
});

onUnmounted(() => {
  window.speechSynthesis.cancel();
});
</script>

<template>
  <div class="flex flex-col min-h-screen w-full bg-[#f8fafc] relative overflow-hidden">
    
    <!-- Header Navigation -->
    <header class="w-full flex justify-between items-center p-6 sm:px-12 pt-8 z-20">
      <button
        @click="goBackToAlphabet"
        class="btn-bubble bg-white px-6 py-3 text-xl font-bold text-gray-700 border-4 border-gray-300 shadow-md flex items-center gap-2 hover:scale-105 transition-transform"
      >
        <span>⬅️</span> Kembali
      </button>

      <!-- Central Pill indicating where we are -->
      <div class="hidden md:flex bg-white/80 backdrop-blur-md border-4 border-white shadow-sm px-6 py-2 rounded-full text-lg font-black text-slate-500 uppercase tracking-widest">
        Area Bermain Huruf
      </div>

      <button
        @click="openStory"
        class="btn-bubble bg-yellow-400 border-yellow-500 text-yellow-900 px-6 py-3 text-xl font-bold shadow-[0_4px_0_#ca8a04] active:shadow-none active:translate-y-1 transition-all flex items-center gap-2"
      >
        <span>📖</span> Buku Cerita
      </button>
    </header>

    <!-- Main Workspace -->
    <main class="flex-1 flex flex-col items-center justify-center p-4 h-full relative z-10 w-full max-w-6xl mx-auto gap-8 transition-all duration-500">
      
      <!-- EXPLORE MODE -->
      <transition name="fade-slide" mode="out-in">
        <div v-if="!isTracingMode" key="explore" class="flex flex-col items-center w-full gap-8 mt-4 animate-entrance">
          
          <div class="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-24 w-full">
            
            <!-- The Big Letter -->
            <button
              @click="playLetterSound(letter, true)"
              class="relative aspect-square flex items-center justify-center w-64 h-64 md:w-80 md:h-80 bg-white border-8 rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95 group focus:outline-none"
              :class="'border-' + getLetterColor(letter)!.replace('bg-', '')"
            >
              <div class="absolute -top-3 -right-3 text-2xl font-black bg-blue-500 text-white px-4 py-1 rounded-full shadow-lg -rotate-12 pointer-events-none group-hover:animate-bounce">
                Ketuk aku!
              </div>
              <span class="text-[180px] md:text-[240px] font-black leading-none font-baloo select-none group-hover:rotate-6 transition-transform text-accent drop-shadow-md">
                {{ letter }}
              </span>
            </button>

            <!-- Object Correlation Widget -->
            <button
              @click="playObjectWord"
              class="flex flex-col items-center justify-center bg-white rounded-4xl shadow-xl border-4 border-slate-100 p-8 w-64 md:w-80 group hover:shadow-2xl transition-all focus:outline-none hover:-translate-y-2"
            >
              <div id="object-emoji" class="text-[120px] md:text-[150px] leading-none mb-4 drop-shadow-sm group-hover:scale-110 transition-transform">
                {{ idLetterMap[letter]?.emoji || "❓" }}
              </div>
              <div class="w-full h-px bg-slate-200 mb-4"></div>
              <h2 class="text-4xl md:text-5xl font-black text-rose-500 tracking-wide uppercase font-quicksand drop-shadow-sm">
                {{ idLetterMap[letter]?.word || "???" }}
              </h2>
            </button>

          </div>

          <!-- Trace Mode Toggle -->
          <button
            @click="isTracingMode = true"
            class="mt-8 flex items-center gap-4 bg-green-400 hover:bg-green-500 text-white px-12 py-5 rounded-full font-black text-3xl border-b-8 border-green-600 shadow-xl transition-transform hover:-translate-y-1 active:translate-y-2 active:border-b-0"
          >
            <span>✍️</span> Ayo Menulis!
          </button>
        </div>

        <!-- TRACE MODE -->
        <div v-else key="trace" class="flex flex-col items-center w-full h-full max-w-4xl mx-auto animate-entrance">
          <div class="flex items-center justify-between w-full mb-6">
            <h1 class="text-3xl md:text-5xl font-black text-green-500 tracking-wide bg-white/70 px-8 py-3 rounded-full shadow-sm mx-auto text-center">
              Belajar Menulis Huruf {{ letter }}
            </h1>
          </div>

          <div class="w-full h-[55vh] md:h-[600px] relative bg-white/50 backdrop-blur-md rounded-[40px] p-6 shadow-2xl border-8 border-white border-b-[12px]">
            <TracingCanvas ref="tracingCanvasRef" :letter="letter" />
          </div>

          <div class="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-8">
            <button
              @click="isTracingMode = false"
              class="flex items-center gap-2 btn-bubble bg-gray-100 px-6 py-4 text-xl font-bold text-gray-600 border-4 border-gray-300 hover:bg-gray-200"
            >
              <span>⬅️</span> Batal
            </button>

            <button
              @click="clearTracing"
              class="flex items-center gap-2 btn-bubble bg-rose-100 hover:bg-rose-200 text-rose-600 px-8 py-4 text-xl font-bold border-4 border-rose-300 shadow-sm"
            >
              <span>🔄</span> Ulangi
            </button>

            <button
              @click="onSaved"
              class="flex items-center gap-2 bg-green-400 hover:bg-green-500 text-white px-10 py-4 rounded-full font-black text-2xl border-b-8 border-green-600 shadow-xl transition-transform hover:-translate-y-1 active:translate-y-2 active:border-b-0"
            >
              <span>🌟</span> Selesai!
            </button>
          </div>
        </div>
      </transition>
    </main>

    <!-- Overlay & Modals -->
    <!-- Story Overlay -->
    <AlphabetStoryOverlay
      v-if="showStoryOverlay"
      :currentStory="currentStory"
      :isSpeakingStory="isSpeakingStory"
      :data="data"
      :emojiMap="emojiMap"
      @close="closeStory"
      @speak="speakStory"
      @success="closeStory" 
    />

    <!-- Trace Result Modal -->
    <div
      v-if="showResult"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div class="bg-white rounded-[40px] p-8 max-w-lg w-full shadow-2xl border-8 border-blue-400 flex flex-col items-center text-center animate-bounce-in">
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
            :class="i <= scoreResult.stars ? 'text-yellow-400 scale-110 drop-shadow-lg' : 'text-gray-300 scale-90 grayscale'"
          >⭐</span>
        </div>

        <div v-if="coinsEarned > 0" class="bg-yellow-100 border-4 border-yellow-400 text-yellow-700 px-6 py-3 rounded-full text-2xl font-bold mb-8 flex items-center gap-2 shadow-sm">
          <span>💰</span> +{{ coinsEarned }} Koin!
        </div>
        <div v-else class="text-xl font-bold text-gray-500 mb-8">
          Gambar lebih rapi untuk dapat koin!
        </div>

        <div class="flex gap-4 w-full">
          <button @click="retryTrace" class="flex-1 btn-bubble bg-gray-100 text-gray-700 font-bold text-xl py-4 border-4 border-gray-300 hover:bg-gray-200 shadow-sm">
            Ulangi
          </button>
          <button @click="isTracingMode = false; showResult = false;" class="flex-1 btn-primary text-xl py-4 shadow-md">
            Selesai
          </button>
        </div>
      </div>
    </div>

    <!-- Trace Toast -->
    <transition name="toast">
      <div v-if="showIncompleteToast" class="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] bg-rose-500 border-4 border-rose-300 text-white px-8 py-4 rounded-full font-bold text-xl md:text-2xl shadow-2xl flex items-center gap-4 whitespace-nowrap">
        <span class="text-3xl">⚠️</span> Belum selesai menggambar! Ayo coba lagi! 😊
      </div>
    </transition>

  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.animate-entrance {
  animation: entrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes entrance {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-bounce-in {
  animation: bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes bounceIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 50px);
}

.font-baloo {
  font-family: 'Baloo Bhaijaan 2', sans-serif;
}
.font-quicksand {
  font-family: 'Quicksand', sans-serif;
}
</style>
