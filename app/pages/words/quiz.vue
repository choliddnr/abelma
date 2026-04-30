<script setup lang="ts">
import { wordCategories, type Word } from "~/constants/words";
import confetti from "canvas-confetti";
import type { Sticker } from "@/types/stores";
import { cancelTTS } from "~/composables/useTTS";

const router = useRouter();
const wordStore = useWordStore();
const { wordQuizProgress } = storeToRefs(wordStore);
const { activeProfileId } = storeToRefs(useProfileStore());
const { changeCoins } = useProfileStore();
const mentorStore = useMentorStore();
const { resetTimer } = useMentorHint("Ayo, pilih kata yang tepat!", 10000);
const { isPremium } = useSubscription();
const { play: playAudio } = useAudio();

const goBack = () => router.push("/words");

// Flatten all words from all categories into a single pool
const allWords = computed<Word[]>(() => {
  return wordCategories.flatMap((c) => {
    return isPremium.value ? c.words : c.words.slice(0, 1);
  });
});



const currentTarget = ref<Word | null>(null);
const currentOptions = ref<Word[]>([]);
const wrongChoiceId = ref<string | null>(null);
const score = ref(0);
const pointsPerLevel = 100;
const streak = ref(0);
const timeLeft = ref(30);
const hasMadeMistake = ref(false);

const currentLevel = computed(() => {
  return Math.floor(score.value / pointsPerLevel) + 1;
});

const currentLetterCase = ref<"uppercase" | "lowercase">("uppercase");

const currentLevelConfig = computed(() => {
  return (
    wordQuizProgress.value.quizConfig || {
      coinReward: 10,
      levelUpReward: 50,
      streakThreshold: 5,
      streakReward: 10,
    }
  );
});
const timerMax = computed(() => {
  if (currentLevel.value < 3) return 0;
  return Math.max(5, 30 - (currentLevel.value - 3));
});
let timerInterval: any = null;

const progressPercentage = computed(() => ((score.value % pointsPerLevel) / pointsPerLevel) * 100);

// Activity Control
type QuizType = "PICK_WORD" | "SPELL_WORD";
const activityType = ref<QuizType>("PICK_WORD");

// Spelling Mode State
const placedLetters = ref<(string | null)[]>([]);
const availableLetters = ref<
  { id: string; letter: string; isDragging?: boolean }[]
>([]);
const wrongDropIndex = ref<number | null>(null);
const draggedItemIndex = ref<number | null>(null);
const hoveredSlotIndex = ref<number | null>(null);
const touchPosition = ref({ x: 0, y: 0 });
const isTouching = ref(false);


const numOptions = computed(() => {
  if (currentLevel.value === 1) return 2;
  if (currentLevel.value === 2) return 3;
  if (currentLevel.value === 3) return 4;
  return 6;
});

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval);
  if (timerMax.value <= 0) return; // Timer disabled in settings

  timeLeft.value = timerMax.value;
  timerInterval = window.setInterval(() => {
    timeLeft.value -= 0.1;
    if (timeLeft.value <= 0) {
      timeLeft.value = 0;
      if (timerInterval) clearInterval(timerInterval);
      streak.value = 0;
      handleTimeUp();
    }
  }, 100);
};

const handleTimeUp = () => {
  if (currentTarget.value && activeProfileId.value) {
    // analyticsStore.recordMistake(
    //   activeProfileId.value,
    //   "word",
    //   currentTarget.value.id,
    // );
  }
  playWordAudio("Waktu habis! Ayo coba yang ini.");
  setTimeout(initQuestion, 1500);
};

