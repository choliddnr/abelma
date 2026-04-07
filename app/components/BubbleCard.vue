<script setup lang="ts">
withDefaults(defineProps<{
  as?: string
}>(), {
  as: 'div'
})
</script>

<template>
  <component :is="as" class="relative glass-card overflow-hidden">
    <!-- Glossy Top Highlight -->
    <div class="absolute top-0 inset-x-0 h-1/3 bg-linear-to-b from-white/60 to-transparent opacity-80 rounded-t-[inherit] pointer-events-none z-0"></div>
    
    <div class="relative z-10 w-full h-full flex items-center justify-center">
      <slot></slot>
    </div>
    
    <!-- Bottom Depth Shadow -->
    <div class="absolute bottom-0 inset-x-0 h-1/5 bg-linear-to-t from-black/20 to-transparent pointer-events-none rounded-b-[inherit] z-0"></div>
    
    <!-- Internal Border -->
    <div class="absolute inset-0 border-[3px] sm:border-[5px] border-white/30 rounded-[inherit] pointer-events-none z-0"></div>
  </component>
</template>

