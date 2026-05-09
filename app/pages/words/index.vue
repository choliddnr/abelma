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
  <div
    class="flex flex-col items-center justify-between h-[80vh] w-full overflow-hidden"
  >
    <!-- Full-screen Frosted Overlay -->
    <div class="fixed inset-0 pointer-events-none -z-10"></div>

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
    <!-- <div class="relative z-10 pt-10 md:pt-24"> -->
    <ModuleHeader
      title="Belajar Kata"
      subtitle="Pilih mode bermainmu!"
      icon="lucide:apple"
      iconType="icon"
      colorClass="text-indigo-600"
    />
    <div
      class="flex flex-wrap max-w-7xl mx-auto flex-row items-center justify-center gap-0 md:gap-7 lg:gap-10 relative"
    >
      <MenuBubble
        v-for="(item, index) in menuItems"
        :key="item.title"
        v-bind="item"
        :index="index"
        class="animate-entrance w-44"
        :style="{ animationDelay: `${index * 0.08}s` }"
      />
    </div>
    <Navigation />
    <!-- </div> -->
  </div>
</template>
