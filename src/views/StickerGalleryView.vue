<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useStickerStore } from '@/stores'

const router = useRouter()
const stickerStore = useStickerStore()
const goBack = () => router.push('/words')
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col p-4 md:p-8">
    
    <!-- Header -->
    <div class="flex items-center justify-between w-full max-w-5xl mx-auto mb-8">
      <button @click="goBack"
        class="ui-capsule-interactive bg-white border-slate-200 text-slate-700 w-auto shadow-sm hover:shadow-md transition-all">
        <span class="text-xl md:text-2xl">🔙</span>
        <span class="font-black text-sm md:text-base hidden sm:inline">Kembali</span>
      </button>

      <h1 class="text-3xl md:text-5xl font-black text-amber-500 drop-shadow-sm font-quicksand">
         Koleksi Stiker
      </h1>

      <div class="w-12 md:w-24"></div>
    </div>

    <!-- Sticker Grid -->
    <div class="flex-1 w-full max-w-5xl mx-auto">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            <div v-for="sticker in stickerStore.allAvailableStickers" :key="sticker.id"
                class="relative glass-card flex flex-col items-center justify-center p-6 aspect-square rounded-[3rem] border-4 transition-all duration-500"
                :class="stickerStore.earnedStickers.has(sticker.id) ? 'bg-white border-amber-300 shadow-xl' : 'bg-slate-100 border-slate-200 opacity-40 grayscale'">
                
                <!-- Emoji Display -->
                <div class="text-6xl md:text-8xl mb-4 drop-shadow-md transition-transform duration-500"
                    :class="stickerStore.earnedStickers.has(sticker.id) ? 'hover:scale-110 active:rotate-12' : ''">
                    {{ sticker.emoji }}
                </div>

                <!-- Label -->
                <div class="text-center">
                    <p class="font-black text-slate-800 text-sm md:text-base font-quicksand">
                        {{ sticker.name }}
                    </p>
                    <p v-if="!stickerStore.earnedStickers.has(sticker.id)" class="text-xs text-slate-500 font-bold mt-1">
                        🔒 Butuh {{ sticker.requiredScore }} Poin
                    </p>
                    <p v-else class="text-xs text-emerald-500 font-black mt-1">
                        ✅ Dimiliki
                    </p>
                </div>

                <!-- Shine Effect for Earned -->
                <div v-if="stickerStore.earnedStickers.has(sticker.id)" class="absolute top-0 inset-x-0 h-1/2 bg-linear-to-b from-white/40 to-transparent rounded-t-[inherit] pointer-events-none"></div>
            </div>
        </div>
    </div>

    <!-- Empty State Hint -->
    <div class="mt-12 text-center text-slate-400 font-bold font-quicksand italic">
        "Main kuis terus untuk melengkapi koleksi stikermu! 🚀"
    </div>

  </div>
</template>

<style scoped>
.font-quicksand {
    font-family: 'Quicksand', sans-serif;
}
</style>
