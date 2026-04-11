<template>
  <div class="error-boundary" role="alert">
    <div class="error-icon">⚠️</div>
    <h2>Something went wrong</h2>
    <p v-if="message">{{ message }}</p>
    <button class="retry-button" @click="retry">Try Again</button>
  </div>
</template>

<script setup lang="ts">
defineProps({
  message: {
    type: String,
    default: "An unexpected error occurred",
  },
  hasRetry: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["retry"]);

const retry = () => {
  emit("retry");
  window.location.reload();
};
</script>

<style scoped>
.error-boundary {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 2rem;
  text-align: center;
  background: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 8px;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

h2 {
  color: #856404;
  margin-bottom: 0.5rem;
}

p {
  color: #856404;
  margin-bottom: 1.5rem;
}

.retry-button {
  padding: 0.5rem 1.5rem;
  background: #ffc107;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-button:hover {
  background: #e0a800;
}
</style>
