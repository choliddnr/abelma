<script setup lang="ts">
import { useAudio } from "~/composables/useAudio";
import { useNasalStore } from "~/stores/nasalStore";
import { nasalLevels } from "~/constants/nasalData";

const router = useRouter();
const { play } = useAudio();
const nasalStore = useNasalStore();

const menuItems = computed(() => {
  return nasalLevels.map((level) => {
    const isUnlocked = import.meta.dev || nasalStore.nasalProgress.learningLevel >= level.id;
    const isCompleted = (nasalStore.nasalProgress.levelScores[level.id] || 0) >= 20;

    return {
      id: level.id,
      title: level.name,
      subtitle: level.description,
      emoji: level.emoji,
      colorClass: isUnlocked 
        ? (isCompleted ? 'bg-green-500/80 backdrop-blur-md text-white border-green-400' : 'bg-orange-500/80 backdrop-blur-md text-white border-orange-400') 
        : 'bg-slate-300/40 backdrop-blur-sm text-slate-500 grayscale opacity-70 border-slate-200',
      to: isUnlocked ? `/nasal/learn/${level.id}` : null,
      isUnlocked,
      isCompleted
    };
  });
});

onMounted(async () => {
  await nasalStore.fetch();
  play("Ayo kita belajar bunyi sengau! Bunyi yang keluar dari hidung, seperti N G dan N Y.");
});
</script>

<template>
  <div class="flex flex-col min-h-[90vh] relative p-4 md:p-8">
    <!-- Main Content -->
    <div class="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full gap-8 md:gap-12 z-10">
      
      <!-- Header -->
      <div class="text-center space-y-4 animate-entrance">
        <div class="inline-flex items-center gap-4 bg-orange-100/60 backdrop-blur-md px-8 py-3 rounded-full border-2 border-white shadow-sm">
          <span class="text-3xl md:text-5xl animate-bounce">👃</span>
          <h1 class="text-4xl md:text-7xl font-black text-orange-600 drop-shadow-sm font-quicksand">
            Bunyi Sengau
          </h1>
        </div>
        <p class="text-xl md:text-3xl font-bold text-slate-500 max-w-2xl mx-auto">
          Mari belajar bunyi spesial <span class="text-orange-500">NG</span> dan <span class="text-orange-500">NY</span>!
        </p>
      </div>

      <!-- Path View -->
      <div class="flex flex-wrap justify-center gap-6 md:gap-10 w-full">
        <div 
          v-for="(item, index) in menuItems" 
          :key="item.id"
          class="relative group"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <NuxtLink 
            :to="item.to!"
            :class="[
              'flex flex-col items-center gap-4 p-8 md:p-12 rounded-[3rem] transition-all duration-500 shadow-2xl border-4 border-white animate-entrance min-w-[280px] md:min-w-[340px]',
              item.colorClass,
              item.isUnlocked ? 'hover:-translate-y-4 hover:shadow-orange-200/50' : 'cursor-not-allowed'
            ]"
          >
            <div class="size-24 md:size-32 bg-white/20 rounded-full flex items-center justify-center text-5xl md:text-7xl shadow-inner">
              {{ item.emoji }}
            </div>
            <div class="text-center">
              <h3 class="text-2xl md:text-4xl font-black mb-2">{{ item.title }}</h3>
              <p class="text-lg font-bold opacity-90">{{ item.subtitle }}</p>
            </div>

            <!-- Status Badges -->
            <div v-if="item.isCompleted" class="absolute -top-4 -right-4 size-12 bg-green-400 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
              <Icon name="lucide:check" class="text-white size-6" />
            </div>
            <div v-if="!item.isUnlocked" class="absolute inset-0 bg-slate-900/10 rounded-[3rem] flex items-center justify-center backdrop-blur-[2px]">
               <Icon name="lucide:lock" class="size-16 text-slate-400 opacity-50" />
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Mascot Guidance -->
      <div class="flex items-center gap-6 bg-white/40 backdrop-blur-lg p-6 md:p-8 rounded-[3rem] shadow-xl border-2 border-white max-w-3xl animate-slide-up mt-8">
        <div class="size-24 md:size-32 shrink-0 bg-teal-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg text-5xl">
          🐦
        </div>
        <div class="space-y-2">
          <p class="text-xl md:text-2xl font-black text-slate-700">Halo Sahabat Abelma!</p>
          <p class="text-lg md:text-xl font-bold text-slate-500">
            Tekan tombol <span class="text-orange-500">MULAI</span> untuk belajar cara menggabungkan bunyi. Sudah siap?
          </p>
        </div>
      </div>
    </div>

    <!-- Decorative Elements -->
    <div class="fixed bottom-0 right-0 p-8 opacity-10 pointer-events-none -z-10 rotate-12">
      <Icon name="lucide:wind" class="size-96 text-orange-400" />
    </div>
    <div class="fixed top-20 left-10 p-8 opacity-10 pointer-events-none -z-10 -rotate-12">
      <Icon name="lucide:waves" class="size-64 text-orange-300" />
    </div>
  </div>
</template>

<style scoped>
.animate-entrance {
  animation: entrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes entrance {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-up {
  animation: slide-up 1s cubic-bezier(0.23, 1, 0.32, 1) both;
}

@keyframes slide-up {
  0% { transform: translateY(50px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
</style>
