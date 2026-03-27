<script setup lang="ts">
import MenuCard from '@/components/MenuCard.vue'

// Points handled by GlobalHeader


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
  },
  {
    title: 'Hadiah',
    subtitle: 'Tukar Koinmu',
    icon: '🎁',
    colorClass: 'bg-[#FF8B8B] text-white',
    to: '/words/rewards'
  },
]
</script>

<template>
  <div class="flex flex-col min-h-screen relative p-4 md:p-8 overflow-hidden">
    <!-- Full-screen Frosted Overlay -->
    <div class="fixed inset-0 bg-white/20 backdrop-blur-md pointer-events-none -z-10"></div>



    <!-- Main Content -->
    <div class="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full gap-8 md:gap-12 z-10 mt-4 md:mt-8">

      <!-- Main Greeting -->
      <div class="text-center space-y-4">
        <h1 class="text-6xl md:text-8xl font-black text-indigo-600 drop-shadow-sm font-quicksand">
          Halo Teman!
        </h1>
        <p class="text-2xl md:text-3xl font-bold text-slate-500 font-quicksand">
          Ayo kita belajar sambil bermain!
        </p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 w-full">
        <MenuCard v-for="(item, index) in menuItems" :key="item.title" v-bind="item"
          class="transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-entrance"
          :style="{ animationDelay: `${index * 0.15}s` }" />
      </div>
    </div>
  </div>
</template>
