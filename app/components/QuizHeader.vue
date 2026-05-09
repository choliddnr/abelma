<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";

/**
 * Standardized Quiz Header Component
 * Redesigned to match the specific UI layout from the provided image.
 */

const props = defineProps<{
  score?: number;
  streak?: number;
  timeLeft?: number;
  timerMax?: number;
  level?: string | number;
  levelDescription?: string;
  progressPercentage?: number;
  current?: number;
  total?: number;
  backPath?: string;
  // Custom label for progress if not using percentage
  progressLabel?: string;
}>();

const emit = defineEmits(["back", "stop"]);

const router = useRouter();

const handleBack = () => {
  if (props.backPath) {
    router.push(props.backPath);
  } else {
    emit("back");
    emit("stop");
  }
};

// Compute percentage if current/total provided
const displayProgress = computed(() => {
  if (props.progressPercentage !== undefined) return props.progressPercentage;
  if (
    props.current !== undefined &&
    props.total !== undefined &&
    props.total > 0
  ) {
    return (props.current / props.total) * 100;
  }
  return 0;
});

const displayProgressLabel = computed(() => {
  if (props.progressLabel) return props.progressLabel;
  if (props.current !== undefined && props.total !== undefined) {
    return `${props.current}/${props.total}`;
  }
  return `${Math.round(displayProgress.value)}%`;
});
</script>

<template>
  <div class="w-full max-w-5xl mx-auto px-4 pt-4 z-20">
    <!-- Main Pill Container -->
    <div
      class="bg-white/50 backdrop-blur-sm rounded-2xl md:rounded-[3rem] border-4 border-[#A5F3FC] p-2 flex flex-col gap-2 shadow-xl relative"
    >
      <!-- Top Row -->
      <div class="flex items-center justify-between px-2 md:px-6">
        <!-- Left Section: Back Button + Level Title -->
        <div class="flex items-center gap-4">
          <UiButton
            @click="handleBack"
            variant="danger"
            icon="lucide:x"
            class="size-10 md:size-12 rounded-2xl !p-0 flex items-center justify-center shadow-lg"
          />

          <div class="flex flex-col">
            <span
              class="text-[10px] md:text-xs font-black text-secondary uppercase tracking-widest leading-none"
              >LEVEL</span
            >
            <h2
              class="text-lg md:text-2xl font-bold text-slate-800 leading-tight"
            >
              {{
                levelDescription ||
                (current !== undefined ? `Latihan ${current}` : "Quiz")
              }}
            </h2>
          </div>
        </div>

        <!-- Right Section: Stats Capsules -->
        <div
          class="bg-[#A5F3FC]/40 rounded-[2rem] p-1 md:p-1.5 flex items-center gap-1 md:gap-3 overflow-x-auto no-scrollbar max-w-[50%] md:max-w-none justify-end"
        >
          <!-- Timer Capsule -->
          <div
            v-if="
              timerMax !== undefined && timeLeft !== undefined && timerMax > 0
            "
            class="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-1.5 rounded-full bg-[#FCE7F3] border-b-2 md:border-b-4 border-[#FBCFE8] transition-all shrink-0"
            :class="{
              'animate-pulse scale-105 border-[#FDA4AF] bg-[#FFE4E6]':
                timeLeft <= 5,
            }"
          >
            <Icon
              name="lucide:timer"
              class="text-rose-500 text-sm md:text-xl"
            />
            <span class="font-black text-rose-600 text-[10px] md:text-base"
              >{{ Math.ceil(timeLeft) }}s</span
            >
          </div>

          <!-- Streak Capsule -->
          <div
            v-if="streak !== undefined && streak >= 2"
            class="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-1.5 rounded-full bg-[#FFEDD5] border-b-2 md:border-b-4 border-[#FED7AA] animate-float shrink-0"
          >
            <Icon
              name="lucide:flame"
              class="text-orange-500 text-sm md:text-xl"
            />
            <span class="font-black text-orange-600 text-[10px] md:text-base">{{
              streak
            }}</span>
          </div>

          <!-- Level Capsule -->
          <div
            v-if="level"
            class="flex items-center gap-1 md:gap-2 px-2 md:px-5 py-1 md:py-1.5 rounded-full bg-[#E0F2FE] border-b-2 md:border-b-4 border-[#BAE6FD] shrink-0"
          >
            <span class="font-black text-sky-600 text-[10px] md:text-base"
              >Lvl {{ level }}</span
            >
          </div>

          <!-- Score Capsule -->
          <div
            v-if="score !== undefined"
            class="flex items-center gap-1 md:gap-2 px-2 md:px-5 py-1 md:py-1.5 rounded-full bg-[#F3E8FF] border-b-2 md:border-b-4 border-[#E9D5FF] shrink-0"
          >
            <Icon
              name="lucide:trophy"
              class="text-indigo-500 text-sm md:text-xl"
            />
            <span class="font-black text-indigo-600 text-[10px] md:text-base">{{
              score
            }}</span>
          </div>
        </div>
      </div>

      <!-- Bottom Row: Linear Progress Bar -->
      <div class="px-4 md:px-10 pb-1">
        <div
          class="relative h-6 bg-slate-200/50 backdrop-blur-sm rounded-full border-2 border-white shadow-inner p-1 overflow-hidden"
        >
          <!-- Animated Progress Fill -->
          <div
            class="h-full bg-linear-to-r from-[#2DD4BF] to-[#0D9488] rounded-full transition-all duration-1000 ease-out shadow-lg relative overflow-hidden"
            :style="{ width: `${displayProgress}%` }"
          >
            <!-- Shine effect -->
            <div
              class="absolute inset-0 bg-linear-to-b from-white/30 to-transparent"
            ></div>
            <div
              class="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-white/20 to-transparent"
            ></div>
          </div>

          <!-- Segment markers -->
          <div
            class="absolute inset-0 flex items-center pointer-events-none px-4"
          >
            <div
              v-for="i in total && total > 1 ? total - 1 : 12"
              :key="i"
              class="flex-1 flex justify-center"
            >
              <div class="w-1 h-2 bg-white/40 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
.animate-shimmer {
  animation: shimmer 2s infinite linear;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* Hide scrollbar for stats area on mobile */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