const initQuestion = () => {
  const neededOptions = numOptions.value;
  if (allWords.value.length < neededOptions) return;

  // Stop previous timer
  if (timerInterval) clearInterval(timerInterval);

  // Reset UI states
  wrongChoiceId.value = null;
  wrongDropIndex.value = null;
  draggedItemIndex.value = null;
  hoveredSlotIndex.value = null;
  hasMadeMistake.value = false;

  // Randomize letter case for this question
  currentLetterCase.value = Math.random() > 0.5 ? "uppercase" : "lowercase";

  // Pick a target using weighted random selection
  const weightsDict = wordQuizProgress.value.weights || {};
  let totalWeight = 0;
  const weightedList = allWords.value.map((word) => {
    // Inverse weight: base 10 - mastery. Positive mastery = lower weight.
    const mastery = weightsDict[word.id] || 0;
    const weight = Math.max(1, 10 - mastery);
    totalWeight += weight;
    return { word, weight };
  });

  let random = Math.random() * totalWeight;
  let target = allWords.value[0]!;
  for (const item of weightedList) {
    random -= item.weight;
    if (random <= 0) {
      target = item.word;
      break;
    }
  }
  currentTarget.value = target;

  // Randomize Activity Type
  // Level 1: Mostly PICK_WORD
  // Level 2-3: 50/50 mix
  if (currentLevel.value === 1) {
    activityType.value = Math.random() > 0.3 ? "PICK_WORD" : "SPELL_WORD";
  } else {
    activityType.value = Math.random() > 0.5 ? "PICK_WORD" : "SPELL_WORD";
  }

  if (activityType.value === "PICK_WORD") {
    // Pick distractors
    const optionsSet = new Set<Word>();
    optionsSet.add(target);

    if (currentLevel.value === 3) {
      // Level 3 logic: Try to find words starting with the same letter
      const firstLetter = target.word.charAt(0).toUpperCase();
      const similarWords = allWords.value.filter(
        (w) =>
          w.id !== target.id && w.word.charAt(0).toUpperCase() === firstLetter,
      );

      // Shuffle similar words
      const shuffledSimilar = [...similarWords].sort(() => Math.random() - 0.5);
      shuffledSimilar
        .slice(0, neededOptions - 1)
        .forEach((w) => optionsSet.add(w));
    }

    // Fill remaining slots if any
    while (optionsSet.size < neededOptions) {
      const randomIndex = Math.floor(Math.random() * allWords.value.length);
      optionsSet.add(allWords.value[randomIndex]!);
    }

    // Convert set to array and shuffle
    const optionsArray = Array.from(optionsSet);
    for (let i = optionsArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [optionsArray[i], optionsArray[j]] = [optionsArray[j]!, optionsArray[i]!];
    }
    currentOptions.value = optionsArray;
  } else {
    // SPELL_WORD Logic
    placedLetters.value = Array.from(
      { length: target.word.length },
      () => null,
    );

    const letters = target.word.split("").map((l, i) => {
      let displayLetter = l;
      if (currentLetterCase.value === "lowercase") {
        displayLetter = l.toLowerCase();
      }

      return { id: `target-${i}-${l}`, letter: displayLetter };
    });
    const noiseCount = currentLevel.value >= 3 ? 3 : 1;

    // Fix T2: Use Set instead of regex to safely filter out word letters
    const wordLetterSet = new Set(target.word.toUpperCase().split(""));
    const noisePool = "ABCDEFGHJKLMNOPQRSTUVWXYZ"
      .split("")
      .filter((l) => !wordLetterSet.has(l));
    for (let i = noisePool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [noisePool[i], noisePool[j]] = [noisePool[j]!, noisePool[i]!];
    }
    const noise = noisePool.slice(0, noiseCount).map((l, i) => {
      let displayLetter = l;
      if (currentLetterCase.value === "lowercase") {
        displayLetter = l.toLowerCase();
      }

      return {
        id: `noise-${i}-${l}`,
        letter: displayLetter,
      };
    });

    const allLetters = [...letters, ...noise];
    for (let i = allLetters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allLetters[i], allLetters[j]] = [allLetters[j]!, allLetters[i]!];
    }
    availableLetters.value = allLetters;
  }

  setTimeout(() => {
    playTargetAudio();
    startTimer();
  }, 300);
};

// Drag Handlers for SPELL_WORD
const onDragStart = (e: DragEvent, index: number) => {
  draggedItemIndex.value = index;
  if (availableLetters.value[index]) {
    availableLetters.value[index].isDragging = true;
  }
  e.dataTransfer?.setData("text/plain", index.toString());
};

