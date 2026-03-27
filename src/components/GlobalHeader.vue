<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authClient } from '@/lib/auth-client'
import { useRewardStore, useSyncStore } from '@/stores'
import ProfileSelector from './ProfileSelector.vue'

const router = useRouter()
const route = useRoute()
const rewardStore = useRewardStore()
const syncStore = useSyncStore()
const session = authClient.useSession()

const points = computed(() => rewardStore.currentPoints)
const isHome = computed(() => route.path === '/')

const logout = async () => {
  await authClient.signOut()
  await syncStore.clearAllData()
  router.push('/login')
}
</script>

<template>
  <header class="relative z-30 w-full max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center gap-4 shrink-0 font-quicksand">
    <!-- Left: Branding or Back Button -->
    <div class="flex items-center gap-4">
      <div v-if="isHome" class="flex flex-col leading-tight">
        <h1 class="text-2xl md:text-4xl font-black text-indigo-600 font-quicksand drop-shadow-sm">Abelma</h1>
        <span class="text-[10px] md:text-sm font-bold text-slate-400 font-quicksand uppercase tracking-widest leading-none">
          Belajar & Bermain
        </span>
      </div>
      <button v-else @click="router.back()" 
        class="ui-capsule-interactive bg-white border-slate-200 text-slate-700 w-auto shadow-sm py-2 px-4">
        <span class="text-xl">🔙</span>
        <span class="font-black text-sm hidden sm:inline ml-1">Kembali</span>
      </button>
    </div>

    <div class="flex-1"></div>

    <!-- Right: Actions & Auth -->
    <div class="flex items-center gap-2 md:gap-4">
      <!-- Points -->
      <router-link to="/words/rewards" 
        class="ui-capsule-interactive bg-amber-400 border-amber-500 text-white w-auto px-4 py-2 shadow-lg hover:rotate-3 font-quicksand animate-float h-10 md:h-12">
        <span class="text-lg md:text-xl">🪙</span>
        <span class="font-black text-xs md:text-base ml-1">{{ points }} <span class="hidden md:inline">Koin</span></span>
      </router-link>

      <!-- Profile Selector -->
      <ProfileSelector />

      <!-- Parent Lounge -->
      <button @click="router.push('/parent')"
        class="ui-capsule-interactive bg-white border-slate-200 text-slate-700 w-auto shadow-sm hover:shadow-md h-10 md:h-12 py-2 px-3 md:px-4">
        <span class="text-xl md:text-2xl">👨‍👩‍👧</span>
        <span class="font-black text-xs md:text-base hidden lg:inline ml-1">Orang Tua</span>
      </button>

      <!-- User Auth -->
      <div v-if="session.data" class="flex items-center gap-2 md:gap-3 ml-2 border-l pl-4 border-slate-200">
        <div class="text-right hidden sm:block leading-tight">
          <p class="text-[10px] md:text-xs font-bold text-slate-500">Halo,</p>
          <p class="text-xs md:text-sm font-black text-indigo-600 truncate max-w-[80px]">{{ session.data.user.name }}</p>
          <button @click="logout" class="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-tighter">
            Keluar
          </button>
        </div>
        <img :src="session.data.user.image || ''" :alt="session.data.user.name"
          class="w-10 h-10 rounded-full border-2 border-indigo-400 shadow-md transform hover:scale-110 transition-transform cursor-pointer" 
          @click="router.push('/profile')" />
      </div>
      
      <router-link v-else to="/login"
        class="ui-capsule-interactive bg-indigo-500 border-indigo-600 text-white font-black py-2 px-6 shadow-lg text-sm h-10 md:h-12">
        Masuk
      </router-link>
    </div>
  </header>
</template>
