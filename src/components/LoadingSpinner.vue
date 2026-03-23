<script setup lang="ts">
const { message } = defineProps({
  message: {
    type: String,
    default: 'Loading...'
  }
})
</script>

<template>
  <div class="loading-spinner-container" role="status" aria-live="polite">
    <div class="loading-spinner" aria-label="Loading..."></div>
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>



<style scoped>
.loading-spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top-color: #42b883;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.loading-message {
  margin-top: 1rem;
  color: #666;
}
</style>
