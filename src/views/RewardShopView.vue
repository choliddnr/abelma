<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRewardStore } from '@/stores'
import type { Reward } from '@/types/stores'
import { playEffectAudio } from '@/utils/audio'
import confetti from 'canvas-confetti'

const router = useRouter()
const rewardStore = useRewardStore()
const goBack = () => router.push('/')

const points = computed(() => rewardStore.currentPoints)
const rewards = computed(() => rewardStore.rewards)

const handleClaim = async (reward: Reward) => {
    if (reward.cost <= points.value && reward.status === 'available') {
        const success = await rewardStore.claimReward(reward.id)
        if (success) {
            playEffectAudio('sticker')
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                zIndex: 100
            })
        }
    }
}
</script>

<template>
  <div class="min-h-screen flex flex-col p-4 md:p-8 relative overflow-hidden">
    <!-- Background Decoration -->
    <div class="absolute -top-10 -right-10 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl"></div>

    <!-- Header (Animated) -->
    <div class="relative z-10 flex items-center justify-between w-full max-w-5xl mx-auto mb-8 animate-entrance">
      <button @click="goBack"
        class="ui-capsule-interactive bg-white border-slate-200 text-slate-700 w-auto shadow-sm">
        <span class="text-xl md:text-2xl">🔙</span>
        <span class="font-black text-sm md:text-base hidden sm:inline">Kembali</span>
      </button>

      <h1 class="text-3xl md:text-5xl font-black text-indigo-600 drop-shadow-sm font-quicksand flex items-center gap-2">
         <span class="text-4xl">🎁</span> Toko Hadiah
      </h1>

      <div class="ui-capsule bg-amber-400 border-amber-500 text-white w-auto px-6 animate-float shadow-lg shadow-amber-200">
          <span class="text-xl md:text-2xl drop-shadow-md">🪙 {{ points }}</span>
      </div>
    </div>

    <!-- Reward Grid -->
    <div class="relative z-10 flex-1 w-full max-w-5xl mx-auto">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="(reward, index) in rewards" :key="reward.id"
                class="glass-card bg-white flex flex-col p-6 rounded-[2.5rem] border-x-4 border-t-4 transition-all duration-300 group animate-entrance"
                :class="[
                    reward.status === 'available' && points >= reward.cost ? 'border-indigo-100 hover:-translate-y-3 hover:shadow-2xl' : 'border-slate-50 opacity-80',
                    reward.status === 'claimed' ? 'bg-indigo-50/50 border-indigo-200' : '',
                    reward.status === 'fulfilled' ? 'opacity-40 grayscale scale-95' : ''
                ]"
                :style="{ animationDelay: `${index * 0.1}s` }">
                
                <!-- Emoji & Cost -->
                <div class="flex justify-between items-start mb-6">
                    <div class="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-5xl shadow-inner group-hover:scale-110 transition-transform">
                        {{ reward.emoji }}
                    </div>
                    <div class="bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-black text-lg border-2 border-amber-200">
                        {{ reward.cost }} 🪙
                    </div>
                </div>

                <!-- Info -->
                <div class="flex-1 mb-6">
                    <h3 class="text-2xl font-black text-slate-800 font-quicksand mb-1">{{ reward.title }}</h3>
                    <p v-if="reward.status === 'available'" class="text-slate-500 font-bold">Ayo kumpulkan koin untuk tukar!</p>
                    <p v-else-if="reward.status === 'claimed'" class="text-indigo-600 font-black flex items-center gap-1">
                        ⌚ Sudah ditukar! Tunggu Ayah/Bunda ya...
                    </p>
                    <p v-else class="text-emerald-600 font-black">✨ Sudah diterima!</p>
                </div>

                <!-- Action -->
                <button v-if="reward.status === 'available'"
                    @click="handleClaim(reward)"
                    :disabled="points < reward.cost"
                    class="ui-capsule-interactive w-full text-xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
                    :class="points >= reward.cost ? 'bg-linear-to-r from-amber-400 to-orange-500 border-orange-600 text-white shadow-orange-200' : 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'">
                    <span class="drop-shadow-sm">Tukar Hadiah 🚀</span>
                </button>
                <div v-else-if="reward.status === 'claimed'" class="py-3 px-6 bg-indigo-100 text-indigo-700 border-2 border-indigo-200 rounded-2xl text-center font-black">
                    TERKLAIM ✅
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-if="rewards.length === 0" class="flex flex-col items-center justify-center py-20 text-center gap-4">
             <span class="text-8xl">🏜️</span>
             <h2 class="text-2xl font-black text-slate-400 font-quicksand">Belum ada hadiah yang disiapkan Ayah/Bunda.</h2>
        </div>
    </div>

    <!-- Motivational Footer -->
    <div class="mt-8 text-center text-indigo-400 font-bold font-quicksand italic animate-pulse">
        "Terus belajar, kumpulkan koinnya, dapatkan hadiahnya! 🚀✨"
    </div>
  </div>
</template>

<style scoped>
.font-quicksand {
    font-family: 'Quicksand', sans-serif;
}
</style>
