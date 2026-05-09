<script setup lang="ts">
import {
  cvcLevels,
  type CvcItem,
  type CvcWordItem,
} from "~/constants/cvcBlends";
import { useCvcStore } from "~/stores/cvcStore";
import { useAudio } from "~/composables/useAudio";
import confetti from "canvas-confetti";
import ProgressTracker from "~/components/cvc/ProgressTracker.vue";
import MergeAnimation from "~/components/cvc/MergeAnimation.vue";
import MergeButton from "~/components/cvc/MergeButton.vue";
import BlendResultDisplay from "~/components/cvc/BlendResultDisplay.vue";

const route = useRoute();
const router = useRouter();
const cvcStore = useCvcStore();
const { cvcProgress } = storeToRefs(cvcStore);
const { play, playWordAudio } = useAudio();
const { activeProfileId, changeCoins } = useProfileStore();
const { isPremium } = useSubscription();

// Level Setup
const levelId = computed(() => Number(route.params.level) || 1);
const level = computed(() => cvcLevels.find((l) => l.id === levelId.value));

if (!level.value) {
  router.replace("/cvc");
}

const shuffledItems = ref<any[]>([]);

// Game State
const currentIndex = ref(0);
const isAnimating = ref(false);
const isComplete = ref(false);
const showResult = ref(false);
const levelFinished = ref(false);

const currentItem = computed(() => shuffledItems.value[currentIndex.value]);

const part1 = computed(() => {
  if (!currentItem.value) return "";
  return "cv" in currentItem.value
    ? currentItem.value.cv
    : currentItem.value.part1;
});

const part2 = computed(() => {
  if (!currentItem.value) return "";
  return "c" in currentItem.value
    ? currentItem.value.c
    : currentItem.value.part2;
});

const resultText = computed(() => {
  if (!currentItem.value) return "";
  return "blend" in currentItem.value
    ? currentItem.value.blend
    : currentItem.value.word;
});

// Actions
const handleMerge = async () => {
  if (isAnimating.value || isComplete.value) return;

  isAnimating.value = true;

  // Animation duration matches CSS
  await new Promise((resolve) => setTimeout(resolve, 800));

  isAnimating.value = false;
  isComplete.value = true;
  showResult.value = true;

  // Play success audio
  playWordAudio(resultText.value);
  popConfetti();

  // Update score and weight in store
  await cvcStore.updateScore(levelId.value, 5);
  cvcStore.updateLearningWeight(currentItem.value.id);
};

const nextItem = () => {
  if (currentIndex.value < shuffledItems.value.length - 1) {
    currentIndex.value++;
    isComplete.value = false;
    showResult.value = false;
  } else {
    levelFinished.value = true;
    const reward = cvcProgress.value.config.learningLevelUpReward || 50;
    changeCoins(reward);
  }
};

const popConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#A084E8", "#FFD93D", "#6BCB77", "#4D96FF"],
  });
};

const hasNextLevel = computed(() => {
  const currentIndex = cvcLevels.findIndex((l) => l.id === levelId.value);
  return currentIndex !== -1 && currentIndex < cvcLevels.length - 1;
});

const nextLevelId = computed(() => {
  const currentIndex = cvcLevels.findIndex((l) => l.id === levelId.value);
  return cvcLevels[currentIndex + 1]?.id;
});

const goToNextLevel = () => {
  if (nextLevelId.value) {
    // Navigate and reset state
    router.push(`/cvc/learn/${nextLevelId.value}`);
    levelFinished.value = false;
    currentIndex.value = 0;
    isComplete.value = false;
    showResult.value = false;
    // Nuxt will reuse the component, so we manually reset or use a key
  }
};

onMounted(async () => {
  await cvcStore.fetch();
  if (!isPremium.value && levelId.value > 1) {
    router.replace("/parent/premium");
  }
  if (level.value) {
    // Sort items by weight (lower weight first), randomize ties
    shuffledItems.value = [...level.value.items].sort((a, b) => {
      const weightA = cvcProgress.value.learningWeights?.[a.id] ?? 0;
      const weightB = cvcProgress.value.learningWeights?.[b.id] ?? 0;
      if (weightA !== weightB) {
        return weightA - weightB;
      }
      return Math.random() - 0.5;
    });
    play(`Mari kita belajar ${level.value.name}!`);
  }
});

onUnmounted(async () => {
  await cvcStore.syncToServer();
});
</script>

<template>
  <div>
    <!-- Celebration Modal -->
    <UiCelebrationModal
      v-model="levelFinished"
      title="HEBAT!"
      :message="`Kamu telah menyelesaikan ${level!.name}!`"
      main-emoji="🏆"
    >
      <div class="flex flex-col items-center gap-6">
        <!-- Coins Reward Badge (Manually added back since we're using the slot) -->
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
            >+{{ cvcProgress.config.learningLevelUpReward }}</span
          >
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col gap-4 w-full">
          <UiButton
            @click="router.push('/cvc')"
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
          @click="navigateTo('/cvc/learn')"
          variant="accent"
          icon="lucide:x"
        />
        <ProgressTracker
          :current="currentIndex + 1"
          :total="shuffledItems.length"
          :level-name="level.name"
          class="flex-1 max-w-lg mx-4"
        />
        <div class="size-12"></div>
        <!-- Spacer -->
      </div>
      <div
        class="relative w-full max-w-4xl flex flex-col items-center justify-center mx-auto"
      >
        <!-- Animation Layer -->
        <MergeAnimation
          v-if="!showResult"
          :part1="part1"
          :part2="part2"
          :is-animating="isAnimating"
          :is-complete="isComplete"
          :type="level.type"
        />

        <!-- Result Layer -->
        <BlendResultDisplay
          v-if="showResult"
          :text="part1 + part2"
          :result="resultText"
          :emoji="currentItem?.emoji || '✨'"
          :type="level.type"
          :show="showResult"
        />
      </div>

      <!-- Control Area -->
      <div class="my-10 mx-auto z-20">
        <Transition name="fade-up" mode="out-in">
          <MergeButton
            v-if="!isComplete"
            @merge="handleMerge"
            :is-animating="isAnimating"
          />
          <UiButton
            v-else
            @click="nextItem"
            variant="accent"
            class="px-16 py-6 text-3xl h-auto"
          >
            <span class="font-black">LANJUT</span>
            <Icon name="lucide:arrow-right" class="size-8 ml-2" />
          </UiButton>
        </Transition>
      </div>
    </div>
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