const onDragEnd = (index: number) => {
  draggedItemIndex.value = null;
  hoveredSlotIndex.value = null;
  if (availableLetters.value[index]) {
    availableLetters.value[index].isDragging = false;
  }
};

const onDrop = (slotIndex: number) => {
  hoveredSlotIndex.value = null;
  if (draggedItemIndex.value === null || !currentTarget.value) return;

  resetTimer();
  const sourceIndex = draggedItemIndex.value;
  const letterObj = availableLetters.value[sourceIndex]!;
  const correctLetter = currentTarget.value.word.charAt(slotIndex);

  if (letterObj.letter.toUpperCase() === correctLetter.toUpperCase()) {
    placedLetters.value[slotIndex] = letterObj.letter;
    availableLetters.value.splice(sourceIndex, 1);
    draggedItemIndex.value = null;

    // Check if full word spelled
    if (
      placedLetters.value.join("").toUpperCase() ===
      currentTarget.value.word.toUpperCase()
    ) {
      handleCorrect();
    }
  } else {
    hasMadeMistake.value = true;
    score.value = Math.max(0, score.value - 1);
    if (currentTarget.value) {
      if (!wordQuizProgress.value.weights) wordQuizProgress.value.weights = {};
      wordQuizProgress.value.weights[currentTarget.value.id] = (wordQuizProgress.value.weights[currentTarget.value.id] || 0) - 0.5;
    }
    wordStore.updateLocalProgress({ score: score.value });
    streak.value = 0;
    if (activeProfileId.value) {
      // analyticsStore.recordMistake(
      //   activeProfileId.value,
      //   "word",
      //   currentTarget.value.id,
      // );
    }
    wrongDropIndex.value = slotIndex;
    playErrorAudio();
    setTimeout(() => {
      wrongDropIndex.value = null;
    }, 500);
  }
};

const putBackLetter = (slotIndex: number) => {
  const letter = placedLetters.value[slotIndex];
  if (letter) {
    availableLetters.value.push({ id: `returned-${Date.now()}`, letter });
    placedLetters.value[slotIndex] = null;
  }
};

const handleCorrect = async () => {
  if (timerInterval) clearInterval(timerInterval);
  popConfetti();
  
  const previousLevel = currentLevel.value;
  score.value += 10;
  streak.value++;

  if (currentTarget.value && !hasMadeMistake.value) {
    if (!wordQuizProgress.value.weights) wordQuizProgress.value.weights = {};
    wordQuizProgress.value.weights[currentTarget.value.id] = (wordQuizProgress.value.weights[currentTarget.value.id] || 0) + 1;
  }
  wordStore.updateLocalProgress({ score: score.value, level: currentLevel.value });

  playEffectAudio("correct");
  mentorStore.wiggle();
  const feedback = ["Hebat!", "Pintar!", "Luar Biasa!", "Bagus!", "Keren!"];
  mentorStore.showMessage(feedback[Math.floor(Math.random() * feedback.length)]!);
  
  changeCoins(currentLevelConfig.value.coinReward); // Fix T3: Activate coin reward
  
  if (streak.value > 0 && streak.value % currentLevelConfig.value.streakThreshold === 0) {

    changeCoins(currentLevelConfig.value.streakReward);
    mentorStore.showMessage("Bonus beruntun!");
    await playAudio("Selamat, kamu dapat bonus karena bisa jawab secara beruntun!");
  }
  
  resetTimer();

  if (currentLevel.value > previousLevel) {
    changeCoins(currentLevelConfig.value.levelUpReward);
    setTimeout(triggerWinScreen, 1000);
  } else {
    setTimeout(initQuestion, 1500);
  }
};

const playTargetAudio = () => {
  if (!currentTarget.value) return;

  let textToSpeak =
    activityType.value === "PICK_WORD"
      ? "Cari tulisan " + currentTarget.value.word.toLowerCase()
      : "Eja kata " + currentTarget.value.word.toLowerCase();

  mentorStore.showMessage(textToSpeak);
  // playWordAudio(textToSpeak, `/audio/words/${currentTarget.value.id}.mp3`);
};

const playErrorAudio = () => {
  playEffectAudio("wrong");
  mentorStore.wiggle();
  mentorStore.showMessage("Ayo coba lagi!");
};

