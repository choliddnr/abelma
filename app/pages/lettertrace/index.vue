<script setup lang="ts">
import { useTraceStore } from "@/stores/traceStore";
import { useProfileStore } from "@/stores/profileStore";
import { useMentorStore } from "@/stores/mentorStore";
import TracingCanvas from "@/components/TracingCanvas.vue";

const traceStore = useTraceStore();
const profileStore = useProfileStore();
const mentorStore = useMentorStore();
const { changeCoins } = profileStore;

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const selectedLetter = ref("A");
const uppercaseCanvasRef = ref<InstanceType<typeof TracingCanvas> | null>(null);
const lowercaseCanvasRef = ref<InstanceType<typeof TracingCanvas> | null>(null);

const colors = [
  "#28abb9", // Teal
  "#e74c3c", // Red
  "#3498db", // Blue
  "#f1c40f", // Yellow
  "#2ecc71", // Green
  "#9b59b6", // Purple
  "#e67e22", // Orange
  "#333333", // Dark Gray
];

// const colors = [
//   "#000080", // Navy
//   "#0099ff", // Light Blue
//   "#008080", // Teal
//   "#008000", // Green
//   "#ff6600", // Orange
//   "#800080", // Purple
//   "#ff0000", // Red
// ];
const activeColor = ref<string>(colors[2]!);

const showResult = ref(false);
const resultData = ref({ score: 0, stars: 0, coins: 0 });
const isScoring = ref(false);

onMounted(async () => {
  await traceStore.fetch();
  // Default to 'A' or first letter not completed
  const firstEmpty = letters.find(l => !traceStore.traceProgress.stars[l]);
  if (firstEmpty) selectedLetter.value = firstEmpty;
});

const selectLetter = (letter: string) => {
  selectedLetter.value = letter;
  clearAll();
};

const clearAll = () => {
  uppercaseCanvasRef.value?.clearCanvas();
  lowercaseCanvasRef.value?.clearCanvas();
  showResult.value = false;
};

const handleFinish = async () => {
  if (isScoring.value) return;
  isScoring.value = true;

  try {
    const resUpper = await uppercaseCanvasRef.value?.calculateScore();
    const resLower = await lowercaseCanvasRef.value?.calculateScore();

    if (!resUpper || !resLower) return;

    if (resUpper.isScrambled || resLower.isScrambled) {
      mentorStore.showMessage("Tulis lebih rapi lagi yaa!");
      return;
    }

    if (resUpper.score === 0 || resLower.score === 0) {
      mentorStore.showMessage("Selesaikan kedua hurufnya ya!");
      return;
    }

    // Average stars
    const avgStars = Math.ceil((resUpper.stars + resLower.stars) / 2);
    const coins = avgStars > 0 ? (traceStore.traceProgress.config[avgStars - 1] || 0) : 0;

    resultData.value = {
      score: Math.round((resUpper.score + resLower.score) / 2),
      stars: avgStars,
      coins: coins
    };

    if (avgStars > 0) {
      await traceStore.saveStar(selectedLetter.value, avgStars);
      changeCoins(coins);
    }

    showResult.value = true;
    
    if (avgStars === 5) {
        mentorStore.showMessage("Luar biasa! Sempurna!");
    } else {
        mentorStore.showMessage("Bagus sekali! Terus berlatih ya!");
    }

  } finally {
    isScoring.value = false;
  }
};

const nextLetter = () => {
  const idx = letters.indexOf(selectedLetter.value);
  if (idx < letters.length - 1) {
    selectLetter(letters[idx + 1]!);
  }
};

const prevLetter = () => {
  const idx = letters.indexOf(selectedLetter.value);
  if (idx > 0) {
    selectLetter(letters[idx - 1]!);
  }
};

// Scroll carousel to selected letter
const carouselRef = ref<HTMLElement | null>(null);
watch(selectedLetter, () => {
  nextTick(() => {
    const el = document.getElementById(`letter-${selectedLetter.value}`);
    if (el && carouselRef.value) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  });
});

</script>

