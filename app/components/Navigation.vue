<script lang="ts" setup>
const props = defineProps<{
  size?: "sm" | "md" | "lg" | "xl";
  gap?: string;
  backTo?: string;
}>();

// const { isMobile } = useBreakpoints();
const router = useRouter();

// const computedSize = computed(() => props.size || (isMobile.value ? "md" : "xl"));
</script>
<template>
  <div
    class="flex items-center justify-between"
    :class="gap ? gap : 'gap-6 md:gap-14 lg:gap-20 '"
  >
    <UiButton
      @click="backTo ? router.push(backTo) : router.back()"
      variant="white"
      icon="fluent-emoji-flat:back-arrow"
      icon-class="text-3xl"
      :size="size"
    />
    <UiButton
      @click="router.push('/')"
      variant="white"
      icon="fluent-emoji-flat:house"
      iconClass="text-3xl"
      :size="size"
    />
  </div>
</template>

<style></style>
