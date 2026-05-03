<script setup lang="ts">
import { cvcLevels, cvcQuizWords, type CvcQuizWord, type CvcItem } from "~/constants/cvcBlends";
import { useCvcStore } from "~/stores/cvcStore";
import { useAudio } from "~/composables/useAudio";
import confetti from "canvas-confetti";

const router = useRouter();
const cvcStore = useCvcStore();
const { cvcProgress } = storeToRefs(cvcStore);
const { activeProfileId, changeCoins } = useProfileStore();
const { play, playWordAudio, playSyllableAudio, playEffectAudio } = useAudio();
const mentorStore = useMentorStore();
const { isPremium } = useSubscription();

// Game State
const score = ref(0);
const level = ref(1);
const streak = ref(0);
const timeLeft = ref(0);
const timerInterval = ref<number | null>(null);

const activityType = ref<"PICK_BLEND" | "BUILD_BLEND">("PICK_BLEND");
const currentTarget = ref<any>(null);
const options = ref<any[]>([]);
const isProcessing = ref(false);
const wrongChoiceId = ref<string | null>(null);
const isWinModal = ref(false);

// Pool of items for PICK_BLEND
const allBlends = computed(() => {
  let levels = cvcLevels.filter(l => l.type === "blend");
  if (!isPremium.value) {
    levels = levels.filter(l => l.id === 1);
  }
  return levels.flatMap(l => l.items as CvcItem[]);
});

const progressPercentage = computed(() => {
  return (score.value % 100);
});

// Initialization
const initQuestion = () => {
  isProcessing.value = false;
  wrongChoiceId.value = null;
  
  // Decide activity type
  // Level 1: mostly PICK_BLEND, Level 2+: 50/50
  if (level.value === 1) {
    activityType.value = Math.random() > 0.3 ? "PICK_BLEND" : "BUILD_BLEND";
  } else {
    activityType.value = Math.random() > 0.5 ? "PICK_BLEND" : "BUILD_BLEND";
  }

  if (activityType.value === "PICK_BLEND") {
    setupPickBlend();
  } else {
    setupBuildBlend();
  }

  // Timer logic
  if (level.value >= 3) {
    startTimer(15);
  }
};

const setupPickBlend = () => {
  // Weighted selection would go here, for now random
  const pool = allBlends.value;
  const target = pool[Math.floor(Math.random() * pool.length)]!;
  currentTarget.value = target;

  // Options: 3 at lvl 1, 4 at lvl 2+
  const numOptions = level.value === 1 ? 3 : 4;
  const distractors = pool
    .filter(item => item.id !== target.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, numOptions - 1);
  
  options.value = [...distractors, target].sort(() => Math.random() - 0.5);

  setTimeout(() => {
    playPrompt("PICK_BLEND");
  }, 500);
};

const setupBuildBlend = () => {
  let allowedWords = cvcQuizWords;
  if (!isPremium.value) {
    allowedWords = cvcQuizWords.filter(w => w.answer === "H" || w.answer === "S");
  }
  const target = allowedWords[Math.floor(Math.random() * allowedWords.length)]!;
  currentTarget.value = target;

  // Dynamically generate options
  const uniqueEndings = [...new Set(cvcQuizWords.map(w => w.answer))];
  const distractors = uniqueEndings
    .filter(e => e !== target.answer)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  
  const allOptions = [target.answer, ...distractors].sort(() => Math.random() - 0.5);

  options.value = allOptions.map(letter => ({
    id: letter,
    text: letter,
    isCorrect: letter === target.answer
  }));

  setTimeout(() => {
    playPrompt("BUILD_BLEND");
  }, 500);
};

const playPrompt = (type: string) => {
  if (type === "PICK_BLEND") {
    play("Dengarkan, lalu pilih yang benar!");
    setTimeout(() => playWordAudio(currentTarget.value.blend), 1500);
  } else {
    play("Lengkapi bunyi yang hilang!");
    // Example: "RUMAH. R-U-M-A... apa lanjutannya?"
    setTimeout(() => playWordAudio(currentTarget.value.word), 1500);
  }
};

