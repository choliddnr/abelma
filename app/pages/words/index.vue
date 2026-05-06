<script setup lang="ts">
const router = useRouter();
// Reward store/Coins handled by GlobalHeader

const menuItems = [
  {
    title: "Belajar Dulu",
    subtitle: "Mengeja Suku Kata",
    icon: "lucide:book-open",
    colorClass: "bg-[#FFD93D] text-[#634E00]",
    to: "/words/learn",
  },
  {
    title: "Mulai Main",
    subtitle: "Tantangan Tebak Kata",
    icon: "lucide:trophy",
    colorClass: "bg-[#6BCB77] text-white",
    to: "/words/quiz",
  },
];
</script>

<template>
  <div class="flex flex-col h-[70vh] relative p-4 md:p-8">
    <!-- Full-screen Frosted Overlay -->
    <div class="fixed inset-0 bg-white/20 backdrop-blur-md pointer-events-none -z-10"></div>

    <!-- View Actions (Contextual items not in Global Header) -->
    <!-- <div class="flex items-center shrink-0 z-10 w-full max-w-5xl mx-auto mb-4 animate-entrance">
      <div class="flex-1"></div>
      <div class="flex gap-2 md:gap-4">
        <UiButton to="/words/stickers" variant="white" icon="lucide:image" class="w-auto shadow-sm">
          <span class="font-black text-sm md:text-base hidden sm:inline">Koleksi</span>
        </UiButton>

        <UiButton
          @click="router.push('/words/settings')"
          variant="white"
          icon="lucide:settings"
          class="w-auto shadow-sm"
        >
          <span class="font-black text-sm md:text-base hidden sm:inline">Pengaturan</span>
        </UiButton>
      </div>
    </div> -->

    <!-- Main Content -->
    <div
      class="flex-1 flex flex-col items-center justify-center  max-w-5xl mx-auto w-full gap-6 z-10"
    >
      <ModuleHeader 
        title="Belajar Kata" 
        subtitle="Pilih mode bermainmu!" 
        icon="lucide:apple"
        iconType="icon"
        colorClass="text-indigo-600"
      />
      <div class="flex flex-wrap justify-center gap-2  md:gap-4">
        <MenuCard
          v-for="(item, index) in menuItems"
          :key="item.title"
          v-bind="item"
          class="transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-entrance  size-40 sm:size-52 md:size-60 lg:size-60 2xl:size-72"
          :style="{ animationDelay: `${index * 0.15}s` }"
        />
      </div>
    </div>
  </div>
</template>
