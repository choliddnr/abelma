<script setup lang="ts">
import { useAudio } from "~/composables/useAudio";
import BubbleCard from "~/components/BubbleCard.vue";
import type { DdvConnectPair } from "~/constants/ddvData";

const props = defineProps<{
  pairs: DdvConnectPair[];
}>();

const emit = defineEmits(["complete", "match"]);

const { playSyllableAudio, playWordAudio, playEffectAudio } = useAudio();

// Game State
const currentPairIndex = ref(0);
const isCurrentMatched = ref(false);
const activeSyllableIndex = ref<number | null>(null);
const draggedId = ref<string | null>(null);

const currentPair = computed(() => props.pairs[currentPairIndex.value]);

// Syllable highlighting logic (similar to WordLabDisplay)
const renderSyllables = computed(() => {
  if (!currentPair.value) return [];
  const word = currentPair.value.word;
  const highlight = currentPair.value.vokalRangkap;
  const highlightStart = word.indexOf(highlight);
  const highlightEnd = highlightStart + highlight.length;
  
  let currentWordPos = 0;
  
  return currentPair.value.syllables.map((s) => {
    const start = currentWordPos;
    const end = currentWordPos + s.length;
    currentWordPos += s.length;

    if (highlightStart !== -1) {
        const intersectStart = Math.max(start, highlightStart);
        const intersectEnd = Math.min(end, highlightEnd);
        
        if (intersectStart < intersectEnd) {
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

const handleLeftClick = () => {
  if (!currentPair.value || isCurrentMatched.value) return;
  playSyllableAudio(currentPair.value.vokalRangkap);
};

const handleRightClick = () => {
  if (!currentPair.value || isCurrentMatched.value) return;
  playWordAudio(currentPair.value.word);
};

const handleDrop = async (targetId: string) => {
  if (!draggedId.value || isCurrentMatched.value) return;

  if (draggedId.value === targetId) {
    isCurrentMatched.value = true;
    playEffectAudio("correct");
    emit("match");

    // Sequential Syllable Audio
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    for (let i = 0; i < currentPair.value!.syllables.length; i++) {
        activeSyllableIndex.value = i;
        await playSyllableAudio(currentPair.value!.syllables[i]);
    }
    
    activeSyllableIndex.value = null;
    
    // Auto advance
    setTimeout(() => {
        nextPair();
    }, 500);
  } else {
    playEffectAudio("wrong");
  }
  draggedId.value = null;
};

const nextPair = () => {
  if (currentPairIndex.value < props.pairs.length - 1) {
    currentPairIndex.value++;
    isCurrentMatched.value = false;
  } else {
    emit("complete");
  }
};

const handleDragStart = (id: string) => {
  draggedId.value = id;
};

// Touch Support
const touchStartX = ref(0);
const touchStartY = ref(0);
const activeTouchId = ref<string | null>(null);

const handleTouchStart = (e: TouchEvent, id: string) => {
  if (isCurrentMatched.value) return;
  activeTouchId.value = id;
  const touch = e.touches[0]!;
  touchStartX.value = touch.clientX;
  touchStartY.value = touch.clientY;
};

const handleTouchEnd = (e: TouchEvent) => {
  if (!activeTouchId.value) return;
  
  const touch = e.changedTouches[0]!;
  const element = document.elementFromPoint(touch.clientX, touch.clientY);
  const targetId = element?.closest("[data-drop-id]")?.getAttribute("data-drop-id");
  
  if (targetId) {
    handleDrop(targetId);
  }
  
  activeTouchId.value = null;
};
</script>

<template>
  <div v-if="currentPair" class="w-full max-w-4xl mx-auto flex flex-col items-center gap-12 p-4">
    <div class="text-center space-y-2">
      <h3 class="text-2xl md:text-3xl font-black text-teal-700 uppercase tracking-widest">Sambung Vokal</h3>
      <div class="flex items-center justify-center gap-2">
        <span class="px-6 py-2 bg-teal-100 text-teal-700 rounded-full text-lg font-black uppercase shadow-sm">
          {{ currentPairIndex + 1 }} / {{ pairs.length }}
        </span>
      </div>
      <p class="text-slate-500 font-bold text-lg">Tarik vokal ke dalam kata!</p>
    </div>

    <div class="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 w-full min-h-[300px]">
      <!-- Left: Vokal Source -->
      <div
        class="relative group cursor-pointer"
        :class="{ 'opacity-50 pointer-events-none scale-90': isCurrentMatched }"
        draggable="true"
        @dragstart="handleDragStart(currentPair.id)"
        @touchstart="handleTouchStart($event, currentPair.id)"
        @touchend="handleTouchEnd"
        @click="handleLeftClick"
      >
        <BubbleCard
          class="size-32 md:size-48 rounded-[2rem] md:rounded-[3rem] shadow-2xl border-4 border-white bg-teal-500 transition-all hover:scale-105 active:scale-95"
        >
          <span class="text-5xl md:text-7xl font-black text-white">{{ currentPair.vokalRangkap }}</span>
        </BubbleCard>
        
        <!-- Drag Hint -->
        <div v-if="!isCurrentMatched" class="absolute -bottom-8 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center">
            <Icon name="lucide:mouse-pointer-2" class="text-teal-400 size-6 rotate-180" />
        </div>
      </div>

      <!-- Connector Icon -->
      <div class="hidden md:flex items-center justify-center">
        <Icon name="lucide:arrow-right" class="size-12 text-teal-200 animate-pulse" />
      </div>

      <!-- Right: Target Word -->
      <div
        class="relative cursor-pointer"
        :data-drop-id="currentPair.id"
        @dragover.prevent
        @drop="handleDrop(currentPair.id)"
        @click="handleRightClick"
      >
        <BubbleCard
          class="min-w-[280px] md:min-w-[400px] h-32 md:h-48 rounded-[2rem] md:rounded-[3rem] shadow-2xl border-4 border-white transition-all flex flex-col items-center justify-center gap-2"
          :class="[
            isCurrentMatched ? 'bg-teal-50 border-teal-400 scale-105' : 'bg-white border-slate-100 hover:border-teal-200'
          ]"
        >
          <div class="flex items-center gap-4">
            <span class="text-4xl md:text-6xl">{{ currentPair.emoji }}</span>
            <div class="flex items-center font-black text-4xl md:text-6xl">
              <template v-for="(s, idx) in renderSyllables" :key="idx">
                <div 
                  class="flex items-center transition-all duration-300 transform"
                  :class="{ 'scale-125 z-10': idx === activeSyllableIndex }"
                >
                  <span class="text-slate-700">{{ s.prefix }}</span>
                  <span class="text-orange-500">{{ s.highlight }}</span>
                  <span class="text-slate-700">{{ s.suffix }}</span>
                </div>
                <!-- Syllable Separator -->
                <span v-if="idx < renderSyllables.length - 1" class="text-slate-300 mx-1 md:mx-2 transition-opacity duration-300" :class="{ 'opacity-0': idx === activeSyllableIndex || idx + 1 === activeSyllableIndex }">·</span>
              </template>
            </div>
          </div>
        </BubbleCard>
        
        <!-- Success Check -->
        <div v-if="isCurrentMatched" class="absolute -right-6 -top-6 size-16 bg-teal-500 rounded-full flex items-center justify-center text-white shadow-2xl animate-pop border-4 border-white">
          <Icon name="lucide:check" class="size-10" />
        </div>
      </div>
    </div>

    <!-- Empty Spacer for auto-advance -->
    <div class="h-24"></div>
  </div>
</template>

<style scoped>
.cursor-grab { cursor: grab; }
.cursor-grabbing { cursor: grabbing; }

.animate-pop {
  animation: pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes pop {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}
</style>
