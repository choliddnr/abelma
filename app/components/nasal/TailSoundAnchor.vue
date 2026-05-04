<script setup lang="ts">
import { useAudio } from "~/composables/useAudio";
import BubbleCard from "~/components/BubbleCard.vue";

export type EndingPracticeItem = {
  id: string;
  word: string;
  syllables: string[];
  blank: string;
  answer: string;
  emoji: string;
};

const props = defineProps<{
  item: EndingPracticeItem;
}>();

const emit = defineEmits(["complete", "match"]);

const { playSyllableAudio, playWordAudio, playEffectAudio, play } = useAudio();

const currentItem = computed(() => props.item);
const isMatched = ref(false);

const isDragging = ref(false);
const dragX = ref(0);
const dragY = ref(0);
const startX = ref(0);
const startY = ref(0);
const sourceRef = ref<HTMLElement | null>(null);
const targetRef = ref<HTMLElement | null>(null);

const handleStart = (e: MouseEvent | TouchEvent) => {
  if (isMatched.value) return;
  isDragging.value = true;
  const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX;
  const clientY = 'touches' in e ? e.touches[0]!.clientY : e.clientY;
  startX.value = clientX - dragX.value;
  startY.value = clientY - dragY.value;
  
  playSyllableAudio(currentItem.value!.answer);
};

const handleMove = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value || isMatched.value) return;
  const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX;
  const clientY = 'touches' in e ? e.touches[0]!.clientY : e.clientY;
  dragX.value = clientX - startX.value;
  dragY.value = clientY - startY.value;

  if (sourceRef.value && targetRef.value) {
    const rect1 = sourceRef.value.getBoundingClientRect();
    const rect2 = targetRef.value.getBoundingClientRect();
    
    const distance = Math.sqrt(
      Math.pow(rect1.left - rect2.left, 2) + 
      Math.pow(rect1.top - rect2.top, 2)
    );

    if (distance < 100) {
      match();
    }
  }
};

const handleEnd = () => {
  if (isMatched.value) return;
  isDragging.value = false;
  if (!isMatched.value) {
    dragX.value = 0;
    dragY.value = 0;
  }
};

const match = async () => {
  if (isMatched.value) return;
  isMatched.value = true;
  isDragging.value = false;
  dragX.value = 0;
  dragY.value = 0;

  playEffectAudio("correct");
  
  // Show full word, then play syllables
  await new Promise(resolve => setTimeout(resolve, 800));
  
  for (const s of currentItem.value!.syllables) {
    await playSyllableAudio(s);
  }
  await playWordAudio(currentItem.value.word);

  setTimeout(() => {
    emit("complete");
  }, 1500);
};

onMounted(() => {
  window.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', handleEnd);
  window.addEventListener('touchmove', handleMove);
  window.addEventListener('touchend', handleEnd);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMove);
  window.removeEventListener('mouseup', handleEnd);
  window.removeEventListener('touchmove', handleMove);
  window.removeEventListener('touchend', handleEnd);
});
</script>

<template>
  <div v-if="currentItem" class="w-full max-w-4xl mx-auto flex flex-col items-center gap-12 p-8 min-h-[500px] relative">
    
    <!-- Header -->
    <div class="text-center space-y-4">
      <h3 class="text-3xl md:text-5xl font-black text-orange-600 drop-shadow-sm font-quicksand">Ekor Sengau</h3>
      <p class="text-xl font-bold text-slate-500">Lengkapi katanya!</p>
    </div>

    <!-- Practice Stage -->
    <div class="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 w-full flex-1">
      
      <!-- Source NG Block -->
      <div 
        ref="sourceRef"
        class="z-20 cursor-grab active:cursor-grabbing transition-transform duration-100"
        :class="{ 'opacity-0 scale-50 pointer-events-none': isMatched }"
        :style="{ transform: `translate(${dragX}px, ${dragY}px)` }"
        @mousedown="handleStart"
        @touchstart.prevent="handleStart"
      >
        <BubbleCard class="size-32 md:size-48 bg-orange-500 border-4 border-white shadow-xl rounded-3xl">
          <span class="text-6xl md:text-8xl font-black text-white">{{ currentItem.answer }}</span>
        </BubbleCard>
      </div>

      <!-- Target Word Card -->
      <div 
        ref="targetRef"
        class="relative transition-all duration-500"
        :class="{ 'scale-110': isMatched }"
      >
        <BubbleCard 
          class="min-w-[300px] md:min-w-[500px] h-48 md:h-64 rounded-[3rem] shadow-2xl border-4 border-white flex flex-col items-center justify-center gap-4 transition-colors backdrop-blur-md"
          :class="isMatched ? 'bg-purple-50/80 border-purple-400' : 'bg-white/60 border-slate-100'"
        >
          <div class="flex items-center gap-8">
            <span class="text-6xl md:text-8xl animate-bounce">{{ currentItem.emoji }}</span>
            <div class="flex flex-col items-center">
                <div class="flex items-center font-black text-5xl md:text-7xl tracking-widest uppercase">
                    <span class="text-slate-700">{{ isMatched ? currentItem.word.slice(0, -currentItem.answer.length) : currentItem.blank.replace('_', '') }}</span>
                    <span 
                      class="transition-all duration-500 rounded-2xl px-2"
                      :class="isMatched ? 'text-orange-500 bg-orange-100' : 'text-slate-200 border-2 border-dashed border-slate-200 min-w-[80px] text-center'"
                    >
                      {{ isMatched ? currentItem.answer : '?' }}
                    </span>
                </div>
            </div>
          </div>
          
          <!-- Syllable separation dots (only when matched) -->
          <div v-if="isMatched" class="flex gap-2">
             <span v-for="(s, idx) in currentItem.syllables" :key="idx" class="text-xl font-bold text-purple-300">
                {{ s }}<span v-if="idx < currentItem.syllables.length - 1" class="mx-1">·</span>
             </span>
          </div>
        </BubbleCard>

        <!-- Success Animation -->
        <div v-if="isMatched" class="absolute -right-8 -top-8 size-24 bg-green-500 rounded-full flex items-center justify-center text-white shadow-2xl animate-pop border-4 border-white z-50">
          <Icon name="lucide:check" class="size-16" />
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped>
.animate-pop {
  animation: pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes pop {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}
</style>
