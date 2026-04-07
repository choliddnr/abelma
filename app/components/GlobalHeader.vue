<script setup lang="ts">
import { authClient } from "~/utils/auth-client";

const router = useRouter();
const route = useRoute();
const session = authClient.useSession();

const { coins } = storeToRefs(useRewardStore());
const { selectedProfile } = storeToRefs(useProfileStore());
const isHome = computed(() => route.path === "/");
</script>

<template>
  <header
    class="relative z-30 w-full max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center gap-4 shrink-0 font-quicksand"
  >
    <!-- Left: Branding or Back Button -->
    <div class="flex items-center gap-4">
      <div v-if="isHome" class="flex flex-col leading-tight">
        <h1
          class="text-2xl md:text-4xl font-black text-indigo-600 font-quicksand drop-shadow-sm"
        >
          Abelma
        </h1>
        <span
          class="text-[10px] md:text-sm font-bold text-slate-400 font-quicksand uppercase tracking-widest leading-none"
        >
          Belajar & Bermain
        </span>
      </div>
      <button
        v-else
        @click="router.back()"
        class="ui-capsule-interactive bg-white border-slate-200 text-slate-700 w-auto shadow-sm py-2 px-4"
      >
        <span class="text-xl">🔙</span>
        <span class="font-black text-sm hidden sm:inline ml-1">Kembali</span>
      </button>
    </div>

    <div class="flex-1"></div>

    <!-- Right: Actions & Auth -->
    <div class="flex items-center gap-2 md:gap-4">
      <!-- coins -->
      <NuxtLink
        to="/words/rewards"
        class="ui-capsule-interactive bg-amber-400 border-amber-500 text-white w-auto px-4 py-2 shadow-lg hover:rotate-3 font-quicksand animate-float h-10 md:h-12"
      >
        <span class="text-lg md:text-xl">🪙</span>
        <span class="font-black text-xs md:text-base ml-1"
          >{{ coins }} <span class="hidden md:inline">Koin</span></span
        >
      </NuxtLink>

      <!-- Parent Lounge (Area Orang Tua) -->

      <!-- Parent Lounge -->
      <button
        @click="router.push('/parent')"
        class="ui-capsule-interactive bg-white border-slate-200 text-slate-700 w-auto shadow-sm hover:shadow-md h-10 md:h-12 py-2 px-3 md:px-4"
      >
        <span class="text-xl md:text-2xl">👨‍👩‍👧</span>
        <span class="font-black text-xs md:text-base hidden lg:inline ml-1"
          >Orang Tua</span
        >
      </button>

      <!-- Active Profile (Static) -->
      <div
        v-if="selectedProfile"
        class="flex items-center gap-2 md:gap-3 ml-2 border-l pl-4 border-slate-200"
      >
        <div class="text-right hidden sm:block leading-tight">
          <p class="text-[10px] md:text-xs font-bold text-slate-500">Halo,</p>
          <p
            class="text-xs md:text-sm font-black text-indigo-600 truncate max-w-[80px]"
          >
            {{ selectedProfile.name }}
          </p>
        </div>
        <div
          class="w-10 h-10 flex items-center justify-center bg-white rounded-full border-2 border-indigo-400 shadow-md text-2xl"
        >
          {{ selectedProfile.avatar }}
        </div>
      </div>
    </div>
  </header>
</template>
