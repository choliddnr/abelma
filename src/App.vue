<script setup lang="ts">
import { RouterView } from 'vue-router'
import { watch } from 'vue'
import { authClient } from '@/lib/auth-client'
import { useSyncStore } from '@/stores'
import BubbleCard from '@/components/BubbleCard.vue'
import GlobalHeader from '@/components/GlobalHeader.vue'

const session = authClient.useSession()
const syncStore = useSyncStore()

watch(() => session.value.data, (newData) => {
  if (newData) {
    syncStore.loadFromCloud()
  }
}, { immediate: true })
</script>

<template>
  <div class="h-screen w-full relative overflow-hidden bg-[#FFF9E3] flex flex-col">
    <!-- Background Image -->
    <div class="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat" style="background-image: url('/bg1.webp');"></div>

    <!-- Decorative bubbles/shapes (Lowered opacity to blend with background) -->
    <div class="absolute -top-20 -left-20 w-64 h-64 bg-[#FFE5A3] rounded-full blur-3xl opacity-40"></div>
    <div class="absolute top-1/2 -right-20 w-80 h-80 bg-[#D4F1D7] rounded-full blur-3xl opacity-40"></div>

    <GlobalHeader v-if="!session.isPending" />
    
    <div v-if="session.isPending" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FFF9E3]/80 backdrop-blur-sm">
      <BubbleCard class="w-24 h-24 sm:w-32 sm:h-32 bg-primary rounded-3xl animate-bounce shadow-xl">
        <span class="text-5xl sm:text-6xl font-black text-white drop-shadow-md">A</span>
      </BubbleCard>
      <p class="mt-6 text-2xl font-black text-[#8B7700] animate-pulse">Memuat...</p>
    </div>

    <main class="relative z-10 p-4 md:px-8 md:py-4 max-w-7xl mx-auto flex-1 w-full overflow-y-auto overflow-x-hidden custom-scrollbar">
      <RouterView v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
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
</style>
