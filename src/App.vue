<script setup lang="ts">
import { RouterView } from 'vue-router'
import { authClient } from '@/lib/auth-client'

const session = authClient.useSession()

const logout = async () => {
  await authClient.signOut()
}
</script>

<template>
  <div class="h-dvh w-full relative overflow-auto bg-[#FFF9E3]">
    <!-- Background Image -->
    <div class="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat" style="background-image: url('/bg1.webp');"></div>

    <!-- Decorative bubbles/shapes (Lowered opacity to blend with background) -->
    <div class="absolute -top-20 -left-20 w-64 h-64 bg-[#FFE5A3] rounded-full blur-3xl opacity-40"></div>
    <div class="absolute top-1/2 -right-20 w-80 h-80 bg-[#D4F1D7] rounded-full blur-3xl opacity-40"></div>

    <header class="relative z-20 p-4 flex justify-end items-center gap-4">
      <div v-if="session.isPending" class="text-[#8B7700] font-bold">Loading...</div>
      <div v-else-if="session.data" class="flex items-center gap-3">
        <div class="text-right">
          <p class="text-sm font-bold text-[#8B7700]">Halo, {{ session.data.user.name }}!</p>
          <button @click="logout" class="text-xs font-bold text-red-500 hover:text-red-600 transition-colors">
            Keluar
          </button>
        </div>
        <img :src="session.data.user.image || ''" :alt="session.data.user.name"
          class="w-10 h-10 rounded-full border-2 border-primary" />
      </div>
      <router-link v-else to="/login"
        class="bg-[#FFBD39] hover:bg-primary text-[#634E00] font-black py-2 px-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all text-sm">
        Masuk
      </router-link>
    </header>

    <main class="relative z-10 p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-80px)] flex flex-col">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>
  </div>
</template>
