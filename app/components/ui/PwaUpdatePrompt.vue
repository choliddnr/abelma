<script setup lang="ts">
const { $pwa } = useNuxtApp();

const visible = computed(() => $pwa?.needRefresh);

function update() {
  $pwa?.updateServiceWorker();
}

function dismiss() {
  $pwa?.cancelPrompt();
}
</script>

<template>
  <Transition name="pwa-toast">
    <div
      v-if="visible"
      class="pwa-update-prompt"
    >
      <div class="pwa-update-inner">
        <div class="pwa-update-icon">🎉</div>
        <div class="pwa-update-text">
          <p class="pwa-update-title">Ada pembaruan baru!</p>
          <p class="pwa-update-subtitle">Ayo perbarui untuk pengalaman terbaik</p>
        </div>
        <div class="pwa-update-actions">
          <button class="pwa-btn pwa-btn-primary" @click="update">
            <Icon name="lucide:refresh-cw" size="16" />
            Perbarui
          </button>
          <button class="pwa-btn pwa-btn-secondary" @click="dismiss">
            Nanti
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.pwa-update-prompt {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  width: calc(100% - 2rem);
  max-width: 28rem;
}

.pwa-update-inner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #fffbe6 0%, #fff3cd 100%);
  border: 2px solid #ffd93d;
  border-radius: 1.25rem;
  box-shadow:
    0 8px 32px rgba(255, 183, 0, 0.2),
    0 2px 8px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8px);
}

.pwa-update-icon {
  font-size: 2rem;
  flex-shrink: 0;
  animation: bounce-icon 1.5s ease-in-out infinite;
}

@keyframes bounce-icon {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.pwa-update-text {
  flex: 1;
  min-width: 0;
}

.pwa-update-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #634e00;
  margin: 0;
  font-family: 'Quicksand', sans-serif;
}

.pwa-update-subtitle {
  font-size: 0.75rem;
  color: #8b7700;
  margin: 0.125rem 0 0;
  font-family: 'Quicksand', sans-serif;
}

.pwa-update-actions {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  flex-shrink: 0;
}

.pwa-btn {
  border: none;
  border-radius: 0.75rem;
  padding: 0.4rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 700;
  font-family: 'Quicksand', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  white-space: nowrap;
}

.pwa-btn-primary {
  background: linear-gradient(135deg, #ffd93d, #ffb800);
  color: #634e00;
  box-shadow: 0 2px 8px rgba(255, 183, 0, 0.3);
}

.pwa-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 183, 0, 0.4);
}

.pwa-btn-primary:active {
  transform: translateY(0);
}

.pwa-btn-secondary {
  background: transparent;
  color: #8b7700;
  padding: 0.25rem 0.85rem;
}

.pwa-btn-secondary:hover {
  background: rgba(255, 217, 61, 0.2);
}

/* Transition */
.pwa-toast-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pwa-toast-leave-active {
  transition: all 0.25s ease-in;
}

.pwa-toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(2rem) scale(0.9);
}

.pwa-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(1rem) scale(0.95);
}
</style>
