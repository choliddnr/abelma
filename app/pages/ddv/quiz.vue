<script setup lang="ts">
import {
  ddvLevels,
  ddvDiphthongQuizItems,
  ddvClusterQuizItems,
  type DdvConnectPair,
} from "~/constants/ddvData";
import { useDdvStore } from "~/stores/ddvStore";
import { useAudio } from "~/composables/useAudio";
import VowelConnectQuiz from "~/components/ddv/VowelConnectQuiz.vue";
import DiphthongQuiz from "~/components/ddv/DiphthongQuiz.vue";
import ClusterQuiz from "~/components/ddv/ClusterQuiz.vue";
import DdvProgressTracker from "~/components/ddv/DdvProgressTracker.vue";
import confetti from "canvas-confetti";

const router = useRouter();
const ddvStore = useDdvStore();
const { play } = useAudio();
const { changeCoins } = useProfileStore();

// Quiz rounds: diphthong → cluster → connect
type QuizPhase = "diphthong" | "cluster" | "connect";
const phase = ref<QuizPhase>("diphthong");

const diphthongItems = ddvDiphthongQuizItems;
const clusterItems = ddvClusterQuizItems;
const connectPairs = (ddvLevels.find((l) => l.id === 5)?.items || []) as DdvConnectPair[];

// Per-phase item index (diphthong & cluster); connect handles itself
const currentDiphthongIndex = ref(0);
const currentClusterIndex = ref(0);
const connectMatchCount = ref(0);

// Chunking connect pairs (4 per round)
const connectChunkIndex = ref(0);
const connectChunks = computed(() => {
  const size = 4;
  const chunks = [];
  for (let i = 0; i < connectPairs.length; i += size) {
    chunks.push(connectPairs.slice(i, i + size));
  }
  return chunks;
});
const currentConnectPairs = computed(() => connectChunks.value[connectChunkIndex.value] || []);

const gameFinished = ref(false);
const connectKey = ref(0);

const { ddvProgress } = storeToRefs(ddvStore);
const streak = ref(0);

// ---- Progress bar ----
const totalQuestions = computed(
  () => diphthongItems.length + clusterItems.length + connectPairs.length
);
const answeredCount = computed(
  () => currentDiphthongIndex.value + currentClusterIndex.value + connectMatchCount.value
);

// ---- Handlers ----
const popConfetti = () =>
  confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ["#14B8A6", "#FFD93D", "#6BCB77"] });

const handleCorrect = (points = 5) => {
  const config = ddvProgress.value.config;
  streak.value++;
  
  // Base reward for correct answer
  changeCoins(config.coinReward);
  
  // Streak reward
  if (streak.value > 0 && streak.value % config.streakThreshold === 0) {
    changeCoins(config.streakReward);
    play(`Luar biasa! Streak ${streak.value}!`);
  }
  
  popConfetti();
  ddvStore.updateScore(5, points);
};

const handleDiphthongCorrect = () => {
  handleCorrect(5);
  if (currentDiphthongIndex.value < diphthongItems.length - 1) {
    currentDiphthongIndex.value++;
  } else {
    play("Bagus sekali! Sekarang coba isi vokalnya!");
    phase.value = "cluster";
  }
};

const handleClusterCorrect = () => {
  handleCorrect(5);
  if (currentClusterIndex.value < clusterItems.length - 1) {
    currentClusterIndex.value++;
  } else {
    play("Luar biasa! Sekarang sambungkan vokalnya!");
    phase.value = "connect";
  }
};

const handleConnectMatch = () => {
  handleCorrect(2);
  connectMatchCount.value++;
};

const handleConnectComplete = () => {
  if (connectChunkIndex.value < connectChunks.value.length - 1) {
    popConfetti();
    play("Hebat! Ayo lanjut lagi!");
    connectChunkIndex.value++;
    connectKey.value++; // Reset component state for new chunk
  } else {
    gameFinished.value = true;
    const config = ddvProgress.value.config;
    changeCoins(config.levelUpReward);
    ddvStore.updateScore(5, 20);
    play("Hebat! Kamu sudah pintar vokal rangkap!");
  }
};

const restartGame = () => {
  phase.value = "diphthong";
  currentDiphthongIndex.value = 0;
  currentClusterIndex.value = 0;
  connectChunkIndex.value = 0;
  connectMatchCount.value = 0;
  gameFinished.value = false;
  connectKey.value++;
};

