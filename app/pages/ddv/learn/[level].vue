<script setup lang="ts">
import {
  ddvLevels,
  type DdvDiphthongItem,
  type DdvWordItem,
  type DdvClusterItem,
  type DdvConnectPair,
} from "~/constants/ddvData";
import { useDdvStore } from "~/stores/ddvStore";
import { useAudio } from "~/composables/useAudio";
import confetti from "canvas-confetti";
import DdvProgressTracker from "~/components/ddv/DdvProgressTracker.vue";
import VowelSlideAnimation from "~/components/ddv/VowelSlideAnimation.vue";
import VowelFusedResult from "~/components/ddv/VowelFusedResult.vue";
import WordLabDisplay from "~/components/ddv/WordLabDisplay.vue";
import VowelConnectQuiz from "~/components/ddv/VowelConnectQuiz.vue";
import DdvMergeButton from "~/components/ddv/DdvMergeButton.vue";

type DdvItem = DdvDiphthongItem | DdvWordItem | DdvClusterItem | DdvConnectPair;

const route = useRoute();
const router = useRouter();
const ddvStore = useDdvStore();
const { ddvProgress } = storeToRefs(ddvStore);
const { play, playWordAudio } = useAudio();
const { activeProfileId, changeCoins } = useProfileStore();
const { isPremium } = useSubscription();

// Level Setup
const levelId = computed(() => Number(route.params.level) || 1);
const level = computed(() => ddvLevels.find((l) => l.id === levelId.value));

if (!level.value) {
  router.replace("/ddv");
}

const items = ref<DdvItem[]>([]);

// Quiz State
const currentIndex = ref(0);
const isAnimating = ref(false);
const isComplete = ref(false);
const showResult = ref(false);
const levelFinished = ref(false);

const currentItem = computed(
  () => items.value[Math.min(currentIndex.value, items.value.length - 1)],
);

// Actions
const handleMerge = async () => {
  if (isAnimating.value || isComplete.value || !currentItem.value) return;

  isAnimating.value = true;

  // Animation duration matches CSS
  await new Promise((resolve) => setTimeout(resolve, 800));

  isAnimating.value = false;
  isComplete.value = true;
  showResult.value = true;

  // Play success audio
  const fusedText = (currentItem.value as DdvDiphthongItem).fused;
  playWordAudio(fusedText);
  popConfetti();

  // Update score and weight in store
  await ddvStore.updateScore(levelId.value, 5);
  ddvStore.updateLearningWeight(currentItem.value.id);
};

const handleComplete = async () => {
  if (isComplete.value || !currentItem.value) return;
  isComplete.value = true;
  showResult.value = true;

  popConfetti();
  await ddvStore.updateScore(levelId.value, 5);
  ddvStore.updateLearningWeight(currentItem.value.id);
};

const nextItem = () => {
  if (currentIndex.value < items.value.length - 1) {
    currentIndex.value++;
    isComplete.value = false;
    showResult.value = false;
  } else {
    levelFinished.value = true;
    const reward = ddvProgress.value.config.learningLevelUpReward || 50;
    changeCoins(reward);
  }
};

const popConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#14B8A6", "#FFD93D", "#6BCB77", "#4D96FF"],
  });
};

const hasNextLevel = computed(() => {
  const currentIndex = ddvLevels.findIndex((l) => l.id === levelId.value);
  return currentIndex !== -1 && currentIndex < ddvLevels.length - 1;
});

const nextLevelId = computed(() => {
  const currentIndex = ddvLevels.findIndex((l) => l.id === levelId.value);
  return ddvLevels[currentIndex + 1]?.id;
});

const goToNextLevel = () => {
  if (nextLevelId.value) {
    router.push(`/ddv/learn/${nextLevelId.value}`);
    levelFinished.value = false;
    currentIndex.value = 0;
    isComplete.value = false;
    showResult.value = false;
  }
};

// Auto-navigate to dashboard after completion
watch(levelFinished, (val) => {
  if (val) {
    setTimeout(() => {
      if (levelFinished.value) {
        router.push("/ddv/learn");
      }
    }, 3500); // Give time to see the trophy and confetti
  }
});

onMounted(async () => {
  await ddvStore.fetch();
  if (!isPremium.value && levelId.value > 1) {
    router.replace("/parent/premium");
  }
  if (level.value) {
    // Sort items by weight (lower weight first), randomize ties
    items.value = [...level.value.items].sort((a: any, b: any) => {
      const weightA = ddvProgress.value.learningWeights?.[a.id] ?? 0;
      const weightB = ddvProgress.value.learningWeights?.[b.id] ?? 0;
      if (weightA !== weightB) {
        return weightA - weightB;
      }
      return Math.random() - 0.5;
    });
    play(`Mari kita belajar ${level.value.name}!`);
  }
});

onUnmounted(async () => {
  await ddvStore.syncToServer();
});
</script>

