<script setup lang="ts">
import confetti from "canvas-confetti";
import type { AlphabetStorybook } from "@/types/alphabet";
import InteractionZone from "@/components/InteractionZone.vue";
import { ALPHABET_STORYBOOK } from "~/constants/alphabetStorybook";

// ─── Data ────────────────────────────────────────────────────
const data = ALPHABET_STORYBOOK as AlphabetStorybook[];
const router = useRouter();
const { currentIndex, isSpeaking, challengeDone, showFinish, showChallenge, viewMode } =
  storeToRefs(useStorybookStore());
const { markCompleted, reset: resetStorybook } = useStorybookStore();
// const { syncAlphabet } = useSyncStore();

const interactionRef = ref<InstanceType<typeof InteractionZone> | null>(null);

const current = computed(() => data[currentIndex.value]!);

// ─── Navigation ──────────────────────────────────────────────
const goToList = () => {
  window.speechSynthesis.cancel();
  isSpeaking.value = false;
  viewMode.value = "list";
};

const goToLetter = async (index: number) => {
  if (index < 0 || index >= data.length) return;
  window.speechSynthesis.cancel();
  isSpeaking.value = false;
  showChallenge.value = false;
  currentIndex.value = index;
  viewMode.value = "story";
  await nextTick();
  interactionRef.value?.reset();
};

const prevLetter = () => goToLetter(currentIndex.value - 1);
const nextLetter = () => {
  if (currentIndex.value < data.length - 1) {
    goToLetter(currentIndex.value + 1);
  } else {
    launchFinishConfetti();
    showFinish.value = true;
  }
};

// ─── Phonics / Web Speech API ─────────────────────────────────
const buildPhonicsText = (entry: AlphabetStorybook): string => {
  const u = entry.letter.upper;
  const l = entry.letter.lower;
  return `Huruf ${u}. ${u} besar dan ${l} kecil. ${entry.title}. ${entry.story}`;
};

const speakLetter = () => {
  window.speechSynthesis.cancel();
  isSpeaking.value = true;
  const utterance = new SpeechSynthesisUtterance(buildPhonicsText(current.value));
  utterance.lang = "id-ID";
  utterance.rate = 0.85;
  utterance.pitch = 1.1;
  utterance.onend = utterance.onerror = () => {
    isSpeaking.value = false;
  };
  window.speechSynthesis.speak(utterance);
};

// Auto-narrate on letter change OR when entering story mode
watch(
  [currentIndex, viewMode],
  ([newIdx, newMode], [oldIdx, oldMode]) => {
    if (newMode === "story" && (newIdx !== oldIdx || newMode !== oldMode)) {
      speakLetter();
    }
  },
  { immediate: true },
);

// ─── Challenge callbacks ──────────────────────────────────────
const onSuccess = () => {
  markCompleted(currentIndex.value);
  setTimeout(() => nextLetter(), 1400);
};

const onFail = () => {
  /* InteractionZone handles visual feedback */
};

