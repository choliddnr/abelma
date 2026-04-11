<script setup lang="ts">
const router = useRouter();
const route = useRoute();

const showHeader = computed(() => {
  return !["/login", "/welcome"].includes(route.path);
});

const { profile } = storeToRefs(useProfileStore());
const isHome = computed(() => route.path === "/");
</script>

<template>
  <header
    v-if="showHeader"
    class="relative z-30 w-full max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center gap-4 shrink-0 font-quicksand"
  >
    <!-- Left: Branding or Back Button -->
    <div v-if="isHome" class="flex items-center gap-4">
      <div class="flex flex-col leading-tight">
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
    </div>
    <div v-else class="flex gap-2">
      <UiButton
        @click="router.back()"
        variant="white"
        icon="🔙"
        class="w-auto shadow-sm py-2 px-4 h-auto"
      >
        <span class="font-black text-sm hidden sm:inline ml-1">Kembali</span>
      </UiButton>
      <UiButton
        @click="router.push('/')"
        variant="white"
        icon="🏠"
        class="w-auto shadow-sm py-2 px-4 h-auto"
      >
        <span class="font-black text-sm hidden sm:inline ml-1">Home</span>
      </UiButton>
    </div>

    <div class="flex-1"></div>

    <!-- Right: Actions & Auth -->
    <div class="flex items-center gap-2 md:gap-4">
      <!-- coins -->
      <UiButton
        to="/rewards"
        variant="primary"
        icon="🪙"
        class="w-auto px-4 py-2 shadow-lg hover:rotate-3 font-quicksand h-10 md:h-12"
      >
        <span class="font-black text-xs md:text-base ml-1"
          >{{ profile?.coins }} <span class="hidden md:inline">Koin</span></span
        >
      </UiButton>

      <!-- Parent Lounge (Area Orang Tua) -->

      <!-- Parent Lounge -->
      <UiButton
        @click="router.push('/parent')"
        variant="white"
        icon="👨‍👩‍👧"
        class="w-auto shadow-sm hover:shadow-md h-10 md:h-12 py-2 px-3 md:px-4"
      >
        <span class="font-black text-xs md:text-base hidden lg:inline ml-1"
          >Orang Tua</span
        >
      </UiButton>

      <!-- Active Profile (Static) -->
      <div
        v-if="profile"
        class="flex items-center gap-2 md:gap-3 ml-2 border-l pl-4 border-slate-200"
      >
        <div class="text-right hidden sm:block leading-tight">
          <p class="text-[10px] md:text-xs font-bold text-slate-500">Halo,</p>
          <p
            class="text-xs md:text-sm font-black text-indigo-600 truncate max-w-[80px]"
          >
            {{ profile?.name }}
          </p>
        </div>
        <div
          class="w-10 h-10 flex items-center justify-center bg-white rounded-full border-2 border-indigo-400 shadow-md text-2xl"
        >
          {{ profile?.avatar }}
        </div>
      </div>
    </div>
  </header>
</template>
