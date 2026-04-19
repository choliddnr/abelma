<script setup lang="ts">
const router = useRouter();
// Reward store/Coins handled by GlobalHeader

const menuItems = [
  {
    title: "Belajar Dulu",
    subtitle: "Mengeja Suku Kata",
    icon: "📖",
    colorClass: "bg-[#FFD93D] text-[#634E00]",
    to: "/words/learn",
  },
  {
    title: "Mulai Main",
    subtitle: "Tantangan Tebak Kata",
    icon: "🏆",
    colorClass: "bg-[#6BCB77] text-white",
    to: "/words/quiz",
  },
];
</script>

<template>
  <div class="flex flex-col min-h-screen relative p-4 md:p-8">
    <!-- Full-screen Frosted Overlay -->
    <div class="fixed inset-0 bg-white/20 backdrop-blur-md pointer-events-none -z-10"></div>

    <!-- View Actions (Contextual items not in Global Header) -->
    <!-- <div class="flex items-center shrink-0 z-10 w-full max-w-5xl mx-auto mb-4 animate-entrance">
      <div class="flex-1"></div>
      <div class="flex gap-2 md:gap-4">
        <UiButton to="/words/stickers" variant="white" icon="🖼️" class="w-auto shadow-sm">
          <span class="font-black text-sm md:text-base hidden sm:inline">Koleksi</span>
        </UiButton>

        <UiButton
          @click="router.push('/words/settings')"
          variant="white"
          icon="⚙️"
          class="w-auto shadow-sm"
        >
          <span class="font-black text-sm md:text-base hidden sm:inline">Pengaturan</span>
        </UiButton>
      </div>
    </div> -->

    <!-- Main Content -->
    <div
      class="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full gap-6 md:gap-10 z-10"
    >
      <div class="text-center space-y-4 animate-entrance">
        <h1 class="text-5xl md:text-7xl font-black text-indigo-600 drop-shadow-sm">Belajar Kata</h1>
        <p class="text-xl md:text-2xl font-bold text-slate-500">Pilih mode bermainmu!</p>
      </div>
      <div class="flex flex-wrap justify-center gap-4">
        <MenuCard
          v-for="(item, index) in menuItems"
          :key="item.title"
          v-bind="item"
          class="transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-entrance size-72"
          :style="{ animationDelay: `${index * 0.15}s` }"
        />
      </div>
    </div>
  </div>
</template>
