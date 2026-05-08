<script setup lang="ts">
const props = defineProps<{
  text: string;
  result: string;
  emoji: string;
  type: "blend" | "word";
  show: boolean;
}>();

// For blends like "BAH", the whole thing is the result.
// For words like "MAKAN", we highlight the CVC part.
const splitResult = computed(() => {
  if (props.type === "blend") {
    // Return the CVC part as a highlighted chunk
    return { prefix: "", highlight: props.result };
  } else {
    // For "MAKAN", we want prefix "MA" and highlight "KAN"
    // We assume the result is split into part1 and part2 from the logic.
    // However, let's just use the props passed from parent for precision.
    // For simplicity here, let's assume the parent handles the splitting if needed,
    // or we just highlight the last 3 letters for CVC blends in words.
    if (props.result.length > 3) {
      return {
        prefix: props.result.slice(0, props.result.length - 3),
        highlight: props.result.slice(-3),
      };
    }
    return { prefix: "", highlight: props.result };
  }
});
</script>

<template>
  <Transition name="result-fade">
    <div v-if="show" class="flex flex-col items-center gap-6 py-4">
      <!-- Big Emoji -->
      <div
        class="size-32 md:size-44 bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-4 border-white flex items-center justify-center text-7xl md:text-9xl animate-pop-in"
      >
        <span class="drop-shadow-xl">{{ emoji }}</span>
      </div>

      <!-- Word Display -->
      <div class="text-center animate-slide-up">
        <div
          class="inline-flex items-center gap-1 px-10 py-4 bg-white/80 backdrop-blur-md rounded-[2.5rem] border-2 border-white shadow-xl"
        >
          <span
            v-if="splitResult.prefix"
            class="text-5xl md:text-8xl font-black text-slate-700 tracking-tighter"
          >
            {{ splitResult.prefix }}
          </span>
          <span
            class="text-5xl md:text-8xl font-black text-indigo-600 tracking-tighter"
          >
            {{ splitResult.highlight }}
          </span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.result-fade-enter-active {
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.result-fade-enter-from {
  opacity: 0;
  transform: scale(0.5) translateY(50px);
}

.animate-pop-in {
  animation: pop-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.animate-slide-up {
  animation: slide-up 1s cubic-bezier(0.23, 1, 0.32, 1) both;
  animation-delay: 0.2s;
}

@keyframes pop-in {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
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
</style>
