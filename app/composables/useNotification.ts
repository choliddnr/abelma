export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
  timestamp: number;
}

export const useNotification = defineStore("notification", () => {
  const notifications = ref<Notification[]>([]);

  const add = (message: string, type: NotificationType = "info", duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const notification: Notification = {
      id,
      message,
      type,
      duration,
      timestamp: Date.now(),
    };

    notifications.value.push(notification);

    if (duration > 0) {
      setTimeout(() => {
        remove(id);
      }, duration);
    }

    return id;
  };

  const remove = (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  };

  const success = (message: string, duration?: number) => add(message, "success", duration);
  const error = (message: string, duration?: number) => add(message, "error", duration);
  const warn = (message: string, duration?: number) => add(message, "warning", duration);
  const info = (message: string, duration?: number) => add(message, "info", duration);

  return {
    notifications,
    add,
    remove,
    success,
    error,
    warn,
    info,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useNotification, import.meta.hot));
}
