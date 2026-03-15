<script setup lang="ts">
import { useRouter } from 'vue-router'
import MenuCard from '@/components/MenuCard.vue'
import ProfileSelector from '@/components/ProfileSelector.vue'
import { getCurrentPoints } from '@/utils/rewardStore'
import { computed } from 'vue'

const router = useRouter()
const points = computed(() => getCurrentPoints())
const goBack = () => router.push('/')

const menuItems = [
  {
    title: 'Belajar Dulu',
    subtitle: 'Mengeja Suku Kata',
    icon: '📖',
    colorClass: 'bg-[#FFD93D] text-[#634E00]',
    to: '/words/learn'
  },
  {
    title: 'Mulai Main',
    subtitle: 'Tantangan Tebak Kata',
    icon: '🏆',
    colorClass: 'bg-[#6BCB77] text-white',
    to: '/words/quiz'
  }
]
</script>

<template>
  <div class="flex flex-col min-h-screen relative p-4 md:p-8">
    
    <!-- Pattern Background -->
    <div class="absolute inset-x-0 top-0 h-96 bg-indigo-50/50 rounded-b-[4rem] md:rounded-b-[8rem] pointer-events-none overflow-hidden">
        <div class="absolute -top-24 -left-24 w-64 h-64 bg-indigo-200/40 rounded-full blur-3xl"></div>
        <div class="absolute top-12 -right-12 w-48 h-48 bg-emerald-200/40 rounded-full blur-3xl"></div>
    </div>

    <!-- Header (Animated) -->
    <div class="flex items-center shrink-0 z-10 w-full max-w-5xl mx-auto mb-12 animate-entrance">
      <button @click="goBack"
        class="ui-capsule-interactive bg-white border-slate-200 text-slate-700 w-auto shadow-sm">
        <span class="text-xl md:text-2xl">🔙</span>
        <span class="font-black text-sm md:text-base hidden sm:inline">Kembali</span>
      </button>

      <div class="flex-1"></div>

      <div class="flex gap-2 md:gap-4">
        <router-link to="/words/rewards" class="ui-capsule-interactive bg-amber-400 border-amber-500 text-white w-auto px-4 shadow-lg animate-float font-quicksand">
           🪙 {{ points }} <span class="hidden sm:inline ml-1">Koin</span>
        </router-link>
        <router-link to="/words/stickers" class="ui-capsule-interactive bg-white border-slate-200 text-slate-700 w-auto shadow-sm">
          <span class="text-xl md:text-2xl">🖼️</span>
          <span class="font-black text-sm md:text-base hidden sm:inline">Koleksi</span>
        </router-link>

        <button @click="router.push('/words/settings')"
            class="ui-capsule-interactive bg-white border-slate-200 text-slate-700 w-auto shadow-sm">
            <span class="text-xl md:text-2xl">⚙️</span>
            <span class="font-black text-sm md:text-base hidden sm:inline">Pengaturan</span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full gap-8 z-10 -mt-8">
      
      <!-- Profile Management -->
      <div class="w-full max-w-md animate-entrance" style="animation-delay: 0.1s;">
        <ProfileSelector />
      </div>

      <div class="text-center space-y-4 animate-entrance" style="animation-delay: 0.2s;">
        <h1 class="text-5xl md:text-7xl font-black text-indigo-600 drop-shadow-sm" style="font-family: 'Quicksand', sans-serif;">
          Belajar Kata
        </h1>
        <p class="text-xl md:text-2xl font-bold text-slate-500" style="font-family: 'Quicksand', sans-serif;">
          Pilih mode bermainmu!
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-3xl">
        <MenuCard
          v-for="(item, index) in menuItems"
          :key="item.title"
          v-bind="item"
          class="transform transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl animate-entrance"
          :style="{ animationDelay: `${0.3 + (index * 0.15)}s` }"
        />
      </div>
    </div>
    
  </div>
</template>
