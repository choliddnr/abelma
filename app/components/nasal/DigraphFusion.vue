<script setup lang="ts">
import { useAudio } from "~/composables/useAudio";
import BubbleCard from "~/components/BubbleCard.vue";

const props = defineProps<{
  letter1: string;
  letter2: string;
  fused: string;
  syllables: string[];
  emoji: string;
}>();

const emit = defineEmits(["fused"]);

const { playSyllableAudio, playEffectAudio, play } = useAudio();

const isFused = ref(false);
const isDragging = ref(false);
const dragX = ref(0);
const dragY = ref(0);
const startX = ref(0);
const startY = ref(0);
const containerRef = ref<HTMLElement | null>(null);
const letter1Ref = ref<HTMLElement | null>(null);
const letter2Ref = ref<HTMLElement | null>(null);

const handleStart = (e: MouseEvent | TouchEvent) => {
  if (isFused.value) return;
  isDragging.value = true;
  const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX;
  const clientY = 'touches' in e ? e.touches[0]!.clientY : e.clientY;
  startX.value = clientX - dragX.value;
  startY.value = clientY - dragY.value;
  
  playSyllableAudio(props.letter1);
};

const handleMove = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value || isFused.value) return;
  const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX;
  const clientY = 'touches' in e ? e.touches[0]!.clientY : e.clientY;
  dragX.value = clientX - startX.value;
  dragY.value = clientY - startY.value;

  // Check collision
  if (letter1Ref.value && letter2Ref.value) {
    const rect1 = letter1Ref.value.getBoundingClientRect();
    const rect2 = letter2Ref.value.getBoundingClientRect();
    
    const distance = Math.sqrt(
      Math.pow(rect1.left - rect2.left, 2) + 
      Math.pow(rect1.top - rect2.top, 2)
    );

    if (distance < 100) {
      fuse();
    }
  }
};

const handleEnd = () => {
  if (isFused.value) return;
  isDragging.value = false;
  // Snap back if not fused
  if (!isFused.value) {
    dragX.value = 0;
    dragY.value = 0;
  }
};

