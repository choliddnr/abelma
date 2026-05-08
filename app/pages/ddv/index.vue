<script setup lang="ts">
import { useAudio } from "~/composables/useAudio";

const router = useRouter();
const { play } = useAudio();

const menuItems = [
  {
    title: "Belajar Dulu",
    subtitle: "Kenali bunyi vokal rangkap",
    icon: "lucide:book-open-check",
    colorClass: "bg-teal-500 text-white",
    to: "/ddv/learn",
  },
  {
    title: "Mulai Main",
    subtitle: "Sambung Vokal",
    icon: "lucide:gamepad-2",
    colorClass: "bg-emerald-500 text-white",
    to: "/ddv/quiz",
  },
];

onMounted(() => {
  play("Ayo kita belajar vokal rangkap! Gabungkan dua bunyi jadi satu.");
});
</script>

<template>
  <div class="relative h-[80vh] w-full overflow-hidden pb-32">
    <!-- Main Content -->
    <div class="relative z-10 pt-10 md:pt-24">
      <ModuleHeader 
        title="Vokal Rangkap" 
        subtitle="Pilih tingkat belajar yang kamu mau!" 
        icon="lucide:audio-lines"
        iconType="icon"
        colorClass="text-teal-600"
      />

      <div class="flex flex-wrap max-w-7xl mx-auto flex-row items-center justify-center gap-0 md:gap-7 lg:gap-10 relative">
        <MenuBubble
          v-for="(item, index) in menuItems"
          :key="item.title"
          v-bind="item"
          :index="index"
          class="animate-entrance w-44"
          :style="{ animationDelay: `${index * 0.15}s` }"
        />
      </div>
    </div>

    <!-- Decorative Elements -->
    <div class="fixed bottom-0 right-0 p-8 opacity-20 pointer-events-none -z-10">
      <Icon name="lucide:audio-lines" class="size-64 text-teal-400" />
    </div>
  </div>
</template>

<style scoped>
.animate-entrance {
  animation: entrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes entrance {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