<template>
  <div class="h-[90vh]  flex flex-col items-center p-2 sm:p-8 font-sans overflow-x-hidden">
    <!-- Header/Title -->
    <div class="w-full max-w-5xl flex justify-between items-center mb-8">
       <button @click="$router.back()" class="p-2 rounded-full hover:bg-gray-200 transition-colors">
         <Icon name="lucide:arrow-left" class="text-3xl text-gray-600" />
       </button>
       <h1 class="text-3xl sm:text-4xl font-black text-gray-800 text-center flex-1">
         Belajar Menulis Huruf Yuk!
       </h1>
       <div class="w-12"></div> <!-- Spacer -->
    </div>

    <!-- Main Content: Tracing Area -->
    <div class="w-full max-w-5xl flex-1 flex flex-col items-center justify-center gap-8 relative">
      
      <!-- Navigation Arrows (Desktop) -->
      <button 
        @click="prevLetter" 
        class="absolute left-0 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center"
        :disabled="selectedLetter === 'A'"
      >
        <div class="w-16 h-16 bg-[#ff6600] rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95 disabled:opacity-50 disabled:grayscale">
          <Icon name="lucide:chevron-left" class="text-4xl text-white stroke-[4px]" />
        </div>
      </button>

      <button 
        @click="nextLetter" 
        class="absolute right-0 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center"
        :disabled="selectedLetter === 'Z'"
      >
        <div class="w-16 h-16 bg-[#ff6600] rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95 disabled:opacity-50 disabled:grayscale">
          <Icon name="lucide:chevron-right" class="text-4xl text-white stroke-[4px]" />
        </div>
      </button>

      <!-- Cards Container -->
      <div class="flex flex-row gap-2 w-full justify-center items-stretch">
        <!-- Uppercase Card -->
        <!-- <div class="flex-1 shadow-xl relative">
        </div> -->
        <TracingCanvas 
          ref="uppercaseCanvasRef" 
          :letter="selectedLetter.toUpperCase()" 
          :show-picker="false"
          :brush-color="activeColor"
          class="bg-white border-[#ff6600] rounded-4xl border-8 shadow-xl relative max-w-[180px] max-h-[240px]"
        />
        
         <TracingCanvas 
            ref="lowercaseCanvasRef" 
            :letter="selectedLetter.toLowerCase()" 
            :show-picker="false"
            :brush-color="activeColor"
            class="bg-white border-[#ff6600] rounded-4xl border-8 shadow-xl relative max-w-[180px] max-h-[240px]"
          />
        <!-- Lowercase Card -->
        <!-- <div class="flex-1 bg-white border-[6px] border-[#ff6600] rounded-[40px] p-6 shadow-xl relative min-h-[350px] sm:min-h-[450px]">
          <TracingCanvas 
            ref="lowercaseCanvasRef" 
            :letter="selectedLetter.toLowerCase()" 
            :show-picker="false"
            :color="activeColor"
            class="!border-none !shadow-none !rounded-none"
          />
        </div> -->
      </div>

      <!-- Colors & Actions -->
      <div class="flex flex-col items-center gap-6 w-full">
        <!-- Color Palette -->
        <div class="flex gap-3 bg-white/50 backdrop-blur-sm p-3 rounded-full shadow-inner">
          <button 
            v-for="color in colors" 
            :key="color"
            @click="activeColor = color"
            class="w-8 h-8 rounded-full transition-transform hover:scale-125"
            :class="activeColor === color ? 'ring-4 ring-white shadow-md scale-110' : ''"
            :style="{ backgroundColor: color }"
          ></button>
        </div>

        <!-- Buttons -->
        <div class="flex gap-4">
          <button 
            @click="clearAll"
            class="px-8 py-3 bg-[#d1d5db] text-gray-800 font-black text-xl rounded-2xl shadow-[0_6px_0_0_#9ca3af] hover:translate-y-1 hover:shadow-[0_2px_0_0_#9ca3af] transition-all active:translate-y-[6px] active:shadow-none flex items-center gap-2"
          >
            <Icon name="lucide:rotate-ccw" /> ULANGI
          </button>
          <button 
            @click="handleFinish"
            class="px-8 py-3 bg-[#ff6600] text-white font-black text-xl rounded-2xl shadow-[0_6px_0_0_#cc5200] hover:translate-y-1 hover:shadow-[0_2px_0_0_#cc5200] transition-all active:translate-y-[6px] active:shadow-none flex items-center gap-2"
          >
            <Icon name="lucide:star" /> SELESAI
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Letter Carousel -->
    <div class="w-full mt-12 bg-white/30 backdrop-blur-md py-6 border-t-2 border-white/50">
      <div 
        ref="carouselRef"
        class="flex gap-4 overflow-x-auto px-8 pb-4 scrollbar-hide snap-x"
      >
        <button 
          v-for="letter in letters" 
          :key="letter"
          :id="`letter-${letter}`"
          @click="selectLetter(letter)"
          class="flex-shrink-0 text-white w-24 h-24 rounded-3xl flex flex-col items-center justify-center transition-all snap-center"
          :class="[
            selectedLetter === letter 
              ? 'bg-[#008080] shadow-lg' 
              : 'bg-[#ff6600] border-4 border-[#ff6600] hover:bg-orange-50'
          ]"
        >
          <!-- Stars -->
          <div class="flex gap-0 mb-1 h-3">
             <Icon 
               v-for="i in traceStore.traceProgress.stars[letter]" 
               :key="i" 
               name="material-symbols:star-rounded" 
               class="text-[18px]"
               :class="i <= (traceStore.traceProgress.stars[letter] || 0) ? 'fill-current' : 'opacity-30'"
             />
          </div>
          <span class="text-3xl font-black">{{ letter }}</span>
        </button>
      </div>
    </div>

    <!-- Result Modal -->
    <UiCelebrationModal
      v-model="showResult"
      :title="resultData.stars === 5 ? 'Sempurna!' : 'Bagus Sekali!'"
      :reward-amount="resultData.coins"
    >
      <div class="flex justify-center gap-2 text-5xl sm:text-6xl mb-6">
        <Icon 
          v-for="i in 5" 
          :key="i" 
          name="lucide:star" 
          class="transition-all duration-500"
          :class="i <= resultData.stars ? 'text-yellow-400 fill-yellow-400 scale-110' : 'text-gray-200'"
        />
      </div>

      <div v-if="resultData.coins > 0" class="bg-yellow-100 border-4 border-yellow-400 text-yellow-700 px-8 py-3 rounded-full text-2xl font-black mb-8 flex items-center justify-center gap-3">
        <Icon name="lucide:circle-dollar-sign" class="text-amber-500 text-3xl" /> +{{ resultData.coins }} Koin!
      </div>

      <div class="flex gap-4 w-full">
        <UiButton
          @click="clearAll"
          variant="white"
          label="Ulangi"
          class="flex-1 py-4 text-xl"
        />
        <UiButton
          @click="nextLetter"
          variant="primary"
          label="Lanjut"
          class="flex-1 py-4 text-xl"
        />
      </div>
    </UiCelebrationModal>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}


:deep(.tracing-canvas-color-picker) {
  display: none !important;
}
</style>