const fuse = async () => {
  if (isFused.value) return;
  isFused.value = true;
  isDragging.value = false;
  dragX.value = 0;
  dragY.value = 0;

  playEffectAudio("correct");
  
  // Humming sound then fused sound
  await play("NG! hummmm"); // Fallback to TTS if audio missing
  await playSyllableAudio(props.fused);
  
  emit("fused");
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

const currentSyllableIndex = ref(-1);
const playSyllables = async () => {
  for (let i = 0; i < props.syllables.length; i++) {
    currentSyllableIndex.value = i;
    await playSyllableAudio(props.syllables[i]!);
  }
  currentSyllableIndex.value = -1;
};
</script>

<template>
  <div ref="containerRef" class="w-full max-w-4xl mx-auto flex flex-col items-center gap-12 p-8 min-h-[500px] relative overflow-hidden">
    <!-- Header -->
    <div class="text-center space-y-4 z-10">
      <h2 class="text-4xl md:text-6xl font-black text-orange-600 drop-shadow-sm font-quicksand">
        {{ isFused ? 'Bunyi Baru!' : 'Gabungkan Huruf' }}
      </h2>
      <p class="text-xl md:text-2xl font-bold text-slate-500">
        {{ isFused ? 'Kamu hebat! N dan ' + (props.letter2) + ' jadi ' + props.fused : 'Tarik ' + props.letter1 + ' ke arah ' + props.letter2 }}
      </p>
    </div>

    <!-- Fusion Stage -->
    <div class="relative flex flex-col md:flex-row items-center justify-center gap-16 md:gap-32 w-full flex-1">
      
      <!-- Fused State Background Ripple -->
      <div v-if="isFused" class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="size-64 md:size-96 bg-orange-400/20 rounded-full animate-ping-slow"></div>
        <div class="absolute size-48 md:size-80 bg-orange-300/30 rounded-full animate-pulse"></div>
      </div>

      <!-- Letter 1 (Draggable) -->
      <div 
        v-if="!isFused"
        ref="letter1Ref"
        class="z-20 cursor-grab active:cursor-grabbing transition-transform duration-100"
        :style="{ transform: `translate(${dragX}px, ${dragY}px)` }"
        @mousedown="handleStart"
        @touchstart.prevent="handleStart"
      >
        <BubbleCard class="size-32 md:size-48 bg-white/60 backdrop-blur-md border-4 border-slate-200 shadow-xl rounded-3xl">
          <span class="text-6xl md:text-8xl font-black text-slate-700">{{ props.letter1 }}</span>
        </BubbleCard>
      </div>

      <!-- Letter 2 (Target) -->
      <div 
        v-if="!isFused"
        ref="letter2Ref"
        class="z-10"
      >
        <BubbleCard class="size-32 md:size-48 bg-white/60 backdrop-blur-md border-4 border-slate-200 shadow-xl rounded-3xl">
          <span class="text-6xl md:text-8xl font-black text-slate-700">{{ props.letter2 }}</span>
        </BubbleCard>
      </div>

      <!-- Fused Card -->
      <Transition name="scale">
        <div v-if="isFused" class="z-30 flex flex-col items-center gap-8">
          <BubbleCard 
            class="size-48 md:size-64 bg-orange-500 border-4 border-white shadow-2xl rounded-[3rem] animate-float"
            @click="playSyllableAudio(props.fused)"
          >
            <span class="text-7xl md:text-9xl font-black text-white drop-shadow-lg">{{ props.fused }}</span>
            <!-- Nasal Icon/Nose hint -->
            <div class="absolute -top-4 -right-4 size-16 bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <span class="text-3xl">👃</span>
            </div>
          </BubbleCard>

          <!-- Syllables Grid -->
          <div class="grid grid-cols-5 gap-3 md:gap-6 animate-entrance">
            <button
              v-for="(s, idx) in props.syllables"
              :key="s"
              class="px-4 py-3 md:px-8 md:py-4 rounded-2xl md:rounded-3xl font-black text-xl md:text-3xl transition-all shadow-lg border-b-8 border-orange-700 active:border-b-0 active:translate-y-2"
              :class="[
                currentSyllableIndex === idx 
                  ? 'bg-orange-600 text-white border-orange-800 scale-110' 
                  : 'bg-orange-400 text-white hover:bg-orange-500'
              ]"
              @click="playSyllableAudio(s)"
            >
              {{ s }}
            </button>
          </div>

          <button 
            class="mt-4 px-10 py-4 bg-teal-500 text-white rounded-full font-black text-2xl shadow-xl hover:bg-teal-600 transition-colors"
            @click="playSyllables"
          >
            Dengar Semua
          </button>
        </div>
      </Transition>

      <!-- Arrow Hint -->
      <div v-if="!isFused" class="hidden md:block absolute left-1/2 -translate-x-1/2 opacity-20">
        <Icon name="lucide:arrow-right" class="size-24 text-slate-400 animate-pulse" />
      </div>
    </div>

    <!-- Mascot Zone -->
    <!-- <div class="absolute bottom-8 right-8 z-50">
      <div class="relative group">
        <div class="absolute -top-24 -left-32 w-48 bg-white p-4 rounded-3xl shadow-xl border-2 border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <p class="text-slate-600 font-bold text-sm">
            {{ isFused ? 'Hebat! Ini bunyi sengau!' : 'Tarik hurufnya sampai menempel ya!' }}
          </p>
          <div class="absolute bottom-0 right-4 translate-y-full w-4 h-4 bg-white rotate-45 border-r-2 border-b-2 border-slate-100"></div>
        </div>
        <div class="size-24 md:size-32 bg-teal-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
           
           <span class="text-5xl">🐦</span>
        </div>
      </div>
    </div> -->
  </div>
</template>

<style scoped>
.animate-ping-slow {
  animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.scale-enter-active {
  animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scale-in {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.animate-entrance {
  animation: entrance 0.8s ease-out forwards;
}

@keyframes entrance {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
