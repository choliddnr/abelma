<script setup lang="ts">
import TracingCanvas from "@/components/TracingCanvas.vue";

const route = useRoute();
const router = useRouter();
const letter = (route.params.id as string) || "A";

const tracingCanvasRef = ref<InstanceType<typeof TracingCanvas> | null>(null);
const { changeCoins } = useProfileStore();
const showResult = ref(false);
const scoreResult = ref({ score: 0, stars: 0, coverage: 0, accuracy: 0 });
const coinsEarned = ref(0);
const showIncompleteToast = ref(false);
const isScrambled = ref(false);

const goBack = () => router.push(`/alphabet/${letter}`);

const isScoring = ref(false);

const clearTracing = () => {
  if (tracingCanvasRef.value) {
    tracingCanvasRef.value.clearCanvas();
  }
};

const onSaved = async () => {
  if (!tracingCanvasRef.value || isScoring.value) return;
  isScoring.value = true;

  try {
    const result = await tracingCanvasRef.value.calculateScore();
    if (result.isScrambled) {
      isScrambled.value = true;
      showIncompleteToast.value = true;
      speakTTS("Tulis lebih rapi lagi yaa!", {
        rate: 0.85,
        pitch: 1.1,
      });
      clearTracing();
      setTimeout(() => {
        showIncompleteToast.value = false;
        isScrambled.value = false;
      }, 3000);
      return;
    }
    if (result.score === 0) {
      showIncompleteToast.value = true;
      speakTTS("Sepertinya kamu belum selesai menulis huruf ini!", {
        rate: 0.85,
        pitch: 1.1,
      });
      setTimeout(() => {
        showIncompleteToast.value = false;
      }, 3000);
      return;
    }

    scoreResult.value = result;

    if (result.stars === 5) {
      coinsEarned.value = 15;
      changeCoins(15);
    } else if (result.stars === 4) {
      coinsEarned.value = 10;
      changeCoins(10);
    } else if (result.stars === 3) {
      coinsEarned.value = 5;
      changeCoins(5);
    } else if (result.stars === 2) {
      coinsEarned.value = 2;
      changeCoins(2);
    } else {
      coinsEarned.value = 0;
    }

    showResult.value = true;
  } finally {
    isScoring.value = false;
  }
};

const retry = () => {
  showResult.value = false;
  clearTracing();
};
</script>

<template>
  <div
    class="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-6xl mx-auto px-4 py-4 sm:py-8 gap-4 sm:gap-8"
  >
    <div class="w-full flex justify-center items-center">
      <h1
        class="text-2xl sm:text-4xl font-black text-blue-600 tracking-wide text-center bg-white/80 px-6 sm:px-8 py-2 sm:py-3 rounded-full shadow-sm"
      >
        Ayo Belajar Menulis Huruf {{ letter.toUpperCase() }}!
      </h1>

      <!-- Ghost div for flex alignment -->
      <div class="hidden sm:block w-[120px]"></div>
    </div>

    <!-- Canvas Container -->
    <div
      class="w-full grow relative bg-white/50 backdrop-blur-md rounded-[40px] p-6 shadow-xl border-4 border-white"
    >
      <TracingCanvas ref="tracingCanvasRef" :letter="letter" />
    </div>

    <!-- Actions -->
    <div class="flex gap-4 sm:gap-6 mt-4 mx-4 sm:mx-10">
      <UiButton
        @click="clearTracing"
        variant="white"
        label="Ulangi"
        icon="🔄"
        class="h-12 sm:h-14 px-4 sm:px-6 text-sm sm:text-base"
      />
      <UiButton
        @click="onSaved"
        variant="success"
        label="Selesai!"
        icon="🌟"
        class="h-12 sm:h-14 px-4 sm:px-6 text-sm sm:text-base"
      />
    </div>

    <!-- Result Modal Overlay -->
    <div
      v-if="showResult"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        class="bg-white rounded-[24px] sm:rounded-[40px] p-5 sm:p-8 max-w-lg w-full shadow-2xl border-4 sm:border-8 border-blue-400 flex flex-col items-center text-center animate-bounce-in"
      >
        <h2
          class="text-2xl sm:text-4xl font-black text-blue-600 mb-3 sm:mb-6 drop-shadow-sm"
        >
          {{
            scoreResult.stars === 5
              ? "Sempurna!"
              : scoreResult.stars === 4
                ? "Luar Biasa!"
                : scoreResult.stars === 3
                  ? "Bagus Sekali!"
                  : scoreResult.stars === 2
                    ? "Cukup Bagus"
                    : "Ayo Coba Lagi!"
          }}
        </h2>

        <div class="flex gap-2 sm:gap-4 text-4xl sm:text-6xl mb-3 sm:mb-6">
          <span
            v-for="i in 5"
            :key="i"
            class="transition-all duration-500 transform"
            :class="
              i <= scoreResult.stars
                ? 'text-yellow-400 scale-110 drop-shadow-lg'
                : 'text-gray-300 scale-90 grayscale'
            "
            >⭐</span
          >
        </div>

        <div
          v-if="coinsEarned > 0"
          class="bg-yellow-100 border-2 sm:border-4 border-yellow-400 text-yellow-700 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-lg sm:text-2xl font-bold mb-4 sm:mb-8 flex items-center gap-2"
        >
          <span>💰</span> +{{ coinsEarned }} Koin!
        </div>
        <div
          v-else
          class="text-base sm:text-xl font-bold text-gray-500 mb-4 sm:mb-8"
        >
          Gambar lebih rapi for dapat koin!
        </div>

        <div class="flex gap-3 sm:gap-4 w-full">
          <button
            @click="retry"
            class="flex-1 btn-bubble bg-gray-100 text-gray-700 font-bold text-base sm:text-xl py-3 sm:py-4 border-4 border-gray-300"
          >
            Ulangi
          </button>
          <button
            @click="goBack"
            class="flex-1 btn-primary text-base sm:text-xl py-3 sm:py-4"
          >
            Lanjut
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <transition name="toast">
      <div
        v-if="showIncompleteToast"
        class="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-red-500 border-4 border-red-300 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-lg sm:text-2xl shadow-2xl flex items-center gap-3 sm:gap-4 w-[90%] sm:w-auto justify-center"
      >
        <span class="text-2xl sm:text-3xl">⚠️</span>
        {{
          isScrambled
            ? "Tulis lebih rapi lagi yaa!"
            : "Sepertinya kamu belum selesai menggambar! Ayo coba lagi! 😊"
        }}
      </div>
    </transition>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
