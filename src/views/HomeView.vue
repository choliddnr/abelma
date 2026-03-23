<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import MenuCard from '@/components/MenuCard.vue'
import ProfileSelector from '@/components/ProfileSelector.vue'
import { getCurrentPoints } from '@/utils/rewardStore'

const router = useRouter()
const points = computed(() => getCurrentPoints())

const menuItems = [
  {
    title: 'Belajar Huruf',
    subtitle: 'Mengenal A-Z',
    icon: 'ABC',
    colorClass: 'bg-[#FFD93D] text-[#634E00]',
    to: '/alphabet'
  },
  {
    title: 'Belajar Kata',
    subtitle: 'Mengeja Benda',
    icon: '🍎',
    colorClass: 'bg-[#6BCB77] text-white',
    to: '/words'
  },
  {
    title: 'Permainan',
    subtitle: 'Tebak Gambar',
    icon: '🎮',
    colorClass: 'bg-[#4D96FF] text-white',
    to: '/games'
  },
  {
    title: 'Buku Huruf',
    subtitle: 'Cerita A–Z',
    icon: '📖',
    colorClass: 'bg-[#A084E8] text-white',
    to: '/storybook'
  }
]
</script>

<template>
  <div class="flex flex-col min-h-screen relative p-4 md:p-8 overflow-hidden">
    <!-- Pattern Background (keep subtle patterns but remove opaque bg) -->
    <div class="absolute inset-x-0 top-0 h-128 bg-indigo-50/20 rounded-b-[4rem] md:rounded-b-[8rem] pointer-events-none overflow-hidden">
        <div class="absolute -top-24 -left-24 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute top-12 -right-12 w-64 h-64 bg-emerald-200/40 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
    </div>

    <!-- Global Header -->
    <div class="flex items-center shrink-0 z-10 w-full max-w-6xl mx-auto mb-12">
      <div class="flex flex-col leading-tight">
          <h2 class="text-3xl md:text-4xl font-black text-indigo-600 font-quicksand drop-shadow-sm">Abelma</h2>
          <span class="text-xs md:text-sm font-bold text-slate-400 font-quicksand uppercase tracking-widest">Belajar & Bermain</span>
      </div>

      <div class="flex-1"></div>

      <div class="flex gap-2 md:gap-4">
        <router-link to="/words/rewards" class="ui-capsule-interactive bg-amber-400 border-amber-500 text-white w-auto px-4 shadow-lg hover:rotate-3 font-quicksand animate-float">
           🪙 {{ points }} <span class="hidden sm:inline ml-1">Koin</span>
        </router-link>
        
        <button @click="router.push('/parent')"
            class="ui-capsule-interactive bg-white border-slate-200 text-slate-700 w-auto shadow-sm hover:shadow-md transition-all active:scale-90">
            <span class="text-xl md:text-2xl">👨‍👩‍👧</span>
            <span class="font-black text-sm md:text-base hidden sm:inline">Orang Tua</span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full gap-12 z-10 -mt-12">
      
      <!-- Profile Management -->
      <div class="w-full max-w-md">
        <ProfileSelector />
      </div>

      <div class="text-center space-y-4">
        <h1 class="text-6xl md:text-8xl font-black text-indigo-600 drop-shadow-sm font-quicksand">
          Halo Teman!
        </h1>
        <p class="text-2xl md:text-3xl font-bold text-slate-500 font-quicksand">
          Ayo kita belajar sambil bermain!
        </p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full">
        <MenuCard
          v-for="(item, index) in menuItems"
          :key="item.title"
          v-bind="item"
          class="transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-entrance"
          :style="{ animationDelay: `${index * 0.15}s` }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-quicksand {
    font-family: 'Quicksand', sans-serif;
}
</style>
