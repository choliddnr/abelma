<script setup lang="ts">
import { letters, getLetterColor } from "~/constants/alphabet";
import { DEFAULT_ALPHABET_QUIZ_CONFIG } from "~/constants/alphabet";
import { useTTS } from "~/composables/useTTS";
import confetti from "canvas-confetti";

const emit = defineEmits(["stop-quiz"]);

const router = useRouter();
const { isSpeaking: speaking, playLetterSound, speak } = useTTS();
const { alphabetQuizProgress: alphabetProgress } = storeToRefs(useAlphabetStore());
const { changeCoins } = useProfileStore();
// const { syncAlphabet } = useSyncStore();

// Game State from Store
// const alphabetProgress = getCurrentAlphabetState();
const score = ref(alphabetProgress.value.score);
const level = ref(alphabetProgress.value.level);
const letterWeights = ref<Record<string, number>>(alphabetProgress.value.weights);

const quizConfig = computed(() =>
  alphabetProgress.value.quizConfig && alphabetProgress.value.quizConfig.length > 0
    ? alphabetProgress.value.quizConfig
    : DEFAULT_ALPHABET_QUIZ_CONFIG,
);

const currentConfig = computed(() => {
  const index = Math.max(0, level.value - 1);
  return (
    quizConfig.value[index] ||
    quizConfig.value[quizConfig.value.length - 1] ||
    DEFAULT_ALPHABET_QUIZ_CONFIG[0]!
  );
});

// Sync with store (local -> store)
watch(
  [score, level, letterWeights],
  () => {
    alphabetProgress.value.score = score.value;
    alphabetProgress.value.level = level.value;
    alphabetProgress.value.weights = letterWeights.value;
  },
  { deep: true },
);

// Sync from store (store -> local) when fetched from server
watch(
  () => alphabetProgress.value,
  (newProgress) => {
    if (newProgress) {
      score.value = newProgress.score;
      level.value = newProgress.level;
      letterWeights.value = newProgress.weights;
    }
  },
);

const celebrationData = ref({
  show: false,
  title: "",
  message: "",
  rewardAmount: null as number | null,
  footerText: "",
  mainEmoji: "",
});
const lastEarnedReward = ref(0);

const streak = ref(0);
const feedback = ref<{ message: string; type: "success" | "error" | null }>({
  message: "",
  type: null,
});
const wrongLetter = ref("");
const isUpperCase = ref(true);
const targetLetter = ref("");
const quizLetters = ref([...letters]);
const timeLeft = ref(0);
const timerInterval = ref<number | null>(null);
const mistakeMadeInCurrentLevel = ref(false);

// Game Logic
const shuffleLetters = (arrayToShuffle: string[]) => {
  const array = [...arrayToShuffle];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j]!;
    array[j] = temp!;
  }
  return array;
};

const targetWeight = computed(() => currentConfig.value.targetWeight);

const progressPercentage = computed(() => {
  const allLetters = [...letters, ...letters.map((l) => l.toLowerCase())];
  const currentTotalWeight = allLetters.reduce(
    (sum, l) => sum + Math.max(0, letterWeights.value[l] || 0),
    0,
  );
  const requiredTarget = mistakeMadeInCurrentLevel.value ? targetWeight.value : 1;
  const maxTotalWeight = requiredTarget * allLetters.length;
  return Math.min(100, Math.max(0, (currentTotalWeight / maxTotalWeight) * 100));
});

const pickNextLetter = (lastLetter: string = ""): string => {
  const currentTargetWeight = currentConfig.value.targetWeight;
  const allLetters = [...letters, ...letters.map((l) => l.toLowerCase())];
  let candidates = allLetters.filter(
    (l) => l !== lastLetter && (letterWeights.value[l] || 0) < currentTargetWeight,
  );
  if (candidates.length === 0) return allLetters[0]!;
  const minCurrentWeight = Math.min(...candidates.map((l) => letterWeights.value[l] || 0));
  const minWeightCandidates = candidates.filter(
    (l) => (letterWeights.value[l] || 0) === minCurrentWeight,
  );
  if (minWeightCandidates.length > 0) candidates = minWeightCandidates;
  const randomIndex = Math.floor(Math.random() * candidates.length);
  const picked = candidates[randomIndex]!;
  return picked;
};

