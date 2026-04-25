<script setup lang="ts">
import { useNotification } from "~/composables/useNotification";

const store = useNotification();
const { notifications } = storeToRefs(store);

const getIcon = (type: string) => {
  switch (type) {
    case "success":
      return "lucide:check-circle";
    case "error":
      return "lucide:alert-circle";
    case "warning":
      return "lucide:alert-triangle";
    default:
      return "lucide:info";
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
            <Icon :name="getIcon(notification.type)" class="h-6 w-6" />
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
            <Icon name="lucide:x" class="h-5 w-5" />
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
