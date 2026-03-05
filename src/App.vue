<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen w-full relative overflow-hidden bg-[#FFF9E3]">
    <!-- Background Image -->
    <div
      class="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
      style="background-image: url('/bg1.webp');"
    ></div>

    <!-- Decorative bubbles/shapes (Lowered opacity to blend with background) -->
    <div class="absolute -top-20 -left-20 w-64 h-64 bg-[#FFE5A3] rounded-full blur-3xl opacity-40"></div>
    <div class="absolute top-1/2 -right-20 w-80 h-80 bg-[#D4F1D7] rounded-full blur-3xl opacity-40"></div>

    <main class="relative z-10 p-4 md:p-8 max-w-7xl mx-auto min-h-screen flex flex-col">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>
  </div>
</template>
