<script setup lang="ts">
import { useNotification } from "~/composables/useNotification";

const store = useNotification();
const { notifications } = storeToRefs(store);

const getIcon = (type: string) => {
  switch (type) {
    case "success":
      return "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z";
    case "error":
      return "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z";
    case "warning":
      return "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z";
    default:
      return "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
  }
};

const getTypeClasses = (type: string) => {
  switch (type) {
    case "success":
      return "bg-emerald-500/90 text-white border-emerald-400/50";
    case "error":
      return "bg-rose-500/90 text-white border-rose-400/50";
    case "warning":
      return "bg-amber-500/90 text-white border-amber-400/50";
    default:
      return "bg-sky-500/90 text-white border-sky-400/50";
  }
};
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-sm"
    >
      <TransitionGroup name="notification" tag="div" class="contents">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="pointer-events-auto flex items-start gap-4 p-4 rounded-2xl border backdrop-blur-md shadow-xl transition-all duration-300 transform"
          :class="getTypeClasses(notification.type)"
        >
          <!-- Icon -->
          <div class="flex-shrink-0 mt-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                :d="getIcon(notification.type)"
              />
            </svg>
          </div>

          <!-- Content -->
          <div class="flex-grow pt-0.5">
            <p class="text-sm font-medium leading-tight">
              {{ notification.message }}
            </p>
          </div>

          <!-- Close Button -->
          <button
            @click="store.remove(notification.id)"
            class="flex-shrink-0 text-white/70 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}

.notification-move {
  transition: transform 0.4s ease;
}
</style>
