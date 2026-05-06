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
  <div class="flex flex-col min-h-[90vh] relative p-4 md:p-8">
    <!-- Main Content -->
    <div class="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full gap-8 z-10">
      <ModuleHeader 
        title="Vokal Rangkap" 
        subtitle="Pilih tingkat belajar yang kamu mau!" 
        icon="lucide:audio-lines"
        iconType="icon"
        colorClass="text-teal-600"
      />

      <div class="flex flex-wrap justify-center gap-4 md:gap-8">
        <MenuCard
          v-for="(item, index) in menuItems"
          :key="item.title"
          v-bind="item"
          :index="index"
          class="transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-entrance size-44 sm:size-56 md:size-64 lg:size-72 2xl:size-80"
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