const isCorrecting = ref(false); // Added this line

const handleChoice = (word: Word) => {
  if (!currentTarget.value || isCorrecting.value) return;

  resetTimer();
  if (word.id === currentTarget.value.id) {
    handleCorrect();
  } else {
    hasMadeMistake.value = true;
    score.value = Math.max(0, score.value - 5);
    if (currentTarget.value) {
      if (!wordQuizProgress.value.weights) wordQuizProgress.value.weights = {};
      wordQuizProgress.value.weights[currentTarget.value.id] = (wordQuizProgress.value.weights[currentTarget.value.id] || 0) - 0.5;
    }
    wordStore.updateLocalProgress({ score: score.value });
    if (activeProfileId.value) {
      // analyticsStore.recordMistake(
      //   activeProfileId.value,
      //   "word",
      //   currentTarget.value.id,
      // );
    }
    wrongChoiceId.value = word.id; // Fix T1: Mark wrong choice for shake animation
    playErrorAudio();
    streak.value = 0;
    isCorrecting.value = true;
    setTimeout(() => {
      wrongChoiceId.value = null; // Reset after animation
      isCorrecting.value = false;
    }, 800);
  }
};

const popConfetti = () => {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.6 },
    colors: ["#FFD93D", "#6BCB77", "#4D96FF", "#ff9a9a", "#A084E8"],
    zIndex: 100,
  });
};


const isWin = ref(false);

const triggerWinScreen = () => {
  isWin.value = true;
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 7,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#FFD93D", "#6BCB77", "#4D96FF", "#ff9a9a", "#A084E8"],
      zIndex: 100,
    });
    confetti({
      particleCount: 7,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#FFD93D", "#6BCB77", "#4D96FF", "#ff9a9a", "#A084E8"],
      zIndex: 100,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
};

// Fix T5: Extract restart logic into a named function instead of inline template code
const restartGame = () => {
  isWin.value = false;
  initQuestion();
};

// Fix T4: Touch drag support for SPELL_WORD on mobile
const onTouchStart = (e: TouchEvent, index: number) => {
  draggedItemIndex.value = index;
  if (availableLetters.value[index]) {
    availableLetters.value[index].isDragging = true;
  }
  isTouching.value = true;
  const touch = e.touches[0];
  if (touch) {
    touchPosition.value = { x: touch.clientX, y: touch.clientY };
  }
};

const onTouchMove = (e: TouchEvent) => {
  const touch = e.touches[0];
  if (!touch) return;
  touchPosition.value = { x: touch.clientX, y: touch.clientY };

  const el = document.elementFromPoint(touch.clientX, touch.clientY);
  const slotEl = el?.closest("[data-slot-index]");
  hoveredSlotIndex.value = slotEl
    ? parseInt(slotEl.getAttribute("data-slot-index")!)
    : null;
};

const onTouchEnd = (e: TouchEvent) => {
  const savedLetterObj =
    draggedItemIndex.value !== null
      ? availableLetters.value[draggedItemIndex.value]
      : null;
  const touch = e.changedTouches[0];
  if (touch) {
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const slotEl = el?.closest("[data-slot-index]");
    if (slotEl) {
      onDrop(parseInt(slotEl.getAttribute("data-slot-index")!));
    }
  }
  // Cleanup drag state
  if (savedLetterObj) savedLetterObj.isDragging = false;
  if (draggedItemIndex.value !== null) draggedItemIndex.value = null;
  hoveredSlotIndex.value = null;
  isTouching.value = false;
};

const syncProgressToDb = async () => {
  if (!activeProfileId.value) return;
  await wordStore.updateProgress(activeProfileId.value, {
    score: score.value,
    level: currentLevel.value,
    weights: wordQuizProgress.value.weights,
  });
};

// Use native fetch with keepalive for page reloads/closes
const handleUnloadSync = () => {
  if (!activeProfileId.value) return;
  
  const url = `/api/words/quiz/${activeProfileId.value}/progress`;
  const data = {
    score: score.value,
    level: currentLevel.value,
    weights: wordQuizProgress.value.weights,
    coins: useProfileStore().profile?.coins
  };

  // Navigator.sendBeacon is also an option, but fetch with keepalive is more flexible for PATCH
  fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    keepalive: true
  });
};

