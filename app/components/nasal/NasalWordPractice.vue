<script setup lang="ts">
import { useAudio } from "~/composables/useAudio";
import BubbleCard from "~/components/BubbleCard.vue";

const props = defineProps<{
  word: string;
  syllables: string[];
  nasalIndices: number[]; // Indices of syllables that contain the nasal digraph
  emoji: string;
}>();

const { playSyllableAudio, playWordAudio } = useAudio();
const activeSyllableIndex = ref<number | null>(null);

const handlePlayFull = async () => {
  if (activeSyllableIndex.value !== null) return;
  
  for (let i = 0; i < props.syllables.length; i++) {
    activeSyllableIndex.value = i;
    await playSyllableAudio(props.syllables[i]);
  }
  activeSyllableIndex.value = null;
  await playWordAudio(props.word);
};

const handleSyllableClick = (idx: number) => {
  activeSyllableIndex.value = idx;
  playSyllableAudio(props.syllables[idx]).finally(() => {
    activeSyllableIndex.value = null;
  });
};
</script>

<template>
  <div class="w-full max-w-4xl mx-auto flex flex-col items-center gap-12 p-8 min-h-[500px]">
    
    <!-- Illustration -->
    <div
      class="size-48 md:size-64 bg-white/60 backdrop-blur-md rounded-[3rem] md:rounded-[4rem] shadow-2xl border-4 border-white flex items-center justify-center text-8xl md:text-[140px] animate-pop relative"
    >
      {{ emoji }}
      <div class="absolute -bottom-4 -right-4 size-16 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white">
        <Icon name="lucide:search" class="size-8" />
      </div>
    </div>

    <!-- Word Display -->
    <div class="flex flex-col items-center gap-8 w-full animate-entrance">
      <div class="flex flex-wrap justify-center items-center gap-3 md:gap-6">
        <template v-for="(s, idx) in syllables" :key="idx">
          <button
            class="relative px-6 py-4 md:px-10 md:py-8 rounded-[2rem] md:rounded-[3rem] font-black text-4xl md:text-7xl transition-all shadow-xl border-b-[12px] active:border-b-0 active:translate-y-2 group"
            :class="[
              activeSyllableIndex === idx 
                ? 'scale-110 z-10' 
                : 'hover:scale-105',
              nasalIndices.includes(idx)
                ? 'bg-orange-100/80 backdrop-blur-md text-orange-600 border-orange-400 border-x-2 border-t-2'
                : 'bg-white/60 backdrop-blur-md text-slate-700 border-slate-200'
            ]"
            @click="handleSyllableClick(idx)"
          >
            {{ s }}
            <!-- Nasal Highlight Glow -->
            <div v-if="nasalIndices.includes(idx)" class="absolute inset-0 rounded-[inherit] bg-orange-400/10 animate-pulse group-hover:bg-orange-400/20"></div>
          </button>
          
          <!-- Separator -->
          <span v-if="idx < syllables.length - 1" class="text-4xl md:text-6xl text-slate-200 font-black">•</span>
        </template>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-4">
        <button
          class="flex items-center gap-3 px-8 py-4 bg-teal-500 text-white rounded-full font-black text-xl md:text-2xl shadow-xl hover:bg-teal-600 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
          :disabled="activeSyllableIndex !== null"
          @click="handlePlayFull"
        >
          <Icon name="lucide:volume-2" class="size-8" />
          DENGAR KATA
        </button>
      </div>
    </div>

    <!-- Educational Context Hint -->
    <div class="mt-8 p-6 bg-orange-50 rounded-3xl border-2 border-orange-100 max-w-2xl text-center">
      <p class="text-orange-700 font-bold text-lg">
        Huruf yang berwarna <span class="bg-orange-200 px-2 rounded">orange</span> adalah bunyi <span class="underline">sengau</span>. Bunyinya seperti keluar dari hidung! 👃
      </p>
    </div>

  </div>
</template>

<style scoped>
.animate-pop {
  animation: pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes pop {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.animate-entrance {
  animation: entrance 0.8s cubic-bezier(0.23, 1, 0.32, 1) both;
}

@keyframes entrance {
  0% { transform: translateY(30px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
</style>