const checkLevelUp = (): "leveled-up" | "completed" | false => {
  const allLetters = [...letters, ...letters.map((l) => l.toLowerCase())];
  const minWeight = Math.min(...allLetters.map((l) => letterWeights.value[l] || 0));
  const requiredWeight = mistakeMadeInCurrentLevel.value ? targetWeight.value : 1;
  if (minWeight >= requiredWeight) {
    allLetters.forEach((l) => (letterWeights.value[l] = 0));
    mistakeMadeInCurrentLevel.value = false;
    if (level.value < quizConfig.value.length) {
      level.value++;
      return "leveled-up";
    } else {
      return "completed";
    }
  }
  return false;
};

const stopTimer = () => {
  if (timerInterval.value) {
    window.clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
};

const startTimer = () => {
  stopTimer();
  const duration = currentConfig.value.timer;
  if (duration > 0) {
    timeLeft.value = duration;
    timerInterval.value = window.setInterval(() => {
      if (!speaking.value) timeLeft.value--;
      if (timeLeft.value <= 0) handleTimeout();
    }, 1000);
  }
};

const handleTimeout = () => {
  stopTimer();
  score.value = Math.max(0, score.value - 5);
  if (targetLetter.value) {
    letterWeights.value[targetLetter.value] = (letterWeights.value[targetLetter.value] || 0) - 0.5;
  }
  mistakeMadeInCurrentLevel.value = true;
  feedback.value = {
    message: "Waktu habis! Memuat huruf baru...",
    type: "error",
  };
  speak("Waktu habis. Dengarkan suara, lalu pilih huruf yang benar!");
  wrongLetter.value = targetLetter.value;
  setTimeout(() => {
    wrongLetter.value = "";
    if (level.value >= 2) quizLetters.value = shuffleLetters(letters);
    const nextLetter = pickNextLetter(targetLetter.value);
    targetLetter.value = nextLetter;
    isUpperCase.value = nextLetter === nextLetter.toUpperCase();
    feedback.value = {
      message: "Dengarkan suara, lalu pilih huruf yang benar!",
      type: null,
    };
    playLetterSound(targetLetter.value);
    startTimer();
  }, 2000);
};

const launchConfetti = () => {
  const duration = 3000;
  const end = Date.now() + duration;
  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#FFD93D", "#6BCB77", "#4D96FF", "#ff9a9a", "#A084E8"],
      zIndex: 100,
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#FFD93D", "#6BCB77", "#4D96FF", "#ff9a9a", "#A084E8"],
      zIndex: 100,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
};

const isProcessingClick = ref(false);
const isQuizCompleted = ref(false);

const handleLetterClick = async (letter: string) => {
  if (
    speaking.value ||
    isProcessingClick.value ||
    celebrationData.value.show ||
    isQuizCompleted.value
  )
    return;
  isProcessingClick.value = true;
  const currentTarget = isUpperCase.value ? targetLetter.value : targetLetter.value.toUpperCase();

  if (letter === currentTarget) {
    stopTimer();
    streak.value++;
    const multiplier = Math.min(2, 1 + streak.value * 0.1);
    const earnedCoins = Math.round(10 * multiplier);
    changeCoins(earnedCoins);
    score.value += earnedCoins;

    const caseCorrectLetter = isUpperCase.value
      ? targetLetter.value
      : targetLetter.value.toLowerCase();
    letterWeights.value[caseCorrectLetter] = (letterWeights.value[caseCorrectLetter] || 0) + 1;

    const levelStatus = checkLevelUp();
    const leveledUp = levelStatus === "leveled-up";
    const completed = levelStatus === "completed";

    let gotReward = false;
    const config = currentConfig.value;
    if (config.streak > 0 && streak.value > 0 && streak.value % config.streak === 0) {
      gotReward = true;
      lastEarnedReward.value = config.streakReward;
      changeCoins(config.streakReward);
    }

    if (gotReward) {
      celebrationData.value = {
        show: true,
        title: "Luar Biasa!",
        message: "Kamu dapat Bonus Beruntun!",
        rewardAmount: lastEarnedReward.value,
        footerText: "Koin Berhasil Ditambah!",
        mainEmoji: "✨💰✨",
      };
      speak(`Hebat! Kamu dapat bonus ${lastEarnedReward.value} koin!`);
      await new Promise((resolve) => setTimeout(resolve, 3500));
      celebrationData.value.show = false;
    }

    if (completed) {
      isQuizCompleted.value = true;
      speak(`Luar biasa! Kamu telah menyelesaikan semua tantangan!`);
      feedback.value = { message: "Tantangan Selesai! 🎉", type: "success" };
      celebrationData.value = {
        show: true,
        title: "Tantangan Selesai!",
        message: "Luar Biasa! Kembali ke menu...",
        rewardAmount: null,
        footerText: "Semua Level!",
        mainEmoji: "✨🏆✨",
      };
      const duration = 5000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#FFD93D", "#6BCB77", "#4D96FF", "#ff9a9a", "#A084E8"],
          zIndex: 100,
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#FFD93D", "#6BCB77", "#4D96FF", "#ff9a9a", "#A084E8"],
          zIndex: 100,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
      await new Promise((resolve) => setTimeout(resolve, 5000));
      router.push("/");
      isProcessingClick.value = false;
      return;
    }

    if (leveledUp) {
      feedback.value = {
        message: `Luar Biasa! Naik Level ${level.value}! 🌟`,
        type: "success",
      };
      if (!gotReward) {
        celebrationData.value = {
          show: true,
          title: "Naik Level!",
          message: `Kamu Naik Level ${level.value}!`,
          rewardAmount: null,
          footerText: "Luar Biasa!",
          mainEmoji: "✨🌟✨",
        };
        setTimeout(() => {
          celebrationData.value.show = false;
        }, 3500);
      }
      launchConfetti();
    } else if (!gotReward) {
      feedback.value = {
        message: streak.value > 2 ? `${streak.value} Beruntun! 🎉` : "Hebat! Kamu Benar! 🎉",
        type: "success",
      };
    }
    wrongLetter.value = "";

    const nextLetter = pickNextLetter(targetLetter.value);

    // Audio sequence
    if (leveledUp) {
      speak(`Luar biasa, kamu naik level. Sekarang tebak huruf ${nextLetter}`);
    } else {
      speak(`${gotReward ? "Sekarang " : "Benar, "}tebak huruf ${nextLetter}`);
    }

    await new Promise((resolve) => setTimeout(resolve, leveledUp ? 3500 : gotReward ? 2500 : 1500));

    isUpperCase.value = nextLetter === nextLetter.toUpperCase();
    if (level.value >= 2) quizLetters.value = shuffleLetters(letters);
    targetLetter.value = nextLetter;
    feedback.value = {
      message: "Dengarkan suara, lalu pilih huruf yang benar!",
      type: null,
    };
    startTimer();
  } else {
    streak.value = 0;
    score.value = Math.max(0, score.value - 5);
    const targetCased = isUpperCase.value ? targetLetter.value : targetLetter.value.toLowerCase();
    letterWeights.value[targetCased] = (letterWeights.value[targetCased] || 0) - 0.5;
    const clickedCased = isUpperCase.value ? letter : letter.toLowerCase();
    letterWeights.value[clickedCased] = (letterWeights.value[clickedCased] || 0) - 0.5;
    mistakeMadeInCurrentLevel.value = true;
    feedback.value = {
      message: "Coba lagi yuk! Kamu pasti bisa! 💪",
      type: "error",
    };
    wrongLetter.value = letter;
    speak(`Ini huruf ${letter}, tebak huruf ${targetLetter.value}`);
    setTimeout(() => {
      if (wrongLetter.value === letter) wrongLetter.value = "";
    }, 500);
  }
  isProcessingClick.value = false;
};

onMounted(() => {
  if (level.value >= 2) quizLetters.value = shuffleLetters(letters);
  const nextLetter = pickNextLetter("");
  targetLetter.value = nextLetter;
  isUpperCase.value = nextLetter === nextLetter.toUpperCase();
  feedback.value = {
    message: "Dengarkan suara, lalu pilih huruf yang benar!",
    type: null,
  };
  speak(`Ayo bermain tebak huruf, coba tebak mana huruf ${targetLetter.value}`);
  startTimer();
});

onUnmounted(() => {
  if (timerInterval.value) window.clearInterval(timerInterval.value);
  // syncAlphabet();
  console.log("stop-quiz", timerInterval.value);
  emit("stop-quiz");
});
</script>

<template>
  <div class="flex flex-col gap-4 animate-entrance" :data-speaking="speaking">
    <!-- Quiz Dashboard (Single Row) -->
    <div class="shrink-0 px-4 flex flex-col items-center justify-center min-h-[80px]">
      <div class="w-full max-w-4xl mx-auto flex flex-col gap-4">
        <div
          :data-target-letter="targetLetter"
          class="bg-white/30 backdrop-blur-lg p-4 md:p-6 rounded-4xl border-4 border-white/50 shadow-2xl relative overflow-hidden"
        >
          <div
            class="absolute -top-10 -right-10 w-32 h-32 bg-indigo-400/20 rounded-full blur-3xl"
          ></div>
          <div
            class="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl"
          ></div>

          <div
            class="flex flex-wrap items-center justify-between gap-3 md:gap-6 relative z-10 w-full px-2"
          >
            <!-- Progress -->
            <div
              class="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shrink-0"
            >
              <div
                class="absolute inset-0 bg-indigo-500/10 rounded-full blur-xl animate-pulse"
              ></div>
              <svg class="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  class="text-indigo-100/50"
                  stroke-width="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  class="text-indigo-500 transition-all duration-1000 ease-out"
                  stroke-width="8"
                  stroke-linecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  :stroke-dasharray="213.63"
                  :stroke-dashoffset="213.63 * (1 - progressPercentage / 100)"
                />
              </svg>
              <div class="absolute flex flex-col items-center justify-center leading-tight">
                <span class="text-[10px] md:text-sm font-black text-indigo-600"
                  >{{ Math.round(progressPercentage) }}%</span
                >
              </div>
            </div>

            <!-- Stats -->
            <div class="flex-1 flex flex-wrap items-center justify-center gap-2 md:gap-4">
              <div
                v-if="currentConfig.timer > 0"
                class="ui-capsule bg-rose-50 border-rose-200 px-3 md:px-4 h-10 md:h-12 transition-all duration-300"
                :class="{
                  'animate-pulse bg-rose-100 border-rose-400 shadow-lg': timeLeft <= 3,
                }"
              >
                <span class="text-sm md:text-base xl:text-xl animate-bounce">⏱️</span>
                <span class="text-sm md:text-base xl:text-xl font-black text-rose-600 ml-1"
                  >{{ timeLeft }}s</span
                >
              </div>
              <div
                v-if="streak >= 2"
                class="ui-capsule bg-orange-50 border-orange-200 px-3 md:px-4 h-10 md:h-12 animate-float"
              >
                <span class="text-sm md:text-base xl:text-xl">🔥</span>
                <span class="text-sm md:text-base xl:text-xl font-black text-orange-600 ml-1">{{
                  streak
                }}</span>
              </div>
              <div
                v-if="currentConfig.streak > 0"
                class="ui-capsule bg-amber-50 border-amber-200 px-3 md:px-4 h-10 md:h-12 border-dashed"
              >
                <span class="text-[10px] md:text-xs xl:text-sm font-black text-amber-700"
                  >Target: {{ currentConfig.streak }} 🔥</span
                >
              </div>
              <div class="ui-capsule bg-sky-50 border-sky-200 px-3 md:px-5 h-10 md:h-12">
                <span class="text-xs md:text-base xl:text-lg font-black text-sky-700">Lvl {{ level }}</span>
              </div>
              <div class="ui-capsule bg-indigo-50 border-indigo-200 px-3 md:px-5 h-10 md:h-12">
                <span class="text-xs md:text-base xl:text-lg font-black text-indigo-700">🏆 {{ score }}</span>
              </div>
            </div>

            <!-- Stop -->
            <div class="shrink-0">
              <button
                @click="emit('stop-quiz')"
                class="ui-capsule-interactive bg-rose-500 border-rose-600 text-white w-10 md:w-12 h-10 md:h-12 p-0 flex items-center justify-center shadow-lg hover:bg-rose-400 active:scale-95 transition-all"
              >
                <span class="text-xl md:text-2xl">⏹️</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Feedback -->
    <div class="shrink-0 text-center h-14 md:h-16 flex items-center justify-center my-2 px-4">
      <transition name="fade" mode="out-in">
        <div
          v-if="feedback.message"
          :key="feedback.message"
          class="text-lg md:text-xl xl:text-2xl 2xl:text-3xl font-black drop-shadow-sm animate-bounce"
          :class="{
            'text-secondary': feedback.type === 'success',
            'text-danger': feedback.type === 'error',
            'text-slate-600': feedback.type === null,
          }"
        >
          {{ feedback.message }}
        </div>
      </transition>
    </div>

    <!-- Alphabet Grid -->
    <div class="flex-1 px-4 pb-12 w-full max-w-7xl mx-auto overflow-visible relative">
      <div
        class="grid grid-cols-[repeat(auto-fit,minmax(70px,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(90px,1fr))] md:grid-cols-[repeat(auto-fit,minmax(100px,1fr))] xl:grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-3 sm:gap-4 lg:gap-5 w-full place-content-center"
      >
        <BubbleCard
          v-for="(letter, index) in quizLetters"
          :key="letter"
          as="button"
          @click="handleLetterClick(letter)"
          class="group cursor-pointer w-full aspect-square border-none rounded-[20%] sm:rounded-3xl animate-entrance"
          :class="[
            getLetterColor(letter),
            wrongLetter === letter
              ? 'shake-animation bg-red-600 ring-4 ring-red-800'
              : 'hover:-translate-y-2 hover:shadow-xl shadow-md',
          ]"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <div class="flex items-center justify-center w-full h-full">
            <span
              class="text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl 2xl:text-8xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.15)] select-none font-quicksand"
            >
              {{ isUpperCase ? letter : letter.toLowerCase() }}
            </span>
          </div>
        </BubbleCard>
      </div>

      <!-- Replay Sound Button -->
      <div class="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-20 animate-pulse">
        <button
          @click="playLetterSound(targetLetter)"
          class="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white rounded-full shadow-2xl border-[5px] border-indigo-500 hover:scale-110 active:scale-95 transition-all"
        >
          <span class="text-3xl md:text-4xl">🔊</span>
        </button>
      </div>
    </div>

    <!-- Reward Celebration Pop-up -->
    <UiCelebrationModal
      v-model="celebrationData.show"
      :title="celebrationData.title"
      :message="celebrationData.message"
      :reward-amount="celebrationData.rewardAmount"
      :footer-text="celebrationData.footerText"
      :main-emoji="celebrationData.mainEmoji"
    />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.shake-animation {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
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
</style>
