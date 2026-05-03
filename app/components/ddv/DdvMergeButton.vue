<script setup lang="ts">
defineProps<{
  disabled?: boolean;
  isAnimating?: boolean;
}>();

defineEmits(["merge"]);
</script>

<template>
  <button
    @click="$emit('merge')"
    :disabled="disabled || isAnimating"
    class="group relative flex items-center gap-4 px-10 py-6 bg-linear-to-br from-[#14B8A6] to-[#0D9488] rounded-full shadow-[0_15px_30px_-5px_rgba(20,184,166,0.5)] border-b-8 border-[#0F766E] transition-all duration-300 active:border-b-0 active:translate-y-2 hover:scale-105 disabled:opacity-50 disabled:pointer-events-none"
  >
    <!-- Background Glow -->
    <div
      class="absolute inset-0 bg-[#14B8A6]/20 blur-2xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity"
    ></div>

    <div class="relative z-10 flex items-center gap-4">
      <div
        class="size-12 bg-white rounded-full flex items-center justify-center text-[#14B8A6] shadow-inner transition-transform group-hover:rotate-12"
      >
        <Icon name="lucide:merge" class="size-8" />
      </div>
      <span class="text-3xl font-black text-white uppercase tracking-wider drop-shadow-md">
        Gabungkan!
      </span>
    </div>

    <!-- Shine Animation -->
    <div
      class="absolute top-0 -left-[100%] w-1/2 h-full bg-linear-to-r from-transparent via-white/20 to-transparent skew-x-[25deg] group-hover:left-[150%] transition-all duration-700 pointer-events-none"
    ></div>
  </button>
</template>

<style scoped>
.font-black {
  font-weight: 900;
}
</style>
