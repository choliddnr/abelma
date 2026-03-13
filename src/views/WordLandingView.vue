<script setup lang="ts">
import { useRouter } from 'vue-router'
import MenuCard from '@/components/MenuCard.vue'

const router = useRouter()
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
  <div class="flex flex-col min-h-screen bg-slate-50 relative p-4 md:p-8">
    
    <!-- Pattern Background -->
    <div class="absolute inset-x-0 top-0 h-96 bg-indigo-50/50 rounded-b-[4rem] md:rounded-b-[8rem] pointer-events-none overflow-hidden">
        <div class="absolute -top-24 -left-24 w-64 h-64 bg-indigo-200/40 rounded-full blur-3xl"></div>
        <div class="absolute top-12 -right-12 w-48 h-48 bg-emerald-200/40 rounded-full blur-3xl"></div>
    </div>

    <!-- Header -->
    <div class="flex items-center shrink-0 z-10 w-full max-w-5xl mx-auto mb-12">
      <button @click="goBack"
        class="ui-capsule-interactive bg-white border-slate-200 text-slate-700 w-auto shadow-sm hover:shadow-md transition-all">
        <span class="text-xl md:text-2xl">🔙</span>
        <span class="font-black text-sm md:text-base hidden sm:inline">Kembali</span>
      </button>

      <div class="flex-1"></div>

      <div class="flex gap-2 md:gap-4">
        <button @click="router.push('/words/stickers')"
            class="ui-capsule-interactive bg-white border-slate-200 text-slate-700 w-auto shadow-sm hover:shadow-md transition-all">
            <span class="text-xl md:text-2xl">⭐</span>
            <span class="font-black text-sm md:text-base hidden sm:inline">Koleksi</span>
        </button>

        <button @click="router.push('/words/settings')"
            class="ui-capsule-interactive bg-white border-slate-200 text-slate-700 w-auto shadow-sm hover:shadow-md transition-all">
            <span class="text-xl md:text-2xl">⚙️</span>
            <span class="font-black text-sm md:text-base hidden sm:inline">Pengaturan</span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full gap-12 z-10 -mt-12">
      <div class="text-center space-y-4">
        <h1 class="text-5xl md:text-7xl font-black text-indigo-600 drop-shadow-sm" style="font-family: 'Quicksand', sans-serif;">
          Belajar Kata
        </h1>
        <p class="text-xl md:text-2xl font-bold text-slate-500" style="font-family: 'Quicksand', sans-serif;">
          Pilih mode bermainmu!
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-3xl">
        <MenuCard
          v-for="item in menuItems"
          :key="item.title"
          v-bind="item"
          class="transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl"
        />
      </div>
    </div>
    
  </div>
</template>