const handleChoice = async (choice: any) => {
  if (isProcessing.value || isWinModal.value) return;
  isProcessing.value = true;

  let isCorrect = false;
  if (activityType.value === "PICK_BLEND") {
    isCorrect = choice.id === currentTarget.value.id;
  } else {
    isCorrect = choice.id === currentTarget.value.answer;
  }

  if (isCorrect) {
    await handleCorrect();
  } else {
    handleWrong(choice.id);
  }
};

const handleCorrect = async () => {
  stopTimer();
  playEffectAudio("correct");
  popConfetti();
  
  // Coin and rewards
  const points = cvcProgress.value.config.coinReward || 10;
  score.value += points;
  changeCoins(points);
  
  // Streak
  streak.value++;
  const { leveledUp } = await cvcStore.updateQuizScore(points, currentTarget.value.id, true);
  
  const threshold = cvcProgress.value.config.streakThreshold || 5;
  if (streak.value % threshold === 0) {
    const bonus = cvcProgress.value.config.streakReward || 20;
    changeCoins(bonus);
    play(`Luar biasa! Streak ${streak.value}!`);
  }

  if (leveledUp) {
    level.value++;
    isWinModal.value = true;
  } else {
    setTimeout(initQuestion, 1500);
  }
};

const handleWrong = (id: string) => {
  playEffectAudio("wrong");
  wrongChoiceId.value = id;
  streak.value = 0;
  
  // Penalty
  const penalty = activityType.value === "PICK_BLEND" ? -5 : -1;
  score.value = Math.max(0, score.value + penalty);
  cvcStore.updateQuizScore(penalty, currentTarget.value.id, false);
  
  setTimeout(() => {
    wrongChoiceId.value = null;
    isProcessing.value = false;
  }, 1000);
};

const startTimer = (seconds: number) => {
  stopTimer();
  timeLeft.value = seconds;
  timerInterval.value = window.setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      handleTimeout();
    }
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
};

const handleTimeout = () => {
  stopTimer();
  play("Waktu habis! Ayo coba lagi.");
  handleWrong("timeout");
  setTimeout(initQuestion, 2000);
};

const popConfetti = () => {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#A084E8", "#FFD93D", "#6BCB77", "#4D96FF"],
  });
};

const goBack = () => router.push("/cvc");

onMounted(async () => {
  await cvcStore.fetch();
  score.value = cvcProgress.value.quizScore;
  level.value = cvcProgress.value.quizLevel;
  initQuestion();
});

onUnmounted(async () => {
  stopTimer();
  await cvcStore.syncToServer();
});
</script>

