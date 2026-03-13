<script setup lang="ts">
import MenuCard from '@/components/MenuCard.vue'

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
  }
]
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[80vh] gap-12">
    <div class="text-center space-y-4">
      <h1 class="text-6xl md:text-8xl font-black text-[#5C4D00] drop-shadow-sm">
        Halo Teman!
      </h1>
      <p class="text-2xl md:text-3xl font-bold text-[#8B7700]">
        Ayo kita belajar sambil bermain!
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
      <MenuCard
        v-for="item in menuItems"
        :key="item.title"
        v-bind="item"
      />
    </div>
  </div>
</template>
