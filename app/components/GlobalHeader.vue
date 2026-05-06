<script setup lang="ts">
const router = useRouter();
const route = useRoute();

const showHeader = computed(() => {
  return !["/login", "/welcome"].includes(route.path);
});

const { profile } = storeToRefs(useProfileStore());
const isHome = computed(() => route.path === "/");

const isMenuOpen = ref(false);

const isFullscreen = ref(false);

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      console.error(`Error attempting to enable fullscreen: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
};

onMounted(() => {
  document.addEventListener("fullscreenchange", () => {
    isFullscreen.value = !!document.fullscreenElement;
  });
});
</script>

<template>
  <header
    v-if="showHeader"
    class="sticky top-0 z-50 w-full px-4 py-4 pointer-events-none"
  >
    <div class="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
      <!-- LEFT: Logo -->
      <div class="flex items-center gap-4">
        <template v-if="isHome">
          <div class="flex flex-col leading-tight bg-white/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/50 shadow-lg">
            <h1 class="text-xl md:text-3xl font-black text-indigo-600 drop-shadow-sm font-quicksand">Abelma</h1>
            <span class="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider font-quicksand">
              Belajar & Bermain
            </span>
          </div>
        </template>
        <template v-else>
          <div class="flex gap-2">
            <UiButton @click="router.back()" variant="accent" icon="lucide:arrow-left"  />
            <UiButton @click="router.push('/')" variant="secondary" icon="lucide:house" />
          </div>
        </template>
      </div>

      <!-- MIDDLE: Coins Capsule -->
      <div class="hidden md:block">
        <NuxtLink to="/rewards" class="coin-capsule flex items-center gap-3 px-6 py-2 rounded-full shadow-lg border-2 border-white/60 transition-transform hover:scale-105 active:scale-95">
          <div class="size-8 rounded-full bg-yellow-400 flex items-center justify-center shadow-inner border border-yellow-200">
            <Icon name="lucide:circle-dollar-sign" class="text-white text-xl" />
          </div>
          <span class="font-black text-2xl text-slate-700 font-quicksand">
            {{ profile?.coins }} <span class="text-lg text-slate-500">Koin</span>
          </span>
        </NuxtLink>
      </div>

      <!-- RIGHT: Parent & Profile -->
      <div class="flex items-center gap-3">
        <!-- Fullscreen Button -->
        <UiButton
          @click="toggleFullscreen"
          variant="white"
          :icon="isFullscreen ? 'lucide:minimize' : 'lucide:maximize'"
          >
          </UiButton>

        <!-- Desktop: Parent & Profile -->
        <div class="hidden sm:flex items-center gap-3">
          <UiButton @click="router.push('/parent')" variant="primary" class="flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-slate-700 font-quicksand" >
            <Icon name="lucide:users" class="text-xl" />
            <span>Orang Tua</span>
          </UiButton>
          <!-- <button 
            @click="router.push('/parent')" 
            class="glass-button flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-slate-700 font-quicksand"
          >
            <Icon name="lucide:users" class="text-xl" />
            <span>Orang Tua</span>
          </button> -->

          <div v-if="profile" class="flex items-center gap-3 pl-3 border-l border-white/30">
            <div class="text-right leading-tight">
              <p class="text-[10px] font-bold text-slate-400">Halo,</p>
              <p class="text-sm font-black text-indigo-600 font-quicksand truncate max-w-[100px]">
                {{ profile?.name }}
              </p>
            </div>
            <div class="size-12 rounded-full bg-white border-2 border-indigo-300 shadow-md flex items-center justify-center text-2xl overflow-hidden relative group cursor-pointer hover:border-indigo-500 transition-colors">
              {{ profile?.avatar }}
              <div class="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/40 pointer-events-none"></div>
            </div>
          </div>
        </div>

        <!-- Mobile: Burger/Menu -->
        <div class="relative sm:hidden">
          <UiButton
            @click="isMenuOpen = !isMenuOpen"
            variant="white"
            icon="lucide:menu"
          />
          <div
            v-if="isMenuOpen"
            class="absolute right-0 mt-3 w-48 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-2 flex flex-col gap-1 border border-white"
          >
            <!-- Mobile Menu Items -->
            <button @click="router.push('/parent'); isMenuOpen = false" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/50 transition-colors text-slate-700 font-bold">
              <Icon name="lucide:users" /> <span>Orang Tua</span>
            </button>
            <div v-if="profile" class="px-4 py-3 border-t border-slate-200 mt-1 flex items-center gap-3">
              <span class="size-8 rounded-full bg-white border border-indigo-200 flex items-center justify-center">{{ profile?.avatar }}</span>
              <span class="font-black text-indigo-600 truncate">{{ profile?.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
@reference "../assets/base.css";

.glass-button {
  @apply bg-white/40 backdrop-blur-md border border-white/50 shadow-md transition-all duration-300 hover:bg-white/60 hover:shadow-lg active:scale-95 flex items-center justify-center;
}

.coin-capsule {
  background: linear-gradient(to bottom, #fff7ed, #ffedd5);
  @apply border border-orange-200/50;
  box-shadow: 
    inset 0 2px 4px rgba(255, 255, 255, 0.8),
    0 4px 12px rgba(0, 0, 0, 0.05);
}

.coin-capsule::after {
  content: '';
  @apply absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-full pointer-events-none;
}
</style>
