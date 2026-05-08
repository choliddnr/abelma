<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
  icon: string;
  colorClass: string;
  to: string;
  index: number;
}>();
</script>

<template>
  <NuxtLink
    :to="to"
    class="relative group flex flex-col items-center justify-center py-2 transition-all duration-500 hover:scale-105"
  >
    <!-- Bubble Container -->
    <div class="relative flex flex-col items-center">
      <!-- Star Badge -->
      <!-- <div 
        class="absolute -top-2 -left-2 z-20 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center drop-shadow-xl transform -rotate-12 transition-transform group-hover:rotate-0"
      >
        <Icon name="lucide:star" class="absolute inset-0 w-full h-full text-orange-400 fill-orange-400 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]" />
        <span class="relative z-10 font-black text-white text-lg md:text-2xl">{{ index + 1 }}</span>
      </div> -->

      <!-- Outer Bubble (Glass) -->
      <div 
        class="relative size-40 md:size-40 lg:size-48 xl:size-52 rounded-full flex flex-col items-center justify-center overflow-hidden border-4 border-white/80 shadow-[inset_0_0_30px_rgba(255,255,255,0.6),0_10px_40px_rgba(0,0,0,0.15)] backdrop-blur-[6px] bg-white/40 group-hover:shadow-[inset_0_0_50px_rgba(255,255,255,0.8),0_20px_60px_rgba(0,0,0,0.2)] transition-all duration-500"
      >
        <!-- Inner Glow -->
        <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 via-transparent to-black/5 pointer-events-none backdrop-blur-sm"></div>
        
        <!-- Icon Circle -->
        <div
          class="size-12 sm:size-12 md:size-16 rounded-full flex items-center justify-center text-3xl md:text-4xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-xl mb-3"
          :class="colorClass"
        >
          <Icon :name="icon" />
        </div>

        <!-- Text Content -->
        <div class="text-center px-6">
          <h2 class="text-sm md:text-[1rem] lg:text-lg xl:text-xl font-black text-slate-800 leading-tight drop-shadow-sm font-quicksand">
            {{ title }}
          </h2>
          <p class="text-[12px] md:text-xs lg:text-sm xl:text-base font-bold text-slate-600 leading-tight mt-1 opacity-90 font-quicksand">
            {{ subtitle }}
          </p>
        </div>

        <!-- Shine Effect -->
        <div class="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] bg-gradient-to-br from-white/30 via-transparent to-transparent rotate-45 pointer-events-none group-hover:animate-shine"></div>
      </div>
      
      <!-- Pearl/Bubble Highlight (Top Left) -->
      <div class="absolute top-[12%] left-[18%] w-[20%] h-[15%] bg-white/70 rounded-full blur-[3px] rotate-[-30deg] pointer-events-none"></div>
      
      <!-- Bottom Glow -->
      <div class="absolute -bottom-4 w-[60%] h-4 bg-black/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500"></div>
    </div>
  </NuxtLink>
</template>

<style scoped>
@keyframes shine {
  0% { transform: translateX(-50%) translateY(-50%) rotate(45deg); }
  100% { transform: translateX(50%) translateY(50%) rotate(45deg); }
}
.animate-shine {
  animation: shine 2s infinite ease-in-out;
}

/* Custom shadow for the star icon */
:deep(.lucide-star) {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}
</style>
