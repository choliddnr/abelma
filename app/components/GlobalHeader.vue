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
    class="sticky top-0 z-50 w-full backdrop-blur-md border-b border-slate-200 max-w-7xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between font-quicksand"
  >
    <!-- LEFT -->
    <div class="flex items-center gap-2 sm:gap-4">
      <!-- Branding -->
      <template v-if="isHome">
        <div class="flex flex-col leading-tight">
          <h1 class="text-lg sm:text-2xl md:text-4xl font-black text-indigo-600">Abelma</h1>
          <span class="text-[8px] sm:text-[10px] md:text-sm font-bold text-slate-400 uppercase">
            Belajar & Bermain
          </span>
        </div>
      </template>

      <!-- Back + Home -->
      <template v-else>
        <UiButton @click="router.back()" variant="white" icon="🔙" class="px-2 py-2 h-10" />
        <UiButton @click="router.push('/')" variant="white" icon="🏠" class="px-2 py-2 h-10" />
      </template>
    </div>

    <!-- RIGHT -->
    <div class="flex items-center gap-2">
      <!-- Coins (ALWAYS visible) -->
      <UiButton to="/rewards" variant="primary" icon="🪙" class="px-3 py-2 h-10 text-xs sm:text-sm">
        <span class="font-black text-lg">
          {{ profile?.coins }}
          <span class="hidden sm:inline">Koin</span>
        </span>
      </UiButton>
      <UiButton
        @click="toggleFullscreen"
        variant="white"
        :icon="isFullscreen ? '🔳' : '⛶'"
        class="px-3 py-2 h-10"
        title="Layar Penuh"
      />

      <!-- DESKTOP MENU -->
      <div class="hidden sm:flex items-center gap-3">
        <!-- Parent -->
        <UiButton @click="router.push('/parent')" variant="white" icon="👨‍👩‍👧" class="px-3 py-2 h-10">
          <span class="font-black text-sm ml-1">Orang Tua</span>
        </UiButton>

        <!-- Profile -->
        <div v-if="profile" class="flex items-center gap-2 border-l pl-3 border-slate-200">
          <div class="text-right leading-tight">
            <p class="text-xs font-bold text-slate-500">Halo,</p>
            <p class="text-sm font-black text-indigo-600 truncate max-w-[100px]">
              {{ profile?.name }}
            </p>
          </div>

          <div
            class="w-10 h-10 flex items-center justify-center bg-white rounded-full border-2 border-indigo-400 shadow-md text-xl"
          >
            {{ profile?.avatar }}
          </div>
        </div>
      </div>

      <!-- MOBILE BURGER -->
      <div class="relative sm:hidden">
        <UiButton
          @click="isMenuOpen = !isMenuOpen"
          variant="white"
          icon="☰"
          class="px-4 py-2 h-10"
        />
        <!-- <button
          @click="isMenuOpen = !isMenuOpen"
          class="w-9 h-10 flex items-center justify-center rounded-lg bg-white shadow"
        >
          ☰
        </button> -->

        <!-- DROPDOWN -->
        <div
          v-if="isMenuOpen"
          class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg p-2 flex flex-col gap-2"
        >
          <!-- Parent -->
          <button
            @click="
              router.push('/parent');
              isMenuOpen = false;
            "
            class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100"
          >
            👨‍👩‍👧 <span class="font-bold text-sm">Orang Tua</span>
          </button>

          <!-- Profile -->
          <div
            v-if="profile"
            class="flex items-center gap-2 px-3 py-2 border-t-2 border-gray-200 pt-2"
          >
            <div
              class="w-8 h-8 flex items-center justify-center bg-white rounded-full border-gray-200 border-2 text-lg"
            >
              {{ profile?.avatar }}
            </div>
            <div class="leading-tight">
              <p class="text-xs text-slate-500">Halo,</p>
              <p class="text-sm font-bold text-indigo-600 truncate max-w-[100px]">
                {{ profile?.name }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
