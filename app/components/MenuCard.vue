<script lang="ts" setup>
defineOptions({
  inheritAttrs: false,
});
const { to, isUnlocked, isPremiumLocked, data } = defineProps<{
  to?: string;
  isUnlocked?: boolean;
  isPremiumLocked?: boolean;
  data: { emoji?: string; name?: string; description?: string };
}>();
</script>
<template>
  <NuxtLink
    :to="to"
    class="block h-full"
    :class="{ 'pointer-events-none': !isUnlocked && !isPremiumLocked }"
  >
    <div
      class="h-full glass-card p-8 flex flex-col items-center gap-4 transition-all duration-300 overflow-hidden"
      :class="[
        $attrs.class,
        isUnlocked
          ? 'hover:-translate-y-4 hover:shadow-2xl cursor-pointer border-indigo-200'
          : 'opacity-70 grayscale',
      ]"
    >
      <!-- Menu Icon -->
      <div
        class="size-24 rounded-full bg-linear-to-br from-indigo-50 to-white shadow-inner flex items-center justify-center text-6xl group-hover:scale-110 transition-transform"
      >
        {{ data.emoji }}
      </div>

      <!-- Menu Info -->
      <div class="text-center">
        <h3 class="text-2xl font-black text-slate-800">{{ data.name }}</h3>
        <p class="text-slate-500 font-bold mt-1 leading-tight">
          {{ data.description }}
        </p>
      </div>

      <!-- custom footer -->

      <slot name="footer" />

      <div
        v-if="isPremiumLocked"
        class="absolute inset-0 bg-slate-900/30 flex flex-col items-center justify-center gap-2 backdrop-blur-[4px] rounded-[inherit] hover:bg-slate-900/40 transition-colors"
      >
        <div
          class="size-14 bg-linear-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white/20"
        >
          <Icon name="lucide:lock-keyhole" class="size-7" />
        </div>
        <span
          class="text-sm font-black text-white uppercase tracking-widest drop-shadow-md"
          >Premium</span
        >
      </div>

      <!-- Locked Overlay -->
      <div
        v-else-if="!isUnlocked"
        class="absolute inset-0 bg-slate-900/10 flex flex-col items-center justify-center gap-2 backdrop-blur-[2px] rounded-[inherit]"
      >
        <div
          class="size-12 bg-slate-800/80 rounded-full flex items-center justify-center text-white shadow-lg"
        >
          <Icon name="lucide:lock" class="size-6" />
        </div>
        <span
          class="text-xs font-black text-slate-700 uppercase tracking-tighter"
          >Terkunci</span
        >
      </div>
    </div>
  </NuxtLink>
  <!-- <div>
    <slot />
  </div> -->
</template>

<style></style>
