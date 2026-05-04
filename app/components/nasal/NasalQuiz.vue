<script setup lang="ts">
import { useAudio } from "~/composables/useAudio";
import BubbleCard from "~/components/BubbleCard.vue";
import type { NasalQuizItem } from "~/constants/nasalData";

const props = defineProps<{
  item: NasalQuizItem;
}>();

const emit = defineEmits(["complete"]);

const { playSyllableAudio, playWordAudio, playEffectAudio } = useAudio();

const isMatched = ref(false);
const isWrong = ref(false);
const draggedOption = ref<string | null>(null);

const handleDrop = async (option: string) => {
  if (isMatched.value) return;

  if (option === props.item.answer) {
    isMatched.value = true;
    playEffectAudio("correct");

    // Play word audio
    await new Promise((resolve) => setTimeout(resolve, 500));
    await playWordAudio(props.item.word);

    // Complete and advance
    setTimeout(() => {
      emit("complete");
    }, 1500);
  } else {
    // Wrong feedback
    isWrong.value = true;
    playEffectAudio("wrong");

    setTimeout(() => {
      isWrong.value = false;
    }, 800);
  }
  draggedOption.value = null;
};

const handleDragStart = (option: string) => {
  if (isMatched.value) return;
  draggedOption.value = option;
};

const playHint = () => {
  if (!isMatched.value) {
    playWordAudio(props.item.word);
  }
};

// Touch Support
const activeTouchOption = ref<string | null>(null);

const handleTouchStart = (option: string) => {
  if (isMatched.value) return;
  activeTouchOption.value = option;
};

const handleTouchEnd = (e: TouchEvent) => {
  if (!activeTouchOption.value) return;
  
  const touch = e.changedTouches[0];
  if (!touch) return;
  
  const element = document.elementFromPoint(touch.clientX, touch.clientY);
  const isDropTarget = element?.closest("[data-drop-target]");
  
  if (isDropTarget) {
    handleDrop(activeTouchOption.value);
  }
  
  activeTouchOption.value = null;
};
</script>

<template>
  <div class="w-full max-w-4xl mx-auto flex flex-col items-center gap-10 p-4 min-h-[500px]">
    
    <div class="text-center space-y-4">
      <p class="text-xl font-bold text-slate-500 uppercase tracking-widest">Kuis Sengau</p>
      <h3 class="text-3xl md:text-5xl font-black text-orange-600 drop-shadow-sm font-quicksand">Lengkapi Katanya!</h3>
    </div>

    <!-- Target Word -->
    <div class="flex-1 flex flex-col items-center justify-center w-full">
      <BubbleCard 
        class="min-w-[300px] md:min-w-[500px] h-48 md:h-64 rounded-[3rem] shadow-2xl border-4 border-white flex flex-col items-center justify-center gap-4 transition-colors backdrop-blur-md cursor-pointer"
        :class="[
          isMatched ? 'bg-green-50/80 border-green-400' : 'bg-white/60 border-slate-100',
          isWrong ? 'animate-shake border-rose-400 bg-rose-50/80' : ''
        ]"
        data-drop-target="true"
        @dragover.prevent
        @drop="handleDrop($event.dataTransfer?.getData('option') || draggedOption || '')"
        @click="playHint"
      >
        <div class="flex items-center gap-8 pointer-events-none">
          <span class="text-6xl md:text-8xl animate-bounce-slow">{{ item.emoji }}</span>
          
          <div class="flex items-center font-black text-5xl md:text-7xl tracking-widest uppercase">
            <!-- Format blankWord to replace underscores with a dashed box when not matched -->
            <template v-if="isMatched">
               <span class="text-slate-700">{{ item.word }}</span>
            </template>
            <template v-else>
               <!-- We assume the blankWord has underscores for the missing digraph -->
               <div class="flex items-center gap-2">
                 <template v-for="(char, i) in item.blankWord.split('')" :key="i">
                   <span v-if="char !== '_'" class="text-slate-700">{{ char }}</span>
                   <div v-else-if="i === item.blankWord.indexOf('_')" class="w-20 md:w-28 h-16 md:h-24 mx-2 rounded-2xl border-4 border-dashed border-orange-300 bg-orange-50/50 flex items-center justify-center text-slate-300">
                      ?
                   </div>
                   <!-- We ignore the second underscore if it exists (e.g. for "NG" or "NY") since one box represents the digraph -->
                 </template>
               </div>
            </template>
          </div>
        </div>

        <!-- Syllable hint dots -->
        <div v-if="isMatched" class="flex gap-2">
           <span v-for="(s, idx) in item.syllables" :key="idx" class="text-xl font-bold text-green-600">
              {{ s }}<span v-if="idx < item.syllables.length - 1" class="mx-1">·</span>
           </span>
        </div>
      </BubbleCard>

      <!-- Success Animation -->
      <div v-if="isMatched" class="absolute z-50 size-24 bg-green-500 rounded-full flex items-center justify-center text-white shadow-2xl animate-pop border-4 border-white mt-10">
        <Icon name="lucide:check" class="size-16" />
      </div>
    </div>

    <!-- Options -->
    <div v-if="!isMatched" class="flex items-center justify-center gap-8 w-full">
      <div 
        v-for="opt in item.options" 
        :key="opt"
        class="cursor-grab active:cursor-grabbing transform transition-transform hover:scale-110"
        draggable="true"
        @dragstart="(e) => { e.dataTransfer?.setData('option', opt); handleDragStart(opt); }"
        @touchstart.prevent="handleTouchStart(opt)"
        @touchend="handleTouchEnd"
      >
        <BubbleCard class="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-orange-500 border-4 border-white shadow-xl flex flex-col items-center justify-center transition-all hover:bg-orange-600">
           <span class="text-5xl md:text-6xl font-black text-white drop-shadow-md">{{ opt }}</span>
           <span class="mt-2 opacity-50"><Icon name="lucide:hand" class="size-6 text-white" /></span>
        </BubbleCard>
      </div>
    </div>

  </div>
</template>

<style scoped>
.cursor-grab { cursor: grab; }
.cursor-grabbing { cursor: grabbing; }

.animate-pop {
  animation: pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes pop {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

.animate-bounce-slow {
  animation: bounce-slow 3s infinite;
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>