<template>
  <div class="flex flex-col min-h-screen relative overflow-hidden bg-indigo-50/50">
    <!-- Celebration Modal -->
    <UiCelebrationModal
      v-model="isWinModal"
      title="NAIK LEVEL!"
      :message="`Selamat! Kamu sekarang di Level ${level}!`"
      :reward-amount="cvcProgress.config.levelUpReward"
      main-emoji="🌟"
      footer-text="Ayo lanjut main!"
      @update:model-value="(val) => !val && initQuestion()"
    />

    <!-- Header Stats -->
    <div class="shrink-0 p-4 z-20">
      <div class="max-w-4xl mx-auto glass-card p-4 flex items-center justify-between gap-4">
        <UiButton
          @click="goBack"
          variant="white"
          icon="lucide:x"
          class="size-12 rounded-full p-0 flex items-center justify-center shadow-sm"
        />
        
        <div class="flex-1 flex items-center justify-center gap-4">
          <!-- Score -->
          <div class="ui-capsule bg-white border-indigo-100">
            <Icon name="lucide:trophy" class="text-indigo-500" />
            <span class="text-lg font-black text-slate-700 ml-1">{{ score }}</span>
          </div>
          
          <!-- Streak -->
          <div v-if="streak >= 2" class="ui-capsule bg-orange-50 border-orange-100 animate-float">
            <Icon name="lucide:flame" class="text-orange-500" />
            <span class="text-lg font-black text-orange-600 ml-1">{{ streak }}</span>
          </div>

          <!-- Timer -->
          <div v-if="timeLeft > 0" class="ui-capsule" :class="timeLeft <= 5 ? 'bg-rose-50 border-rose-200 animate-pulse' : 'bg-white border-slate-100'">
            <Icon name="lucide:timer" :class="timeLeft <= 5 ? 'text-rose-500' : 'text-slate-400'" />
            <span class="text-lg font-black ml-1" :class="timeLeft <= 5 ? 'text-rose-600' : 'text-slate-700'">{{ timeLeft }}s</span>
          </div>
        </div>

        <div class="shrink-0 text-right">
          <div class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Level {{ level }}</div>
          <div class="w-24 h-2 bg-indigo-100 rounded-full mt-1 overflow-hidden">
            <div class="h-full bg-indigo-500 transition-all duration-500" :style="{ width: `${progressPercentage}%` }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Question Area -->
    <main class="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-8 z-10">
      <Transition name="scale-fade" mode="out-in">
        <div :key="currentTarget?.id" class="w-full max-w-2xl flex flex-col items-center gap-10">
          
          <!-- Activity: PICK_BLEND -->
          <div v-if="activityType === 'PICK_BLEND'" class="flex flex-col items-center gap-8 w-full">
            <div class="size-48 md:size-64 bg-white rounded-[3rem] shadow-xl border-4 border-white flex items-center justify-center text-8xl md:text-[140px]">
              {{ currentTarget?.emoji }}
            </div>
            
            <div class="grid grid-cols-2 gap-4 w-full">
              <UiButton
                v-for="opt in options"
                :key="opt.id"
                @click="handleChoice(opt)"
                variant="white"
                class="h-24 md:h-32 text-3xl md:text-5xl font-black rounded-3xl border-b-8 active:border-b-0 active:translate-y-2 transition-all"
                :class="[
                  wrongChoiceId === opt.id ? 'bg-rose-500 border-rose-700 text-white shake' : 'hover:border-indigo-200 text-slate-700'
                ]"
              >
                {{ opt.blend }}
              </UiButton>
            </div>
          </div>

          <!-- Activity: BUILD_BLEND -->
          <div v-else class="flex flex-col items-center gap-8 w-full">
            <div class="flex items-center gap-4">
              <div class="size-24 md:size-32 bg-white rounded-3xl shadow-md border-2 border-white flex items-center justify-center text-5xl md:text-6xl">
                {{ currentTarget?.emoji }}
              </div>
              <div class="flex items-center gap-2 bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border-2 border-white shadow-xl">
                <span class="text-5xl md:text-7xl font-black text-slate-400">{{ currentTarget?.prefix }}-</span>
                <span class="text-5xl md:text-7xl font-black text-slate-700">{{ currentTarget?.cv }}</span>
                <div class="w-12 h-16 md:w-16 md:h-20 bg-slate-100 rounded-2xl border-4 border-dashed border-indigo-200 flex items-center justify-center">
                  <span v-if="wrongChoiceId && wrongChoiceId === currentTarget?.answer" class="text-rose-500 text-5xl md:text-7xl font-black animate-ping">?</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-4 gap-3 md:gap-4 w-full">
              <UiButton
                v-for="opt in options"
                :key="opt.id"
                @click="handleChoice(opt)"
                variant="white"
                class="h-20 md:h-28 text-3xl md:text-5xl font-black rounded-2xl border-b-8 active:border-b-0 active:translate-y-2 transition-all"
                :class="[
                  wrongChoiceId === opt.id ? 'bg-rose-500 border-rose-700 text-white shake' : 'hover:border-indigo-200 text-indigo-600'
                ]"
              >
                {{ opt.text }}
              </UiButton>
            </div>
          </div>

        </div>
      </Transition>

      <!-- Replay Sound Button -->
      <button
        @click="playPrompt(activityType)"
        class="mt-4 size-20 bg-white rounded-full shadow-lg border-4 border-indigo-500 flex items-center justify-center text-4xl hover:scale-110 active:scale-95 transition-all animate-float"
      >
        🔊
      </button>
    </main>

    <!-- Background Pattern -->
    <div class="fixed inset-0 pointer-events-none opacity-[0.03] -z-10">
      <div class="grid grid-cols-6 gap-20 transform rotate-12 -translate-y-20">
        <Icon v-for="i in 24" :key="i" name="lucide:gamepad-2" class="size-32" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-2px, 0, 0); }
  20%, 80% { transform: translate3d(4px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-8px, 0, 0); }
  40%, 60% { transform: translate3d(8px, 0, 0); }
}

.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-fade-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
.scale-fade-leave-to {
  opacity: 0;
  transform: scale(1.1) translateY(-20px);
}
</style>
