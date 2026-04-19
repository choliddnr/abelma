interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: string;
  variant?: "danger" | "primary" | "accent" | "success";
}

const isOpen = ref(false);
const options = ref<ConfirmOptions>({
  title: "Konfirmasi",
  message: "Apakah Anda yakin?",
  confirmText: "Ya",
  cancelText: "Batal",
  icon: "❓",
  variant: "primary",
});

let resolvePromise: (value: boolean) => void;

export const useConfirm = () => {
  const confirm = (opts: ConfirmOptions = {}) => {
    options.value = {
      title: opts.title || "Konfirmasi",
      message: opts.message || "Apakah Anda yakin?",
      confirmText: opts.confirmText || "Ya",
      cancelText: opts.cancelText || "Batal",
      icon: opts.icon || "❓",
      variant: opts.variant || "primary",
    };
    isOpen.value = true;

    return new Promise<boolean>((resolve) => {
      resolvePromise = resolve;
    });
  };

  const onConfirm = () => {
    isOpen.value = false;
    resolvePromise(true);
  };

  const onCancel = () => {
    isOpen.value = false;
    resolvePromise(false);
  };

  return {
    isOpen,
    options,
    confirm,
    onConfirm,
    onCancel,
  };
};
