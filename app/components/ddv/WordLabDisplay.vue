<script setup lang="ts">
import { useAudio } from "~/composables/useAudio";

const props = defineProps<{
  word: string;
  syllables: string[];
  highlight: string;
  highlightIndex: number;
  emoji: string;
  show: boolean;
}>();

const { playSyllableAudio } = useAudio();

const activeSyllableIndex = ref<number | null>(null);

const handleListen = async () => {
  if (activeSyllableIndex.value !== null) return;
  
  for (let i = 0; i < props.syllables.length; i++) {
    activeSyllableIndex.value = i;
    const syllable = props.syllables[i];
    if (syllable) {
      await playSyllableAudio(syllable);
    }
  }
  
  activeSyllableIndex.value = null;
};

// Logic to render syllables and highlight the specific one
const renderSyllables = computed(() => {
  const highlightStart = props.word.indexOf(props.highlight);
  const highlightEnd = highlightStart + props.highlight.length;
  
  let currentWordPos = 0;
  
  return props.syllables.map((s) => {
    const start = currentWordPos;
    const end = currentWordPos + s.length;
    currentWordPos += s.length;

    // Check if any part of the highlight falls into this syllable's range in the full word
    if (highlightStart !== -1) {
        // Intersection of [start, end) and [highlightStart, highlightEnd)
        const intersectStart = Math.max(start, highlightStart);
        const intersectEnd = Math.min(end, highlightEnd);
        
        if (intersectStart < intersectEnd) {
            // There is an intersection!
            const localStart = intersectStart - start;
            const localEnd = intersectEnd - start;
            
            const prefix = s.substring(0, localStart);
            const highlightPart = s.substring(localStart, localEnd);
            const suffix = s.substring(localEnd);
            
            return { prefix, highlight: highlightPart, suffix };
        }
    }

    return { prefix: s, highlight: "", suffix: "" };
  });
});
</script>

<template>
  <Transition name="fade-in">
    <div v-if="show" class="flex flex-col items-center gap-4 md:gap-8 py-2 md:py-4 w-full">
      <!-- Illustration -->
      <div
        class="size-32 sm:size-48 md:size-64 bg-white rounded-3xl md:rounded-[3.5rem] shadow-2xl border-4 border-white flex items-center justify-center text-6xl sm:text-8xl md:text-[140px] animate-pop"
      >
        {{ emoji }}
      </div>

      <!-- Word with Highlighting -->
      <div class="flex flex-col items-center gap-4 md:gap-6 animate-slide-up">
        <div
          class="flex items-center gap-1 md:gap-2 px-6 md:px-12 py-3 md:py-6 bg-white/80 backdrop-blur-md rounded-3xl md:rounded-[3rem] border-2 border-white shadow-xl"
        >
          <template v-for="(s, idx) in renderSyllables" :key="idx">
            <div 
              class="flex items-center transition-all duration-300 transform"
              :class="{ 'scale-125 z-10': idx === activeSyllableIndex }"
            >
              <span class="text-3xl sm:text-5xl md:text-8xl font-black text-slate-700">
                {{ s.prefix }}
              </span>
              <span v-if="s.highlight" class="text-3xl sm:text-5xl md:text-8xl font-black text-yellow-500">
                {{ s.highlight }}
              </span>
              <span v-if="s.suffix" class="text-3xl sm:text-5xl md:text-8xl font-black text-slate-700">
                {{ s.suffix }}
              </span>
            </div>
            <!-- Syllable Separator -->
            <span v-if="idx < renderSyllables.length - 1" class="text-2xl sm:text-4xl md:text-6xl font-black text-slate-300 mx-0.5 md:mx-1 transition-opacity duration-300" :class="{ 'opacity-0': idx === activeSyllableIndex || idx + 1 === activeSyllableIndex }">·</span>
          </template>
        </div>

        <UiButton
          @click="handleListen"
          :disabled="activeSyllableIndex !== null"
          :loading="activeSyllableIndex !== null"
          variant="white"
          icon="lucide:volume-2"
          class="px-6 md:px-8 py-2 md:py-4 text-lg md:text-xl h-auto rounded-full"
        >
          <span class="font-black">DENGAR KATA</span>
        </UiButton>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-in-enter-active {
  transition: all 0.6s ease-out;
}
.fade-in-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.animate-pop {
  animation: pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.animate-slide-up {
  animation: slide-up 0.8s cubic-bezier(0.23, 1, 0.32, 1) both;
  animation-delay: 0.2s;
}

@keyframes slide-up {
  0% { transform: translateY(30px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
</style>
