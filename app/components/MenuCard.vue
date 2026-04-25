<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
  icon: string;
  colorClass: string;
  to: string;
}>();
</script>

<template>
  <NuxtLink
    :to="to"
    class="glass-card p-4 md:p-6 flex flex-col items-center justify-center gap-0 md:gap-4 transition-all duration-300 hover:translate-y-[-10px] cursor-pointer group"
  >
    <div
      class="size-18 md:size-22 rounded-full flex items-center justify-center text-5xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12"
      :class="colorClass"
    >
      <Icon :name="icon" />
    </div>
    <div class="text-center">
      <h2 class="text-lg md:text-xl xl:text-2xl font-bold text-gray-800">{{ title }}</h2>
      <p class="text-sm md:text-lg xl:text-gray-500 font-medium">{{ subtitle }}</p>
    </div>
  </NuxtLink>
</template>
