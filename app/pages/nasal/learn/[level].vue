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


    <!-- Top Bar -->
    <div class="z-10 w-full max-w-5xl mx-auto px-4 pt-4 flex items-center justify-between">
      <UiButton
        @click="router.push('/nasal')"
        variant="danger"
        icon="lucide:x"
        class="size-12 rounded-full p-0 flex items-center justify-center shadow-sm"
      />
       <!-- Progress Bar -->
        <div class="w-full max-w-2xl mx-auto px-4 py-2 md:py-6">
    <div class="flex items-center justify-between mb-3">
      <div class="flex flex-col">
        <span class="text-xs font-black text-orange-600 uppercase tracking-widest">Level</span>
        <h2 class="text-2xl font-bold text-orange-600">{{ level.description }}</h2>
      </div>
      <div class="flex flex-col items-end">
        <span class="text-sm font-black text-orange-600 uppercase tracking-widest">Kemajuan</span>
       <div class="px-4 py-2 bg-orange-100 text-orange-700 rounded-2xl font-black text-lg md:text-xl border-2 border-orange-200">
        {{ currentIndex + 1 }} / {{ items.length }}
      </div>
      </div>
    </div>

    <!-- Progress Bar Container -->
    <div class="relative h-6 bg-slate-200/50 backdrop-blur-sm rounded-full border-2 border-white shadow-inner p-1">
      <!-- Animated Progress Fill -->
      <div
        class="h-full bg-linear-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500 shadow-lg relative overflow-hidden"
        :style="{ width: `${((currentIndex + 1) / items.length) * 100}%` }"
      >
        <!-- Shine effect -->
        <div class="absolute inset-0 bg-linear-to-b from-white/30 to-transparent"></div>
        <div class="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
      </div>

      <!-- Segment markers -->
      <div class="absolute inset-0 flex justify-evenly items-center pointer-events-none">
        <div
          v-for="i in items.length - 1"
          :key="i"
          class="w-1 h-2 bg-white/20 rounded-full"
        ></div>
      </div>
    </div>
  </div>
      <div class="size-12"></div>
    </div>

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
