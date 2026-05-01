<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean;
  title: string;
  subtitle?: string;
  icon?: string;
  iconClass?: string;
  maxWidth?: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

// Prevent scrolling when modal is open
watch(
  () => props.isOpen,
  (val) => {
    if (process.client) {
      document.body.style.overflow = val ? "hidden" : "";
    }
  },
);

onUnmounted(() => {
  if (process.client) {
    document.body.style.overflow = "";
  }
});
</script>

<template>
  <Transition name="modal">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        @click="emit('close')"
      ></div>

      <!-- Modal Container -->
      <div
        :class="[
          'relative w-full bg-slate-50 rounded-[3rem] shadow-2xl border-4 border-white overflow-hidden flex flex-col max-h-[90vh] animate-bounce-in',
          maxWidth || 'max-w-4xl'
        ]"
      >
        <!-- Modal Header -->
        <div
          class="p-6 md:p-8 bg-white border-b border-slate-100 flex items-center justify-between shrink-0"
        >
          <div class="flex items-center gap-4">
            <div
              v-if="icon"
              :class="[
                'w-12 h-12 rounded-2xl text-white flex items-center justify-center text-2xl shadow-lg',
                iconClass || 'bg-indigo-500 shadow-indigo-100'
              ]"
            >
              {{ icon }}
            </div>
            <div>
              <h3 class="text-2xl font-black text-slate-800 font-quicksand">
                {{ title }}
              </h3>
              <p v-if="subtitle" class="text-sm font-bold text-slate-400">
                {{ subtitle }}
              </p>
            </div>
          </div>

          <button
            @click="emit('close')"
            class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <slot />
        </div>

        <!-- Modal Footer -->
        <div
          v-if="$slots.footer"
          class="p-6 bg-white border-t border-slate-100 flex items-center justify-between shrink-0"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.font-quicksand {
  font-family: "Quicksand", sans-serif;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@keyframes bounce-in {
  0% {
    transform: scale(0.9) translateY(10px);
    opacity: 0;
  }
  50% {
    transform: scale(1.05) translateY(-5px);
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.animate-bounce-in {
  animation: bounce-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
