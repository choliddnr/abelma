<script setup lang="ts">
import { useAudio } from "~/composables/useAudio";

const router = useRouter();
const { play } = useAudio();

const menuItems = [
  {
    title: "Belajar Dulu",
    subtitle: "Kenali berbagai bunyi akhiran",
    icon: "lucide:book-open-check",
    colorClass: "bg-indigo-500 text-white",
    to: "/cvc/learn",
  },
  {
    title: "Mulai Main",
    subtitle: "Tantangan Tebak Kata",
    icon: "lucide:gamepad-2",
    colorClass: "bg-rose-500 text-white",
    to: "/cvc/quiz",
  },
];

onMounted(() => {
  // play("lab_greeting"); // Assuming we might add this audio later
  play("Selamat datang di Lab Kata! Ayo kita belajar menggabungkan huruf.");
});
</script>

<template>
  <div class="flex flex-col min-h-[90vh] relative p-4 md:p-8">
    <!-- Main Content -->
    <div class="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full gap-8 z-10">
      <div class="text-center space-y-4 animate-entrance">
        <h1 class="text-5xl md:text-7xl font-black text-indigo-600 drop-shadow-sm font-quicksand">
          Lab Kata
        </h1>
        <p class="text-xl md:text-2xl font-bold text-slate-500">
          Pilih tingkat belajar yang kamu mau!
        </p>
      </div>

      <div class="flex flex-wrap justify-center gap-2 md:gap-4">
        <MenuCard
          v-for="(item, index) in menuItems"
          :key="item.title"
          v-bind="item"
          class="transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-entrance size-40 sm:size-52 md:size-60 lg:size-60 2xl:size-72"
          :style="{ animationDelay: `${index * 0.15}s` }"
        />
      </div>
    </div>

    <!-- Decorative Elements -->
    <div class="fixed bottom-0 right-0 p-8 opacity-20 pointer-events-none -z-10">
      <Icon name="lucide:flask-conical" class="size-64 text-indigo-400" />
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
