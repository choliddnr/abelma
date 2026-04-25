<script setup lang="ts">
defineProps<{
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
</script>

<template>
  <transition name="pop-up">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
      @click="close"
    >
      <div
        class="bg-white rounded-5xl p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-8 border-yellow-400 max-w-sm w-full text-center relative animate-pop overflow-hidden"
        @click.stop
      >
        <div class="absolute inset-0 bg-linear-to-b from-yellow-50 to-white -z-10"></div>
        <div class="text-7xl md:text-8xl mb-4 animate-bounce">
          <template v-if="mainEmoji">{{ mainEmoji }}</template>
          <template v-else>
            <Icon :name="rewardAmount ? 'lucide:circle-dollar-sign' : 'lucide:party-popper'" />
          </template>
        </div>

        <h2
          v-if="title"
          class="text-3xl md:text-4xl font-black text-yellow-600 mb-2 uppercase tracking-tight"
        >
          {{ title }}
        </h2>

        <p v-if="message" class="text-xl md:text-2xl font-bold text-slate-600 mb-6">
          {{ message }}
        </p>

        <slot>
          <div
            v-if="rewardAmount"
            class="inline-flex items-center justify-center gap-3 bg-yellow-100 px-8 py-4 rounded-[1.5rem] border-4 border-yellow-200 shadow-inner"
          >
            <Icon :name="rewardIcon ?? 'lucide:circle-dollar-sign'" class="text-4xl md:text-5xl" />
            <span class="text-4xl md:text-5xl font-black text-yellow-700">+{{ rewardAmount }}</span>
          </div>
        </slot>

        <div
          v-if="footerText"
          class="mt-8 text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse"
        >
          {{ footerText }}
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.pop-up-enter-active {
  animation: pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pop-up-leave-active {
  animation: pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) reverse;
}

@keyframes pop-in {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
