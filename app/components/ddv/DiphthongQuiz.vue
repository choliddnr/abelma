<script setup lang="ts">
import { useAudio } from "~/composables/useAudio";
import BubbleCard from "~/components/BubbleCard.vue";

const props = defineProps<{
  word: string;
  blank: string;
  syllables: string[];
  blankIndex: number;
  answer: string;
  options: string[];
  emoji: string;
}>();

const emit = defineEmits(["correct", "wrong"]);
const { playWordAudio } = useAudio();

const selectedOption = ref<string | null>(null);
const isWrong = ref(false);

const handleOptionClick = (option: string) => {
  selectedOption.value = option;
  playWordAudio(option);

  if (option === props.answer) {
    isWrong.value = false;
    emit("correct");
  } else {
    isWrong.value = true;
    setTimeout(() => {
      isWrong.value = false;
      selectedOption.value = null;
    }, 800);
    emit("wrong");
  }
};
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 md:gap-8 w-full max-w-2xl mx-auto h-full">
    <!-- Question Card -->
    <div class="flex flex-col items-center gap-3 md:gap-6 w-full animate-entrance">
      <!-- Emoji -->
      <div class="text-6xl md:text-9xl transform hover:scale-110 transition-transform cursor-pointer" @click="playWordAudio(word)">
        {{ emoji }}
      </div>

      <!-- Syllable Blocks -->
      <div class="flex flex-nowrap justify-center gap-2 md:gap-4">
        <div
          v-for="(syllable, index) in syllables"
          :key="index"
          class="bg-white border-2 md:border-4 border-slate-100 px-4 md:px-8 py-3 md:py-6 rounded-2xl md:rounded-[2rem] shadow-sm transform transition-all duration-300"
          :class="[
            selectedOption === answer && index === blankIndex ? 'border-emerald-400 bg-emerald-50' : ''
          ]"
        >
          <div class="text-3xl md:text-6xl font-black text-slate-800 tracking-wider uppercase">
            <template v-if="index === blankIndex">
              <span>{{ syllable.replace(answer, "") }}</span>
              <span class="text-teal-500 font-black tracking-[0.2em] ml-1">
                {{ selectedOption === answer ? answer : "__" }}
              </span>
            </template>
            <template v-else>
              {{ syllable }}
            </template>
          </div>
        </div>
      </div>

      <!-- Audio Hint -->
      <UiButton
        variant="white"
        size="sm"
        class="rounded-full px-6 md:px-8 py-2 md:py-3 shadow-sm border-2 border-slate-50 hover:border-teal-200 group"
        @click="playWordAudio(word)"
      >
        <div class="flex items-center gap-2 md:gap-3">
          <div class="bg-teal-500 rounded-full p-1.5 md:p-2 group-hover:scale-110 transition-transform">
            <Icon name="lucide:volume-2" class="size-4 md:size-5 text-white" />
          </div>
          <span class="text-teal-600 font-black uppercase tracking-widest text-xs md:text-sm">Ketuk untuk dengar</span>
        </div>
      </UiButton>
    </div>

    <!-- Options Grid -->
    <div class="grid grid-cols-2 gap-3 md:gap-6 w-full px-4">
      <button
        v-for="option in options"
        :key="option"
        @click="handleOptionClick(option)"
        class="relative group"
        :disabled="selectedOption !== null"
      >
        <BubbleCard
          class="h-20 md:h-28 rounded-2xl md:rounded-3xl flex items-center justify-center transition-all duration-300"
          :class="[
            selectedOption === option && option === answer ? 'bg-emerald-500 border-emerald-600 scale-105 text-white' : 
            selectedOption === option && isWrong ? 'bg-rose-500 border-rose-600 animate-shake text-white' :
            'bg-white hover:bg-teal-50 border-slate-100 hover:border-teal-200 text-slate-700'
          ]"
        >
          <span class="text-3xl md:text-5xl font-black uppercase">{{ option }}</span>
        </BubbleCard>
      </button>
    </div>
  </div>
</template>

<style scoped>
.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

.animate-entrance {
  animation: entrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes entrance {
  0% { opacity: 0; transform: translateY(20px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>
