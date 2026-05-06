<script setup lang="ts">
const { session, isLoaded } = storeToRefs(useUserStore());
const { fetchSession } = useUserStore();
const { fetchProfiles } = useProfileStore();

isLoaded.value = false;

// Since SSR is false, we can use top-level await in script setup
await fetchSession();

if (session.value) {
  await fetchProfiles();
}

onMounted(() => {
  isLoaded.value = true;
});
</script>

<template>
  <div class="h-screen w-full relative overflow-hidden bg-[#FFF9E3] flex flex-col">
    <VitePwaManifest />
    <!-- Background Image -->
    <div class="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
      style="background-image: url(&quot;/bg_underwater.webp&quot;)"></div>

    <!-- Animated Bubbles -->
    <div class="fixed inset-0 pointer-events-none z-10">
      <div v-for="n in 20" :key="n" 
        class="bubble absolute bg-white/30 rounded-full blur-[1px] shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.4)]"
        :style="{
          left: `${Math.random() * 100}%`,
          width: `${Math.random() * 30 + 10}px`,
          height: `${Math.random() * 30 + 10}px`,
          animationDuration: `${Math.random() * 8 + 6}s`,
          animationDelay: `${Math.random() * 5}s`
        }"
      ></div>
    </div>

    <!-- Decorative bubbles/shapes -->
    <!-- <div class="absolute -top-20 -left-20 w-64 h-64 bg-[#FFE5A3] rounded-full blur-3xl opacity-40"></div>
    <div class="absolute top-1/2 -right-20 w-80 h-80 bg-[#D4F1D7] rounded-full blur-3xl opacity-40"></div> -->

    <div v-if="!isLoaded"
      class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FFF9E3]/80 backdrop-blur-sm">
      <BubbleCard class="w-24 h-24 sm:w-32 sm:h-32 bg-primary rounded-3xl animate-bounce shadow-xl">
        <span class="text-5xl sm:text-6xl font-black text-white drop-shadow-md">Ab</span>
      </BubbleCard>
      <p class="mt-6 text-2xl font-black text-[#8B7700] animate-pulse">Memuat...</p>
    </div>

    <main class="relative z-20 flex-1 w-full overflow-y-auto overflow-x-hidden custom-scrollbar">

      <GlobalHeader />
      <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
      <UiConfirmModal />
      <UiNotificationToast />
      <UiPwaUpdatePrompt />
      <UiFloatingMentor />
    </main>
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease-out;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.bubble {
  bottom: -50px;
  animation: rise linear infinite;
}

@keyframes rise {
  0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0; }
  10% { opacity: 0.6; }
  90% { opacity: 0.6; }
  100% { transform: translateY(-120vh) scale(1.5) rotate(360deg); opacity: 0; }
}
</style>
