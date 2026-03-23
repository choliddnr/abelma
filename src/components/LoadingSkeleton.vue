<script setup lang="ts">
const { width, height, barHeight } = defineProps({
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '50px'
  },
  barHeight: {
    type: String,
    default: '20px'
  }
})
</script>

<template>
  <div class="loading-skeleton" :style="{ width: width, height: height }">
    <div class="skeleton-bar" :style="{ height: barHeight }"></div>
  </div>
</template>



<style scoped>
.loading-skeleton {
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.skeleton-bar {
  background: linear-gradient(90deg,
      #f0f0f0 0%,
      #e0e0e0 50%,
      #f0f0f0 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}
</style>
