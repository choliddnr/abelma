<script setup lang="ts">
const { isOpen, options, onConfirm, onCancel } = useConfirm();

// Prevent scrolling when modal is open
watch(isOpen, (val) => {
  if (process.client) {
    document.body.style.overflow = val ? "hidden" : "";
  }
});
</script>

<template>
  <Transition name="modal">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="onCancel"></div>

      <!-- Modal Card -->
      <div
        class="relative w-full max-w-sm bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border-4 border-white overflow-hidden animate-bounce-in"
      >
        <!-- Background decorative blob -->
        <div
          class="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-2xl opacity-60"
        ></div>
        <div
          class="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-50 rounded-full blur-2xl opacity-60"
        ></div>

        <div class="relative z-10 flex flex-col items-center text-center">
          <div
            class="w-20 h-20 mb-6 flex items-center justify-center text-5xl bg-white rounded-3xl shadow-lg transform rotate-3"
            :class="{
              'shadow-rose-100': options.variant === 'danger',
              'shadow-indigo-100': options.variant === 'primary' || options.variant === 'accent',
              'shadow-emerald-100': options.variant === 'success',
            }"
          >
            <Icon v-if="options.icon" :name="options.icon" />
          </div>

          <h3 class="text-2xl font-black text-slate-800 mb-2 font-quicksand leading-tight">
            {{ options.title }}
          </h3>
          <p class="text-slate-500 font-bold mb-8 leading-relaxed">
            {{ options.message }}
          </p>

          <div class="flex gap-4 w-full">
            <UiButton variant="white" class="flex-1" @click="onCancel">
              {{ options.cancelText }}
            </UiButton>
            <UiButton :variant="options.variant || 'accent'" class="flex-1" @click="onConfirm">
              {{ options.confirmText }}
            </UiButton>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.font-quicksand {
  font-family: "Quicksand", sans-serif;
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
