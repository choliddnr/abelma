<script setup lang="ts">
const isPortrait = ref(false);

const checkOrientation = () => {
  if (typeof window !== "undefined") {
    // Only show on mobile/tablet (max-width 1024px)
    if (window.innerWidth <= 1024) {
      isPortrait.value = window.innerHeight > window.innerWidth;
    } else {
      isPortrait.value = false;
    }
  }
};

const tryLockOrientation = async () => {
  if (typeof screen !== "undefined" && screen.orientation && screen.orientation.lock) {
    try {
      // @ts-ignore - lock might not be in the type defs for all versions
      await screen.orientation.lock("landscape");
    } catch (e) {
      console.warn("Orientation lock failed:", e);
    }
  }
};

onMounted(() => {
  checkOrientation();
  window.addEventListener("resize", checkOrientation);
  window.addEventListener("orientationchange", checkOrientation);

  // Try to lock on mount
  tryLockOrientation();
});

onUnmounted(() => {
  window.removeEventListener("resize", checkOrientation);
  window.removeEventListener("orientationchange", checkOrientation);
});
</script>

<template>
  <Transition name="fade">
    <div
      v-if="isPortrait"
      class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FFF9E3] p-8 text-center"
    >
      <div
        class="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
        style="background-image: url(&quot;/bg1.webp&quot;)"
      ></div>

      <div class="relative z-10 flex flex-col items-center">
        <div class="relative w-48 h-48 mb-12">
          <!-- Animated Phone Rotation -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div
              class="w-24 h-44 border-6 border-[#8B7700] rounded-3xl relative flex items-center justify-center overflow-hidden bg-white shadow-2xl rotate-phone"
            >
              <div
                class="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#8B7700]/10 rounded-full"
              ></div>
              <div class="w-12 h-12 rounded-full bg-primary/30 animate-pulse"></div>
              <div
                class="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-[#8B7700]/10"
              ></div>
            </div>
          </div>

          <!-- Rotation Arrows Overlay -->
          <svg
            class="absolute inset-0 w-full h-full text-primary animate-spin-slow opacity-40"
            viewBox="0 0 100 100"
          >
            <path
              d="M50 10 A40 40 0 0 1 90 50"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-dasharray="10 5"
            />
            <path
              d="M90 50 L85 40 M90 50 L99 43"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
            />
            <path
              d="M50 90 A40 40 0 0 1 10 50"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-dasharray="10 5"
            />
            <path
              d="M10 50 L15 60 M10 50 L1 57"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
            />
          </svg>
        </div>

        <h1 class="text-4xl font-black text-[#8B7700] mb-4 drop-shadow-sm">Putar Layar Kamu!</h1>
        <p class="text-2xl font-bold text-[#A69200] max-w-sm leading-relaxed">
          Abelma paling asik dimainkan dalam posisi
          <span class="text-primary-dark">Landscape</span> (miring).
        </p>

        <button @click="tryLockOrientation" class="mt-12 group relative">
          <div
            class="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all"
          ></div>
          <div class="btn-primary relative z-10 flex items-center gap-3">
            <span class="text-2xl">🔄</span>
            Ok, Mengerti!
          </div>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes rotate-phone {
  0% {
    transform: rotate(0deg);
  }
  20% {
    transform: rotate(0deg);
  }
  40% {
    transform: rotate(90deg);
  }
  70% {
    transform: rotate(90deg);
  }
  90% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

.rotate-phone {
  animation: rotate-phone 5s infinite cubic-bezier(0.65, 0, 0.35, 1);
}

.animate-spin-slow {
  animation: spin 10s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.text-primary-dark {
  color: #8b7700;
}
</style>