// ─── Finish confetti ──────────────────────────────────────────
const launchFinishConfetti = () => {
  const end = Date.now() + 4000;
  const frame = () => {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#FFD93D", "#6BCB77", "#4D96FF", "#ff9a9a", "#A084E8"],
      zIndex: 300,
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#FFD93D", "#6BCB77", "#4D96FF", "#ff9a9a", "#A084E8"],
      zIndex: 300,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
};

const restartStorybook = () => {
  resetStorybook();
  goToLetter(0);
};

// ─── Dot color helper ─────────────────────────────────────────
const progressDotClass = (idx: number) => {
  if (idx === currentIndex.value) return "bg-white scale-150 shadow-lg";
  if (challengeDone.value.has(idx)) return "bg-white/60";
  return "bg-white/25";
};

// ─── Emoji fallback map ─────────────────────────────────────────────────────────
const emojiMap: Record<string, string> = {
  A: "🍎",
  B: "⚽",
  C: "🍒",
  D: "🐑",
  E: "🦅",
  F: "📷",
  G: "🐘",
  H: "🚁",
  I: "🐟",
  J: "🦒",
  K: "🐈",
  L: "💡",
  M: "🥭",
  N: "🍍",
  O: "💊",
  P: "🍌",
  Q: "📖",
  R: "🏠",
  S: "🐄",
  T: "🎩",
  U: "🐪",
  V: "🏺",
  W: "🥕",
  X: "🎼",
  Y: "🪀",
  Z: "🦓",
};

// ─── Story text: highlight the current letter ─────────────────────────────────
const highlightedStory = computed(() => {
  const u = current.value.letter.upper;
  const l = current.value.letter.lower;
  return current.value.story.replace(
    new RegExp(`(${u}|${l})`, "g"),
    `<mark class="story-mark">$1</mark>`,
  );
});

// ─── Story image ──────────────────────────────────────────────
// Images live in /public as A.webp, B.webp, etc.
const imageError = ref(false);
const storyImageSrc = computed(() => `/${current.value.letter.upper}.webp`);

// Reset error flag whenever the letter changes
watch(currentIndex, () => {
  imageError.value = false;
});

onUnmounted(() => {
  // syncAlphabet();
});
</script>

<template>
  <!-- Full-bleed theme wrapper — transitions its color smoothly -->
  <div
    class="min-h-screen transition-colors duration-700 ease-in-out flex flex-col"
    :class="viewMode === 'story' ? current.themeColor : 'bg-slate-50'"
  >
    <!-- ── Top Bar ─────────────────────────────────────────── -->
    <header class="w-full max-w-5xl mx-auto flex items-center justify-between gap-3 p-4 md:p-6">
      <!-- Home/Back button -->
      <button
        v-if="viewMode === 'list'"
        @click="router.push('/')"
        class="bg-white/90 hover:bg-white hover:scale-105 active:scale-95 transition-all px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 font-bold text-gray-700 border-b-4 border-black/10"
      >
        🏠 <span class="hidden md:inline">Menu Utama</span>
      </button>
      <button
        v-else
        @click="goToList"
        class="bg-white/90 hover:bg-white hover:scale-105 active:scale-95 transition-all px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 font-bold text-gray-700 border-b-4 border-black/10"
      >
        🔙 <span class="hidden md:inline">Kembali</span>
      </button>

      <!-- Title + progress dots -->
      <div v-if="viewMode === 'story'" class="flex flex-col items-center gap-1.5 flex-1">
        <h1
          class="text-xl sm:text-3xl font-black text-white drop-shadow-md uppercase tracking-wide"
          style="font-family: &quot;Baloo Bhaijaan 2&quot;, sans-serif"
        >
          {{ current.title }}
        </h1>
        <!-- Progress dots -->
        <div class="flex flex-wrap justify-center gap-1">
          <button
            v-for="(entry, idx) in data"
            :key="entry.id"
            @click="goToLetter(idx)"
            :title="entry.letter.upper"
            class="w-2.5 h-2.5 rounded-full transition-all duration-300 hover:scale-125 focus:outline-none"
            :class="progressDotClass(idx)"
          />
        </div>
      </div>
      <div v-else class="flex flex-col items-center gap-1.5 flex-1">
        <h1
          class="text-xl sm:text-3xl font-black text-slate-700 drop-shadow-sm uppercase tracking-wide"
          style="font-family: &quot;Baloo Bhaijaan 2&quot;, sans-serif"
        >
          Buku Cerita Alfabet
        </h1>
      </div>

      <!-- Counter badge -->
      <div
        class="bg-white/90 px-4 py-2 rounded-2xl font-black text-gray-700 shadow-md text-sm border-b-4 border-black/10 flex items-center gap-1"
      >
        <span>⭐</span>
        <span>{{ challengeDone.size }}/{{ data.length }}</span>
      </div>
    </header>

    <!-- ── Main Area ─────────────────────────────── -->
    <main class="flex-1 w-full max-w-5xl mx-auto px-4 pb-4 flex flex-col">
      <transition name="fade" mode="out-in">
        <!-- LIST VIEW -->
        <div
          v-if="viewMode === 'list'"
          key="list-view"
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 content-start pb-8"
        >
          <button
            v-for="(entry, idx) in data"
            :key="entry.id"
            @click="goToLetter(idx)"
            class="relative bg-white rounded-[2rem] p-6 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all border-b-8 group outline-none"
            :class="
              challengeDone.has(idx) ? 'border-green-400 border-2 border-b-8' : 'border-slate-200'
            "
          >
            <div
              class="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"
              :class="entry.themeColor"
            >
              <span
                class="text-3xl sm:text-4xl font-black text-white drop-shadow-md"
                style="font-family: &quot;Baloo Bhaijaan 2&quot;, sans-serif"
                >{{ entry.letter.upper }}{{ entry.letter.lower }}</span
              >
            </div>
            <span class="text-sm font-bold text-slate-500 text-center leading-tight">{{
              entry.title
            }}</span>
            <div
              v-if="challengeDone.has(idx)"
              class="absolute -top-3 -right-3 text-3xl drop-shadow-md animate-bounce"
            >
              ⭐
            </div>
          </button>
        </div>

        <!-- STORY VIEW -->
        <div v-else key="story-view" class="flex flex-col flex-1 h-full w-full">
          <transition name="slide" mode="out-in">
            <div
              :key="currentIndex"
              class="relative bg-white rounded-[2.5rem] shadow-2xl flex flex-col flex-1 border-8 border-white/80 overflow-hidden min-h-[500px]"
            >
              <!-- Background Image -->
              <template v-if="!imageError">
                <img
                  :src="storyImageSrc"
                  :alt="current.title"
                  class="absolute inset-0 w-full h-full object-cover"
                  @error="imageError = true"
                  :key="'img-' + current.id"
                />
                <!-- Overlay to ensure text readability -->
                <div class="absolute inset-0 bg-black/30 pointer-events-none" />
              </template>
              <!-- Fallback: emoji + grey bg when no image -->
              <template v-else>
                <div
                  class="absolute inset-0 bg-slate-50 flex items-center justify-center overflow-hidden"
                >
                  <span
                    class="text-[15rem] select-none opacity-[0.15]"
                    style="animation: letter-bounce 3s ease-in-out infinite"
                    >{{ emojiMap[current.letter.upper] }}</span
                  >
                </div>
              </template>

              <!-- Top-left overlay: Large Letter -->
              <div
                class="absolute top-6 left-6 md:left-8 flex items-end gap-2 drop-shadow-xl z-10 pointer-events-none"
              >
                <span
                  class="font-black leading-none select-none text-white drop-shadow-lg"
                  style="
                    font-family: &quot;Baloo Bhaijaan 2&quot;, sans-serif;
                    font-size: clamp(4rem, 8vw, 6rem);
                    animation: letter-bounce 3s ease-in-out infinite;
                  "
                >
                  {{ current.letter.upper }}
                </span>
                <span
                  class="font-black leading-none select-none text-white/90 drop-shadow-lg mb-1"
                  style="
                    font-family: &quot;Baloo Bhaijaan 2&quot;, sans-serif;
                    font-size: clamp(2.5rem, 5vw, 4rem);
                  "
                >
                  {{ current.letter.lower }}
                </span>
              </div>

              <!-- Top-right overlay: Speak button -->
              <div class="absolute top-6 right-6 md:right-8 z-10 flex">
                <button
                  @click="speakLetter"
                  class="relative bg-yellow-400 hover:bg-yellow-300 active:scale-90 p-3 sm:p-4 rounded-full shadow-xl transition-all border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1"
                  :class="{ 'animate-pulse': isSpeaking }"
                >
                  <span class="text-3xl select-none">🔊</span>
                  <div
                    v-if="!isSpeaking"
                    class="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full animate-bounce font-black whitespace-nowrap shadow-md"
                  >
                    KETUK AKU!
                  </div>
                  <div
                    v-else
                    class="absolute -top-2 -right-2 bg-indigo-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black whitespace-nowrap shadow-md"
                  >
                    MEMBACA…
                  </div>
                </button>
              </div>

              <!-- Bottom Area: Floating Card for Text / Challenge -->
              <div class="mt-auto relative z-10 p-4 sm:p-6 flex flex-col items-center w-full">
                <div
                  class="bg-white/75 backdrop-blur-md shadow-2xl rounded-3xl p-6 sm:p-8 w-full max-w-3xl border-4 border-white/50 transition-all duration-300"
                >
                  <template v-if="!showChallenge">
                    <!-- Story View -->
                    <div class="space-y-4 text-center">
                      <h2
                        class="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        <span class="text-xl">📖</span> Ayo Baca!
                      </h2>
                      <p
                        class="text-xl md:text-2xl lg:text-3xl font-medium leading-normal text-slate-700 max-w-2xl mx-auto"
                        v-html="highlightedStory"
                      />
                      <!-- Continue to Challenge Button -->
                      <div class="pt-2">
                        <button
                          @click="showChallenge = true"
                          class="ui-capsule-interactive bg-green-500 border-green-700 text-white w-full sm:w-auto px-8 py-3 text-lg justify-center hover:bg-green-400"
                        >
                          <span class="font-black">Lanjut ke Tantangan 🎯</span>
                        </button>
                      </div>
                    </div>
                  </template>

                  <template v-else>
                    <!-- Challenge View -->
                    <div class="flex flex-col gap-6">
                      <div class="flex items-center justify-between w-full">
                        <button
                          @click="showChallenge = false"
                          class="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
                        >
                          <span>⬅️ Kembali</span>
                        </button>
                        <span class="text-sm font-black uppercase tracking-widest text-indigo-500"
                          >🎯 Tantangan</span
                        >
                        <div class="w-16"></div>
                        <!-- Spacer -->
                      </div>

                      <InteractionZone
                        ref="interactionRef"
                        :target="current.challenge.target"
                        :options="current.challenge.options"
                        :instruction="current.challenge.instruction"
                        :themeColor="current.themeColor"
                        @success="onSuccess"
                        @fail="onFail"
                      />
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </transition>

          <!-- ── Footer nav ──────────────────────────────────────── -->
          <footer class="w-full mx-auto flex gap-4 pt-6 pb-2">
            <button
              @click="prevLetter"
              :disabled="currentIndex === 0"
              class="flex-1 bg-white/30 hover:bg-white/60 disabled:opacity-30 disabled:cursor-not-allowed text-white hover:text-gray-700 py-4 rounded-3xl font-black text-lg transition-all shadow-lg border-b-6 border-black/15 active:border-b-0 active:translate-y-1.5 flex items-center justify-center gap-2"
            >
              ⬅️ <span class="hidden sm:inline">SEBELUMNYA</span>
            </button>

            <div class="flex flex-col items-center justify-center min-w-[4rem]">
              <span
                class="text-4xl font-black text-white drop-shadow-md"
                style="font-family: &quot;Baloo Bhaijaan 2&quot;, sans-serif"
              >
                {{ current.letter.upper }}
              </span>
              <span class="text-xs text-white/70 font-bold"
                >{{ currentIndex + 1 }} / {{ data.length }}</span
              >
            </div>

            <button
              @click="nextLetter"
              class="flex-1 bg-green-400 hover:bg-green-300 text-white py-4 rounded-3xl font-black text-lg transition-all shadow-lg border-b-6 border-green-600 active:border-b-0 active:translate-y-1.5 flex items-center justify-center gap-2"
            >
              <span class="hidden sm:inline">SELANJUTNYA</span> ➡️
            </button>
          </footer>
        </div>
      </transition>
    </main>

    <!-- ── Finish Screen ───────────────────────────────────── -->
    <transition name="pop-in">
      <div
        v-if="showFinish"
        class="fixed inset-0 z-200 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
        @click.self="showFinish = false"
      >
        <div
          class="glass-card p-8 sm:p-12 flex flex-col items-center gap-6 max-w-md w-full text-center"
        >
          <span class="text-8xl animate-bounce">🎉</span>
          <h2
            class="text-4xl font-black text-indigo-600"
            style="font-family: &quot;Baloo Bhaijaan 2&quot;, sans-serif"
          >
            Selamat!
          </h2>
          <p class="text-xl text-slate-600 font-semibold">
            Kamu sudah belajar semua huruf A sampai Z! Kamu hebat sekali! 🌟
          </p>
          <div class="flex flex-col sm:flex-row gap-4 w-full">
            <button
              @click="restartStorybook"
              class="ui-capsule-interactive bg-amber-400 border-amber-600 text-amber-900 w-full justify-center"
            >
              <span class="text-2xl">🔁</span>
              <span class="font-black">Ulangi</span>
            </button>
            <button
              @click="router.push('/')"
              class="ui-capsule-interactive bg-white border-slate-200 text-slate-700 w-full justify-center"
            >
              <span class="text-2xl">🏠</span>
              <span class="font-black">Beranda</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Letter idle bounce */
@keyframes letter-bounce {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

/* Page transition */
.slide-enter-active {
  animation: slide-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-leave-active {
  animation: slide-out 0.25s ease-in forwards;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.97);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes slide-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }

  to {
    opacity: 0;
    transform: translateY(-16px);
  }
}

/* Finish modal */
.pop-in-enter-active {
  animation: pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pop-in-leave-active {
  transition: opacity 0.2s ease;
}

.pop-in-leave-to {
  opacity: 0;
}

@keyframes pop {
  0% {
    transform: scale(0.7);
    opacity: 0;
  }

  60% {
    transform: scale(1.06);
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Story highlight mark */
:deep(.story-mark) {
  background: rgba(255, 220, 0, 0.55);
  border-radius: 4px;
  padding: 0 2px;
  font-weight: 900;
  color: #7c5200;
  box-shadow: 0 2px 0 rgba(202, 138, 4, 0.45);
}
</style>