// ---- Phase labels ----
const phaseLabel = computed(() => {
  if (phase.value === "diphthong") return "Tebak Diftong";
  if (phase.value === "cluster") return "Pasang Vokal";
  return "Sambung Vokal";
});

const phaseEmoji = computed(() => {
  if (phase.value === "diphthong") return "❓";
  if (phase.value === "cluster") return "🧩";
  return "🔗";
});

onMounted(() => {
  ddvStore.fetch();
});

onUnmounted(async () => {
  await ddvStore.syncToServer();
});
</script>

<template>
  <div class="flex flex-col h-screen relative overflow-hidden bg-teal-50/30">
    <!-- Celebration Modal -->
    <UiCelebrationModal
      v-model="gameFinished"
      title="QUIZ SELESAI!"
      message="Kamu jagoan vokal rangkap!"
      main-emoji="🏆"
      :reward-amount="ddvProgress.config.levelUpReward"
    >
      <div class="flex flex-col gap-4 w-full">
        <UiButton
          @click="restartGame"
          variant="accent"
          icon="lucide:refresh-cw"
          class="flex-1 py-4 text-xl h-auto w-full"
        >
          <span class="font-black">MAIN LAGI</span>
        </UiButton>
        <UiButton
          @click="router.push('/ddv')"
          variant="white"
          icon="lucide:layout-grid"
          class="flex-1 py-4 text-xl h-auto w-full"
        >
          <span class="font-black">KE MENU DDV</span>
        </UiButton>
        <UiButton
          @click="router.push('/')"
          variant="white"
          icon="lucide:home"
          class="flex-1 py-4 text-xl h-auto w-full"
        >
          <span class="font-black">BERANDA</span>
        </UiButton>
      </div>
    </UiCelebrationModal>

    <!-- Top Bar -->
    <div class="shrink-0 p-4 z-20">
      <div class="max-w-4xl mx-auto glass-card p-4 flex items-center gap-4">
        <UiButton
          @click="router.push('/ddv')"
          variant="white"
          icon="lucide:x"
          class="size-12 rounded-full p-0 flex items-center justify-center shadow-sm shrink-0"
        />
        <DdvProgressTracker
          :current="answeredCount"
          :total="totalQuestions"
          :level-name="phaseLabel"
          class="flex-1 !py-0"
        />
        <!-- <div class="text-3xl shrink-0">{{ phaseEmoji }}</div> -->
      </div>
    </div>

    <!-- Phase Pill Indicator -->
    <div class="flex justify-center gap-3 py-2">
      <div
        v-for="(p, i) in (['diphthong', 'cluster', 'connect'] as QuizPhase[])"
        :key="p"
        class="h-2 rounded-full transition-all duration-500"
        :class="[
          phase === p ? 'w-12 bg-teal-500' : 'w-4 bg-teal-200'
        ]"
      />
    </div>

    <!-- Quiz Area -->
    <main class="flex-1 flex flex-col items-center justify-center p-4">

      <!-- Round 1: Diphthong MCQ -->
      <Transition name="slide-fade" mode="out-in">
        <div v-if="phase === 'diphthong'" key="diphthong" class="w-full">
          <DiphthongQuiz
            :key="diphthongItems[currentDiphthongIndex]!.id"
            v-bind="diphthongItems[currentDiphthongIndex]!"
            @correct="handleDiphthongCorrect"
          />
        </div>

        <!-- Round 2: Cluster Drag-Drop -->
        <div v-else-if="phase === 'cluster'" key="cluster" class="w-full">
          <ClusterQuiz
            :key="clusterItems[currentClusterIndex]!.id"
            v-bind="clusterItems[currentClusterIndex]!"
            @correct="handleClusterCorrect"
          />
        </div>

        <!-- Round 3: Connect Match -->
        <div v-else key="connect" class="w-full max-w-4xl mx-auto bg-white/60 backdrop-blur-md p-8 md:p-12 rounded-[3.5rem] shadow-xl border-4 border-white">
          <VowelConnectQuiz
            :key="connectKey"
            :pairs="currentConnectPairs"
            @match="handleConnectMatch"
            @complete="handleConnectComplete"
          />
        </div>
      </Transition>
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
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}
</style>
