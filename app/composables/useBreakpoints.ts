import { ref, onMounted, onUnmounted } from "vue";

export const useBreakpoints = () => {
  const isMobile = ref(false);
  const isTablet = ref(false);
  const isDesktop = ref(false);

  const update = () => {
    if (typeof window !== "undefined") {
      isMobile.value = window.innerWidth < 768;
      isTablet.value = window.innerWidth >= 768 && window.innerWidth < 1024;
      isDesktop.value = window.innerWidth >= 1024;
    }
  };

  onMounted(() => {
    update();
    window.addEventListener("resize", update);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", update);
  });

  return {
    isMobile,
    isTablet,
    isDesktop,
  };
};