<template>
  <!-- Celebration Modal -->
  <UiCelebrationModal
    v-model="levelFinished"
    title="HEBAT!"
    :message="`Kamu telah menyelesaikan ${level!.name}!`"
    main-emoji="🏆"
  >
    <div class="flex flex-col items-center gap-6">
      <!-- Coins Reward Badge -->
      <div
        class="inline-flex items-center justify-center gap-4 bg-linear-to-br from-yellow-100 to-yellow-50 px-10 py-5 rounded-3xl border-4 border-white shadow-xl"
      >
        <div class="bg-yellow-400 p-2 rounded-full shadow-inner">
          <Icon
            name="lucide:circle-dollar-sign"
            class="text-white text-3xl md:text-4xl"
          />
        </div>
        <span
          class="text-4xl md:text-5xl font-black text-yellow-700 tracking-tighter"
          >+{{ ddvProgress.config.learningLevelUpReward }}</span
        >
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col gap-4 w-full">
        <UiButton
          @click="router.push('/ddv/learn')"
          variant="white"
          icon="lucide:layout-grid"
          class="flex-1 py-4 text-xl h-auto w-full"
        >
          <span class="font-black">MENU UTAMA</span>
        </UiButton>
        <div v-if="isPremium">
          <UiButton
            v-if="hasNextLevel"
            @click="goToNextLevel"
            variant="accent"
            icon="lucide:play-circle"
            class="flex-1 py-4 text-xl h-auto w-full"
          >
            <span class="font-black">LEVEL BERIKUTNYA</span>
          </UiButton>
        </div>
        <div v-else>
          <UiButton
            @click="router.push('/parent/premium')"
            variant="accent"
            icon="lucide:crown"
            class="flex-1 py-4 text-xl h-auto w-full"
          >
            <span class="font-black">UNLOCK LEVEL SELANJUTNYA</span>
          </UiButton>
        </div>
      </div>
    </div>
  </UiCelebrationModal>
  <div v-if="level" class="flex flex-col h-[85vh] relative justify-between">
    <!-- Top Bar -->
    <div
      class="z-10 w-full max-w-5xl mx-auto px-4 pt-4 flex items-center justify-between"
    >
      <UiButton
        @click="router.push('/ddv/learn')"
        variant="danger"
        icon="lucide:x"
        class="size-12 rounded-full p-0 flex items-center justify-center shadow-sm"
      />
      <DdvProgressTracker
        :current="
          level.type === 'quiz'
            ? Math.min(currentIndex, items.length)
            : Math.min(currentIndex + 1, items.length)
        "
        :total="items.length"
        :level-name="level.name"
        class="flex-1 max-w-lg mx-4"
      />
      <div class="size-12"></div>
    </div>

    <!-- Main Quiz Area -->
    <div
      class="relative w-full max-w-4xl flex flex-col items-center justify-center mx-auto"
    >
      <div
        v-if="currentItem"
        class="relative w-full max-w-4xl flex flex-col items-center"
      >
        <!-- Level Type: Diphthong or Cluster -->
        <template v-if="level.type === 'diphthong' || level.type === 'cluster'">
          <VowelSlideAnimation
            v-if="!showResult"
            :vowel1="(currentItem as DdvDiphthongItem).vowel1"
            :vowel2="(currentItem as DdvDiphthongItem).vowel2"
            :is-animating="isAnimating"
            :is-complete="isComplete"
            :type="level.type"
          />
          <VowelFusedResult
            v-if="showResult"
            :text="(currentItem as DdvDiphthongItem).fused"
            :emoji="currentItem.emoji"
            :show="showResult"
          />
        </template>

        <!-- Level Type: Word Lab -->
        <template v-else-if="level.type === 'wordlab'">
          <WordLabDisplay
            :word="(currentItem as DdvWordItem).word"
            :syllables="(currentItem as DdvWordItem).syllables"
            :highlight="(currentItem as DdvWordItem).highlight"
            :highlightIndex="(currentItem as DdvWordItem).highlightIndex"
            :emoji="currentItem.emoji"
            :show="true"
          />
        </template>

        <!-- Level Type: Quiz (Connect Game) -->
        <template v-else-if="level.type === 'quiz'">
          <VowelConnectQuiz
            :pairs="items as DdvConnectPair[]"
            @match="currentIndex++"
            @complete="levelFinished = true"
          />
        </template>
      </div>
    </div>
    <!-- Control Area (Not for Quiz type as it handles completion) -->
    <div v-if="level.type !== 'quiz'" class="mt-4 md:mt-8 z-20 mx-auto">
      <Transition name="fade-up" mode="out-in">
        <!-- Merge Button for Diphthong/Cluster -->
        <DdvMergeButton
          v-if="
            !isComplete &&
            (level.type === 'diphthong' || level.type === 'cluster')
          "
          @merge="handleMerge"
          :is-animating="isAnimating"
        />
        <!-- Listen Button for Word Lab -->
        <UiButton
          v-else-if="!isComplete && level.type === 'wordlab'"
          @click="handleComplete"
          variant="success"
          class="px-8 md:px-16 py-4 md:py-6 text-xl md:text-3xl h-auto"
        >
          <span class="font-black">SAYA SUDAH TAHU!</span>
          <Icon name="lucide:check" class="size-6 md:size-8 ml-2" />
        </UiButton>
        <!-- Next Button -->
        <UiButton
          v-else
          @click="nextItem"
          variant="accent"
          class="px-8 md:px-16 py-4 md:py-6 text-xl md:text-3xl h-auto"
        >
          <span class="font-black">LANJUT</span>
          <Icon name="lucide:arrow-right" class="size-6 md:size-8 ml-2" />
        </UiButton>
      </Transition>
    </div>

    <!-- Background Pattern -->
    <!-- <div
      class="fixed inset-0 pointer-events-none opacity-[0.03] -z-10 overflow-hidden"
    >
      <div class="grid grid-cols-6 gap-20 transform rotate-12 -translate-y-20">
        <Icon
          v-for="i in 24"
          :key="i"
          name="lucide:audio-lines"
          class="size-32"
        />
      </div>
    </div> -->
  </div>
</template>

<style scoped>
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
