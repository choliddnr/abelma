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
  <footer class="sticky bottom-0 left-0 w-full h-24 z-50 content-end">
    <div
      v-if="!$route.fullPath.includes('parent')"
      class="flex items-center justify-center mb-1"
      :class="gap ? gap : 'gap-6 md:gap-14 lg:gap-20 '"
    >
      <UiButton
        @click="backTo ? router.push(backTo) : router.back()"
        variant="accent"
        icon="fluent-emoji-flat:back-arrow"
        icon-class="text-3xl"
        :size="size"
        class="grow"
      />
      <UiButton
        @click="router.push('/')"
        variant="primary"
        icon="fluent-emoji-flat:house"
        iconClass="text-3xl"
        :size="size"
        class="grow"
      />
    </div>
  </footer>
</template>

<style></style>
