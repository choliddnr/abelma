<script setup lang="ts">
import TracingCanvas from "@/components/TracingCanvas.vue";

const route = useRoute();
const router = useRouter();
const letter = (route.params.id as string) || "A";

const tracingCanvasRef = ref<InstanceType<typeof TracingCanvas> | null>(null);
const rewardStore = useRewardStore();
const showResult = ref(false);
const scoreResult = ref({ score: 0, stars: 0, coverage: 0, accuracy: 0 });
const coinsEarned = ref(0);
const showIncompleteToast = ref(false);

const goBack = () => router.push(`/alphabet/${letter}`);

const clearTracing = () => {
  if (tracingCanvasRef.value) {
    tracingCanvasRef.value.clearCanvas();
  }
};

const onSaved = () => {
  if (tracingCanvasRef.value) {
    const result = tracingCanvasRef.value.calculateScore();

    if (result.score === 0) {
      showIncompleteToast.value = true;
      setTimeout(() => {
        showIncompleteToast.value = false;
      }, 3000);
      return;
    }

    scoreResult.value = result;

    if (result.stars === 5) {
      coinsEarned.value = 15;
      rewardStore.addCoins(15);
    } else if (result.stars === 4) {
      coinsEarned.value = 10;
      rewardStore.addCoins(10);
    } else if (result.stars === 3) {
      coinsEarned.value = 5;
      rewardStore.addCoins(5);
    } else if (result.stars === 2) {
      coinsEarned.value = 2;
      rewardStore.addCoins(2);
    } else {
      coinsEarned.value = 0;
    }

    showResult.value = true;
  }
};

const retry = () => {
  showResult.value = false;
  clearTracing();
};
</script>

<template>
  <div
    class="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-6xl mx-auto px-4 py-8 gap-8"
  >
    <div class="w-full flex justify-between items-center">
      <button
        @click="goBack"
        class="btn-bubble bg-white px-6 py-3 text-xl font-bold text-gray-700 border-2 shadow-sm focus:outline-none"
      >
        ← Kembali
      </button>

      <h1
        class="text-4xl font-black text-blue-600 tracking-wide text-center bg-white/80 px-8 py-3 rounded-full shadow-sm"
      >
        Ayo Belajar Menulis Huruf {{ letter.toUpperCase() }}!
      </h1>

      <!-- Ghost div for flex alignment -->
      <div class="w-[120px]"></div>
    </div>

    <!-- Canvas Container -->
    <div
      class="w-full h-full grow relative bg-white/50 backdrop-blur-md rounded-[40px] p-6 shadow-xl border-4 border-white"
    >
      <TracingCanvas ref="tracingCanvasRef" :letter="letter" />
    </div>

    <!-- Actions -->
    <div class="flex gap-6 mt-4">
      <button
        @click="clearTracing"
        class="flex items-center gap-2 bg-red-100/80 hover:bg-red-200 text-red-600 px-8 py-4 rounded-full font-bold text-2xl border-4 border-red-300 shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <span>🔄</span> Ulangi
      </button>

      <button
        @click="onSaved"
        class="flex items-center gap-2 bg-green-400 hover:bg-green-500 text-white px-12 py-4 rounded-full font-black text-2xl border-b-8 border-green-600 shadow-xl transition-transform hover:-translate-y-1 active:translate-y-2"
      >
        <span>🌟</span> Selesai!
      </button>
    </div>

    <!-- Result Modal Overlay -->
    <div
      v-if="showResult"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        class="bg-white rounded-[40px] p-8 max-w-lg w-full shadow-2xl border-8 border-blue-400 flex flex-col items-center text-center animate-bounce-in"
      >
        <h2 class="text-4xl font-black text-blue-600 mb-6 drop-shadow-sm">
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

        <div class="flex gap-4 text-6xl mb-6">
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
          class="bg-yellow-100 border-4 border-yellow-400 text-yellow-700 px-6 py-3 rounded-full text-2xl font-bold mb-8 flex items-center gap-2"
        >
          <span>💰</span> +{{ coinsEarned }} Koin!
        </div>
        <div v-else class="text-xl font-bold text-gray-500 mb-8">
          Gambar lebih rapi untuk dapat koin!
        </div>

        <div class="flex gap-4 w-full">
          <button
            @click="retry"
            class="flex-1 btn-bubble bg-gray-100 text-gray-700 font-bold text-xl py-4 border-4 border-gray-300"
          >
            Ulangi
          </button>
          <button @click="goBack" class="flex-1 btn-primary text-xl py-4">
            Lanjut
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <transition name="toast">
      <div
        v-if="showIncompleteToast"
        class="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-red-500 border-4 border-red-300 text-white px-8 py-4 rounded-full font-bold text-2xl shadow-2xl flex items-center gap-4"
      >
        <span class="text-3xl">⚠️</span> Sepertinya kamu belum selesai
        menggambar! Ayo coba lagi! 😊
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
