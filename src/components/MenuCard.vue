<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
  icon: string
  colorClass: string
  to: string
}>()
</script>

<template>
  <RouterLink
    :to="to"
    class="glass-card p-8 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:translate-y-[-10px] cursor-pointer group"
  >
    <div
      class="w-24 h-24 rounded-full flex items-center justify-center text-5xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12"
      :class="colorClass"
    >
      {{ icon }}
    </div>
    <div class="text-center">
      <h2 class="text-3xl font-bold text-gray-800">{{ title }}</h2>
      <p class="text-gray-500 font-medium">{{ subtitle }}</p>
    </div>
  </RouterLink>
</template>
