<script setup lang="ts">
import { nasalLevels, type NasalFusionItem, type NasalEndingItem, type NasalWordItem, type NasalQuizItem } from "~/constants/nasalData";
import { useNasalStore } from "~/stores/nasalStore";
import { useAudio } from "~/composables/useAudio";
import DigraphFusion from "~/components/nasal/DigraphFusion.vue";
import TailSoundAnchor from "~/components/nasal/TailSoundAnchor.vue";
import NasalWordPractice from "~/components/nasal/NasalWordPractice.vue";
import NasalQuiz from "~/components/nasal/NasalQuiz.vue";
import confetti from "canvas-confetti";

const route = useRoute();
const router = useRouter();
const nasalStore = useNasalStore();
const { nasalProgress } = storeToRefs(nasalStore);
const { play } = useAudio();
const { changeCoins } = useProfileStore();

const levelId = computed(() => Number(route.params.level) || 1);
const level = computed(() => nasalLevels.find((l) => l.id === levelId.value));

if (!level.value) {
  router.replace("/nasal");
}

const items = ref<any[]>([]);

if (level.value) {
  if (level.value.type === "quiz") {
    items.value = [...level.value.items].sort(() => Math.random() - 0.5);
  } else {
    items.value = [...level.value.items];
  }
}

const currentIndex = ref(0);
const levelFinished = ref(false);

const currentItem = computed(() => items.value[currentIndex.value]);

const handleStepComplete = async () => {
  // Update progress
  await nasalStore.updateScore(levelId.value, 10);
  
  if (currentIndex.value < items.value.length - 1) {
    currentIndex.value++;
  } else {
    finishLevel();
  }
};

const finishLevel = () => {
  levelFinished.value = true;
  const reward = nasalProgress.value.config.learningLevelUpReward || 50;
  changeCoins(reward);
  popConfetti();
  
  // Auto navigate back after delay
  setTimeout(() => {
    if (levelFinished.value) {
      router.push("/nasal");
    }
  }, 4000);
};

const popConfetti = () => {
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 },
    colors: ["#F97316", "#FB923C", "#FDBA74", "#FFD93D"],
  });
};

onMounted(async () => {
  await nasalStore.fetch();
  if (level.value) {
    play(`Mari kita belajar ${level.value.name}!`);
  }
});

onUnmounted(async () => {
  await nasalStore.syncToServer();
});
</script>

<template>
  <div v-if="level" class="flex flex-col min-h-[95vh] relative overflow-hidden">
    
    <!-- Celebration Modal -->
    <UiCelebrationModal
      v-model="levelFinished"
      title="LUAR BIASA!"
      :message="`Kamu hebat sekali belajar ${level.name}!`"
      main-emoji="🌟"
    >
      <div class="flex flex-col items-center gap-6">
        <div class="inline-flex items-center justify-center gap-4 bg-orange-50 px-10 py-5 rounded-3xl border-4 border-white shadow-xl">
          <div class="bg-orange-500 p-2 rounded-full shadow-inner">
            <Icon name="lucide:circle-dollar-sign" class="text-white text-3xl md:text-4xl" />
          </div>
          <span class="text-4xl md:text-5xl font-black text-orange-700 tracking-tighter">+{{ nasalProgress.config.learningLevelUpReward }}</span>
        </div>

        <UiButton
          @click="router.push('/nasal')"
          variant="accent"
          class="w-full py-4 text-xl h-auto"
        >
          <span class="font-black uppercase">Ke Dashboard</span>
        </UiButton>
      </div>
    </UiCelebrationModal>


    <!-- Standardized Quiz Header -->
    <QuizHeader
      :current="currentIndex + 1"
      :total="items.length"
      :level-description="level.description"
      back-path="/nasal"
    />

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col items-center justify-center relative py-4 px-4">
      
      <Transition name="fade-scale" mode="out-in">
        <div :key="currentIndex" class="w-full">
          
          <!-- FUSION LEVEL -->
          <template v-if="level.type === 'fusion'">
            <DigraphFusion
              v-bind="(currentItem as NasalFusionItem)"
              @fused="handleStepComplete"
            />
          </template>

          <!-- ENDING LEVEL -->
          <template v-else-if="level.type === 'ending'">
            <TailSoundAnchor
              :item="(currentItem as NasalEndingItem)"
              @complete="handleStepComplete"
            />
          </template>

          <!-- WORD LAB LEVEL -->
          <template v-else-if="level.type === 'wordlab'">
            <div class="flex flex-col items-center gap-8">
              <NasalWordPractice
                v-bind="(currentItem as NasalWordItem)"
              />
              
              <button 
                class="px-12 py-5 bg-orange-500 text-white rounded-[2rem] font-black text-2xl md:text-3xl shadow-2xl hover:bg-orange-600 transition-all hover:-translate-y-2 active:translate-y-0 border-b-[10px] border-orange-700"
                @click="handleStepComplete"
              >
                SAYA SUDAH TAHU!
              </button>
            </div>
          </template>

          <!-- QUIZ LEVEL -->
          <template v-else-if="level.type === 'quiz'">
            <NasalQuiz
              :item="(currentItem as NasalQuizItem)"
              @complete="handleStepComplete"
            />
          </template>

        </div>
      </Transition>

    </main>

    <!-- Background Elements -->
    <div class="fixed top-1/4 -left-20 p-8 opacity-5 pointer-events-none -z-10 rotate-45">
       <Icon name="lucide:music" class="size-64 text-orange-400" />
    </div>
  </div>
</template>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1.1) translateY(-20px);
}
.animate-shimmer {
  animation: shimmer 2s infinite linear;
  background-size: 200% 100%;
}
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
