<script setup lang="ts">
import { useAudio } from "~/composables/useAudio";
import BubbleCard from "~/components/BubbleCard.vue";

const props = defineProps<{
  word: string;
  syllables: string[];
  blanks: number[];
  answers: string[];
  emoji: string;
}>();

const emit = defineEmits(["correct", "wrong"]);
const { playWordAudio, playEffectAudio } = useAudio();

const vowels = ["A", "I", "U", "E", "O"];
const filledAnswers = ref<string[]>(Array(props.blanks.length).fill(""));
const isCorrect = ref(false);
const wrongBlankIndex = ref<number | null>(null);

const handleDrop = (vowel: string, blankIndex: number) => {
  if (vowel === props.answers[blankIndex]) {
    filledAnswers.value[blankIndex] = vowel;
    playWordAudio(vowel);
    checkAnswers();
  } else {
    // Wrong feedback
    wrongBlankIndex.value = blankIndex;
    playEffectAudio("wrong");
    emit("wrong");
    
    setTimeout(() => {
      wrongBlankIndex.value = null;
    }, 800);
  }
};

const checkAnswers = () => {
  const allFilled = filledAnswers.value.every(v => v !== "");
  if (!allFilled) return;

  const isAllCorrect = filledAnswers.value.every((v, i) => v === props.answers[i]);
  if (isAllCorrect) {
    isCorrect.value = true;
    emit("correct");
  }
};

// Touch Support
const activeVowel = ref<string | null>(null);

const handleTouchStart = (vowel: string) => {
  activeVowel.value = vowel;
};

const handleTouchEnd = (e: TouchEvent) => {
  if (!activeVowel.value) return;
  
  const touch = e.changedTouches[0]!;
  const element = document.elementFromPoint(touch.clientX, touch.clientY);
  const targetId = element?.closest("[data-blank-index]")?.getAttribute("data-blank-index");
  
  if (targetId !== null && targetId !== undefined) {
    handleDrop(activeVowel.value, parseInt(targetId));
  }
  
  activeVowel.value = null;
};
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-6 md:gap-12 w-full max-w-4xl mx-auto h-full px-2 md:p-4">
    <!-- Question Area -->
    <div class="flex flex-col items-center gap-4 md:gap-8">
      <div class="text-6xl md:text-9xl animate-bounce-slow">{{ emoji }}</div>
      
      <!-- Syllable Tiles -->
      <div class="flex flex-nowrap justify-center gap-4">
        <div
          v-for="(syllable, index) in syllables"
          :key="index"
          class="relative"
        >
          <BubbleCard
            class="min-w-24 md:min-w-32 h-24 md:h-32 px-4 md:px-8 flex items-center justify-center cursor-pointer transition-all"
            :class="[isCorrect ? 'bg-emerald-500 border-emerald-600' : 'bg-white border-slate-100']"
            @click="playWordAudio(syllable)"
          >
            <div class="flex items-center text-3xl md:text-6xl font-black text-slate-800">
              <template v-if="blanks.includes(index)">
                <span v-if="syllable.split(/[AIUEO]/)[0]">{{ syllable.split(/[AIUEO]/)[0] }}</span>
                  <div
                    :data-blank-index="blanks.indexOf(index)"
                    class="mx-1 w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl border-2 md:border-4 border-dashed flex items-center justify-center transition-all"
                    :class="[
                      filledAnswers[blanks.indexOf(index)] ? 'bg-teal-500 border-teal-600 scale-110 shadow-lg' : 'bg-slate-50 border-slate-200',
                      wrongBlankIndex === blanks.indexOf(index) ? 'animate-shake bg-rose-100 border-rose-500 text-rose-600' : ''
                    ]"
                  @dragover.prevent
                  @drop="handleDrop($event.dataTransfer?.getData('vowel') || '', blanks.indexOf(index))"
                >
                  <span v-if="filledAnswers[blanks.indexOf(index)]" class="text-white">{{ filledAnswers[blanks.indexOf(index)] }}</span>
                </div>
                <span v-if="syllable.split(/[AIUEO]/)[1]">{{ syllable.split(/[AIUEO]/)[1] }}</span>
              </template>
              <template v-else>
                <span>{{ syllable }}</span>
              </template>
            </div>
          </BubbleCard>
        </div>
      </div>
      
      <p class="text-slate-500 font-bold uppercase tracking-widest text-xs md:text-base flex items-center gap-2">
        <Icon name="lucide:hand" class="size-4 md:size-5" />
        Lengkapi kata di atas!
      </p>
    </div>

    <!-- Vowel Palette -->
    <div class="bg-slate-100/50 backdrop-blur-md p-4 md:p-8 rounded-2xl md:rounded-[3rem] border-2 md:border-4 border-white shadow-inner flex flex-wrap justify-center gap-2 md:gap-4">
      <div
        v-for="vowel in vowels"
        :key="vowel"
        class="cursor-grab active:cursor-grabbing transform transition-transform hover:scale-110"
        draggable="true"
        @dragstart="$event.dataTransfer?.setData('vowel', vowel)"
        @touchstart="handleTouchStart(vowel)"
        @touchend="handleTouchEnd"
      >
        <BubbleCard class="size-14 md:size-24 rounded-xl md:rounded-2xl flex items-center justify-center bg-white border-white shadow-lg hover:shadow-xl">
          <span class="text-2xl md:text-4xl font-black text-teal-600">{{ vowel }}</span>
        </BubbleCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-bounce-slow {
  animation: bounce 3s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(-5%); }
  50% { transform: translateY(0); }
}

.cursor-grab { cursor: grab; }
.cursor-grabbing { cursor: grabbing; }

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
