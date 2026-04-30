<script setup lang="ts">
import confetti from "canvas-confetti";
import { watch } from "vue";

const props = defineProps<{
  modelValue: boolean;
  title?: string;
  message?: string;
  rewardAmount?: number | string | null;
  rewardIcon?: string;
  footerText?: string;
  mainEmoji?: string;
}>();

const emit = defineEmits(["update:modelValue"]);

const close = () => emit("update:modelValue", false);

const popConfetti = () => {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 200 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    // since particles fall down, start them a bit higher than random
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
};

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      popConfetti();
    }
  },
);
</script>

<template>
  <transition name="modal-fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[150] flex items-center justify-center p-4"
    >
      <!-- Deep Overlay -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-md"></div>

      <!-- Modal Card -->
      <div
        class="relative bg-white/90 backdrop-blur-2xl rounded-[3.5rem] p-8 md:p-14 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-4 border-white/80 max-w-lg w-full text-center overflow-hidden animate-pop-in"
        @click.stop
      >
        <!-- Animated Rays Background -->
        <div
          class="absolute inset-0 flex items-center justify-center -z-10 opacity-30"
        >
          <div
            class="w-[600px] h-[600px] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,217,61,0.4)_20deg,transparent_40deg)] animate-spin-slow"
          ></div>
        </div>

        <!-- Floating Particles -->
        <div
          class="absolute top-10 left-10 text-yellow-400 animate-float opacity-50"
        >
          ✨
        </div>
        <div
          class="absolute bottom-20 right-10 text-indigo-400 animate-float-delayed opacity-50"
        >
          ⭐
        </div>
        <div
          class="absolute top-40 right-12 text-emerald-400 animate-float opacity-50"
        >
          ✨
        </div>

        <!-- Icon/Emoji Section -->
        <div class="relative mb-8 flex justify-center">
          <!-- Glow Effect -->
          <div
            class="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full scale-150 animate-pulse"
          ></div>

          <div
            class="text-8xl md:text-9xl animate-float relative z-10 drop-shadow-2xl"
          >
            <template v-if="mainEmoji">{{ mainEmoji }}</template>
            <template v-else>
              <Icon
                :name="
                  rewardAmount ? 'lucide:circle-dollar-sign' : 'lucide:party-popper'
                "
                class="text-yellow-500"
              />
            </template>
          </div>
        </div>

        <!-- Content Section with Staggered Animation -->
        <div class="space-y-4 animate-slide-up">
          <h2
            v-if="title"
            class="text-4xl md:text-5xl font-black bg-linear-to-b from-yellow-600 to-yellow-800 bg-clip-text text-transparent uppercase tracking-tight leading-tight"
          >
            {{ title }}
          </h2>

          <p
            v-if="message"
            class="text-xl md:text-2xl font-bold text-slate-600/80 max-w-[280px] mx-auto"
          >
            {{ message }}
          </p>
        </div>

        <div class="mt-8 animate-slide-up-delayed">
          <slot>
            <div
              v-if="rewardAmount"
              class="inline-flex items-center justify-center gap-4 bg-linear-to-br from-yellow-100 to-yellow-50 px-10 py-5 rounded-3xl border-4 border-white shadow-xl group hover:scale-105 transition-transform"
            >
              <div
                class="bg-yellow-400 p-2 rounded-full shadow-inner group-hover:rotate-12 transition-transform"
              >
                <Icon
                  :name="rewardIcon ?? 'lucide:circle-dollar-sign'"
                  class="text-white text-3xl md:text-4xl"
                />
              </div>
              <span
                class="text-4xl md:text-5xl font-black text-yellow-700 tracking-tighter"
                >+{{ rewardAmount }}</span
              >
            </div>
          </slot>
        </div>

        <div
          v-if="footerText"
          class="mt-12 text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse"
        >
          {{ footerText }}
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.5s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.animate-pop-in {
  animation: pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.animate-slide-up {
  animation: slide-up 0.8s cubic-bezier(0.23, 1, 0.32, 1) both;
  animation-delay: 0.2s;
}

.animate-slide-up-delayed {
  animation: slide-up 0.8s cubic-bezier(0.23, 1, 0.32, 1) both;
  animation-delay: 0.4s;
}

.animate-spin-slow {
  animation: spin 12s linear infinite;
}

.animate-float-delayed {
  animation: float 5s ease-in-out infinite;
  animation-delay: 1s;
}

@keyframes pop-in {
  0% {
    transform: scale(0.8) translateY(40px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

@keyframes slide-up {
  0% {
    transform: translateY(30px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}
</style>