onMounted(async () => {
  window.addEventListener('pagehide', handleUnloadSync);
  window.addEventListener('beforeunload', handleUnloadSync);

  await wordStore.fetch();
  // Initialize local score from database if available
  if (wordQuizProgress.value.score) {
    score.value = wordQuizProgress.value.score;
  }
  initQuestion();
});

onUnmounted(async () => {
  window.removeEventListener('pagehide', handleUnloadSync);
  window.removeEventListener('beforeunload', handleUnloadSync);

  if (timerInterval) clearInterval(timerInterval);
  cancelTTS();
  await syncProgressToDb();
});

onScopeDispose(() => {
  window.removeEventListener('pagehide', handleUnloadSync);
  window.removeEventListener('beforeunload', handleUnloadSync);

  if (timerInterval) clearInterval(timerInterval);
  cancelTTS();
});
</script>

<template>
  <div class="flex flex-col min-h-screen relative overflow-hidden">
    <!-- Win Celebration Overlay (Premium Redesign) -->
    <!-- Win Celebration Modal -->
    <UiCelebrationModal
      v-model="isWin"
      title="LUAR BIASA!"
      message="Kamu telah menyelesaikan tantangan!"
      :reward-amount="currentLevelConfig.levelUpReward"
      footer-text="Koin Berhasil Ditambah!"
      main-emoji="✨🏆✨"
    >
      <div class="flex flex-col gap-3 mt-8">
        <UiButton
          @click="restartGame"
          variant="success"
          icon="lucide:rotate-ccw"
          class="w-full shadow-lg shadow-emerald-200"
        >
          <span class="font-black text-lg ml-2">Main Lagi</span>
        </UiButton>
        <UiButton
          @click="goBack"
          variant="white"
          icon="lucide:house"
          class="w-full shadow-xl"
        >
          <span class="font-black text-lg ml-2">Menu</span>
        </UiButton>
      </div>
    </UiCelebrationModal>

    <!-- Quiz Dashboard (Premium Header) -->
    <div
      class="shrink-0 px-4 pt-4 flex flex-col items-center justify-center min-h-[80px] z-20"
    >
      <div class="w-full max-w-4xl mx-auto flex flex-col gap-4">
        <div
          class="bg-white/30 backdrop-blur-lg p-4 md:p-6 rounded-4xl border-4 border-white/50 shadow-2xl relative overflow-hidden"
        >
          <!-- Animated Background Blobs -->
          <div
            class="absolute -top-10 -right-10 w-32 h-32 bg-indigo-400/20 rounded-full blur-3xl animate-pulse"
          ></div>
          <div
            class="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl animate-pulse"
            style="animation-delay: 1s"
          ></div>

          <div
            class="flex flex-wrap items-center justify-between gap-3 md:gap-6 relative z-10 w-full px-2"
          >
            <!-- Progress Circle -->
            <div
              class="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shrink-0"
            >
              <div
                class="absolute inset-0 bg-indigo-500/10 rounded-full blur-xl animate-pulse"
              ></div>
              <svg
                class="w-full h-full transform -rotate-90 drop-shadow-sm"
                viewBox="0 0 80 80"
              >
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
              <div
                class="absolute flex flex-col items-center justify-center leading-tight"
              >
                <span class="text-[10px] md:text-sm font-black text-indigo-600"
                  >{{ Math.round(progressPercentage) }}%</span
                >
              </div>
            </div>

            <!-- Stats Capsules -->
            <div
              class="flex-1 flex flex-wrap items-center justify-center gap-2 md:gap-4"
            >
              <!-- Timer (if active) -->
              <div
                v-if="timerMax > 0"
                class="ui-capsule bg-rose-50 border-rose-200 px-3 md:px-4 h-10 md:h-12 transition-all duration-300"
                :class="{
                  'animate-pulse bg-rose-100 border-rose-400 shadow-lg':
                    timeLeft <= 5,
                }"
              >
                <Icon name="lucide:timer" class="text-base md:text-xl animate-bounce" />
                <span class="text-base md:text-xl font-black text-rose-600 ml-1"
                  >{{ Math.ceil(timeLeft) }}s</span
                >
              </div>

              <!-- Streak -->
              <div
                v-if="streak >= 2"
                class="ui-capsule bg-orange-50 border-orange-200 px-3 md:px-4 h-10 md:h-12 animate-float"
              >
                <Icon name="lucide:flame" class="text-base md:text-xl" />
                <span
                  class="text-base md:text-xl font-black text-orange-600 ml-1"
                  >{{ streak }}</span
                >
              </div>

              <!-- Level -->
              <div
                class="ui-capsule bg-sky-50 border-sky-200 px-4 md:px-5 h-10 md:h-12"
              >
                <span class="text-sm md:text-lg font-black text-sky-700"
                  >Lvl {{ currentLevel }}</span
                >
              </div>

              <!-- Score -->
              <div
                class="ui-capsule bg-indigo-50 border-indigo-200 px-4 md:px-5 h-10 md:h-12"
              >
                <span class="text-sm md:text-lg font-black text-indigo-700"
                  ><Icon name="lucide:trophy" class="mr-1" /> {{ score }}</span
                >
              </div>
            </div>

            <!-- Stop/Back Button -->
            <div class="shrink-0">
              <button
                @click="goBack"
                class="ui-capsule-interactive bg-rose-500 border-rose-600 text-white w-10 md:w-12 h-10 md:h-12 p-0 flex items-center justify-center shadow-lg hover:bg-rose-400 active:scale-95 transition-all"
              >
                <Icon name="lucide:square" class="text-xl md:text-2xl" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Game Area -->
    <div
      class="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full gap-8 md:gap-12 py-8 px-4 z-10"
    >
      <div
        v-if="currentTarget"
        class="flex flex-col items-center gap-8 md:gap-12 w-full"
      >
        <!-- Target Visual -->
        <!-- Giant Emoji -->
        <UiButton
          @click="playTargetAudio"
          variant="none"
          class="relative w-48 h-48 md:w-64 md:h-64 rounded-[3rem] bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border-4 border-white flex items-center justify-center transition-all active:scale-95 group hover:scale-105"
        >
          <span
            class="text-8xl md:text-[140px] drop-shadow-xl select-none group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500"
          >
            {{ currentTarget.emoji }}
          </span>
          <div
            class="absolute -bottom-4 -right-4 w-16 h-16 bg-white rounded-full shadow-lg border-4 border-indigo-50 flex items-center justify-center text-3xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
          >
            🔊
          </div>
        </UiButton>

        <!-- OPTION TYPE: PICK_WORD -->
        <div
          v-if="activityType === 'PICK_WORD'"
          class="flex flex-col md:flex-row gap-4 md:gap-6 w-full justify-center"
        >
          <UiButton
            v-for="option in currentOptions"
            :key="option.id"
            @click="handleChoice(option)"
            variant="none"
            class="relative flex-1 min-h-20 md:min-h-28 rounded-3xl md:rounded-4xl flex flex-col items-center justify-center transition-all duration-200 active:scale-95 border-4 overflow-hidden shadow-[0_8px_20px_-5px_rgba(0,0,0,0.2)] hover:-translate-y-2 hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)]"
            :class="[
              wrongChoiceId === option.id
                ? 'shake-animation bg-rose-400 border-rose-500'
                : 'bg-white border-white',
            ]"
          >
            <!-- Glossy Top Highlight -->
            <div
              class="absolute top-0 inset-x-0 h-1/3 bg-linear-to-b from-white/60 to-transparent opacity-80 rounded-t-[inherit] pointer-events-none"
            ></div>

            <span
              class="text-3xl md:text-5xl font-black drop-shadow-sm tracking-widest z-10"
              :class="
                wrongChoiceId === option.id ? 'text-white' : 'text-slate-700'
              "
            >
              {{
                currentLetterCase === "uppercase"
                  ? option.word.toUpperCase()
                  : currentLetterCase === "lowercase"
                    ? option.word.toLowerCase()
                    : option.word
                        .split("")
                        .map((l, idx) =>
                          // Use a semi-stable randomization based on word and index to avoid flickering
                          (option.word.charCodeAt(idx) + option.id.length) %
                            2 ===
                          0
                            ? l.toUpperCase()
                            : l.toLowerCase(),
                        )
                        .join("")
              }}
            </span>
          </UiButton>
        </div>

        <!-- OPTION TYPE: SPELL_WORD -->
        <div
          v-else-if="activityType === 'SPELL_WORD'"
          class="w-full flex flex-col gap-12"
        >
          <!-- Drop Zones -->
          <div class="flex flex-wrap justify-center gap-2 md:gap-4 w-full">
            <div
              v-for="(slot, idx) in placedLetters"
              :key="`slot-${idx}`"
              :data-slot-index="idx"
              @click="
                placedLetters[idx] !== null ? putBackLetter(idx) : undefined
              "
              @dragover.prevent
              @dragenter.prevent="hoveredSlotIndex = idx"
              @dragleave.prevent="
                hoveredSlotIndex === idx ? (hoveredSlotIndex = null) : null
              "
              @drop.prevent="onDrop(idx)"
              class="relative w-14 h-18 md:w-20 md:h-28 rounded-xl md:rounded-2xl border-2 md:border-4 flex items-center justify-center transition-all duration-300"
              :class="[
                placedLetters[idx] !== null
                  ? 'bg-emerald-400 border-white shadow-md cursor-pointer'
                  : 'bg-slate-100 border-dashed border-slate-300',
                wrongDropIndex === idx
                  ? 'shake-animation bg-rose-400 border-rose-500'
                  : '',
                hoveredSlotIndex === idx && placedLetters[idx] === null
                  ? 'ring-4 ring-indigo-300 bg-indigo-50 border-indigo-300'
                  : '',
              ]"
            >
              <span
                v-if="placedLetters[idx] !== null"
                class="text-3xl md:text-5xl font-black text-white"
              >
                {{ placedLetters[idx] }}
              </span>
            </div>
          </div>

          <!-- Letter Pool -->
          <div
            class="flex flex-wrap justify-center gap-2 md:gap-4 w-full p-6 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white shadow-xs"
          >
            <div
              v-for="(item, idx) in availableLetters"
              :key="item.id"
              draggable="true"
              @dragstart="onDragStart($event, idx)"
              @dragend="onDragEnd(idx)"
              @touchstart.prevent="onTouchStart($event, idx)"
              @touchmove.prevent="onTouchMove($event)"
              @touchend.prevent="onTouchEnd($event)"
              class="relative w-12 h-16 md:w-16 md:h-24 rounded-xl md:rounded-2xl flex items-center justify-center transition-all bg-sky-400 border-2 border-white shadow-md cursor-grab active:cursor-grabbing hover:-translate-y-1 touch-none"
              :class="item.isDragging ? 'opacity-20 scale-90' : 'opacity-100'"
            >
              <span
                class="text-2xl md:text-4xl font-black text-white select-none pointer-events-none"
              >
                {{ item.letter }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Touch Drag Preview -->
    <Teleport to="body" v-if="isTouching && draggedItemIndex !== null">
      <div
        class="fixed pointer-events-none z-50 transition-transform duration-75"
        :style="{
          left: `${touchPosition.x}px`,
          top: `${touchPosition.y + 50}px`,
          transform: 'translate(-50%, -120%) scale(1.1)',
        }"
      >
        <BubbleCard
          v-if="availableLetters[draggedItemIndex]"
          class="w-16 h-20 rounded-2xl bg-sky-400/70 shadow-[0_20px_40px_rgba(0,0,0,0.4)] border-2 border-white/50 flex items-center justify-center"
        >
          <span
            class="text-4xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.15)] font-quicksand"
          >
            {{ availableLetters[draggedItemIndex]?.letter }}
          </span>
        </BubbleCard>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.font-quicksand {
  font-family: "Quicksand", sans-serif;
}

.shake-animation {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000px;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-2px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(4px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-8px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(8px, 0, 0);
  }
}
</style>
