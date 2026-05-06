<script setup lang="ts">
import { letters, idLetterMap, getLetterColor } from "~/constants/alphabet";
import confetti from "canvas-confetti";
import { stopAllAudio } from "~/composables/useAudio";
import type { AudioSequence } from "~/types";
import { useSubscription } from "~/composables/useSubscription";
import ParentGate from "~/components/shared/ParentGate.vue";
// import { ALPHABET_STORYBOOK } from "~/constants/alphabetStorybook";

const emit = defineEmits(["start-quiz"]);

const { isSpeaking: speaking, playLetterSound } = useAudio();
// const { quizDone } = storeToRefs(useStorybookStore());

// --- Dashboard State ---
// const data = ALPHABET_STORYBOOK;
const isUpperCase = ref(true);
const isRandomized = ref(false);
const learningLetters = ref([...letters]);
const feedback = ref("");
const showParentGate = ref(false);
const { isPremium } = useSubscription();

const shuffleLetters = (arrayToShuffle: string[]) => {
  const array = [...arrayToShuffle];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j]!;
    array[j] = temp!;
  }
  return array;
};

const toggleRandomize = () => {
  isRandomized.value = !isRandomized.value;
  learningLetters.value = isRandomized.value ? shuffleLetters([...letters]) : [...letters];
};

// Auto Play Logic
const isAutoPlaying = ref(false);
const autoPlayIndex = ref(0);
const autoPlayTimeout = ref<number | null>(null);

const toggleAutoPlay = () => {
  if (isAutoPlaying.value) stopAutoPlay();
  else startAutoPlay();
};

const startAutoPlay = () => {
  isAutoPlaying.value = true;
  autoPlayIndex.value = 0;
  const firstLetter = learningLetters.value[0];
  if (firstLetter) handleLetterClick(firstLetter);
};

const stopAutoPlay = () => {
  isAutoPlaying.value = false;
  if (autoPlayTimeout.value) {
    clearTimeout(autoPlayTimeout.value);
    autoPlayTimeout.value = null;
  }
};

watch(speaking, (newVal) => {
  if (newVal) {
    if (autoPlayTimeout.value) {
      clearTimeout(autoPlayTimeout.value);
      autoPlayTimeout.value = null;
    }
    return;
  }

  if (isAutoPlaying.value) {
    autoPlayTimeout.value = window.setTimeout(() => {
      autoPlayIndex.value++;
      if (autoPlayIndex.value >= learningLetters.value.length) {
        stopAutoPlay();
      } else {
        const nextLetter = learningLetters.value[autoPlayIndex.value];
        if (nextLetter) handleLetterClick(nextLetter);
      }
    }, 1500);
  }
});

// --- Click Handlers ---
const popConfetti = (e: Event) => {
  const target = e.currentTarget as HTMLElement;
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;
  confetti({
    particleCount: 30,
    spread: 30,
    origin: { x, y },
    colors: ["#FFD93D", "#6BCB77", "#4D96FF", "#ff9a9a", "#A084E8"],
    ticks: 50,
    gravity: 0.8,
    scalar: 0.8,
    zIndex: 100,
  });
};

const lastClickedLetter = ref<string | null>(null);
const lastClickTime = ref<number>(0);
const router = useRouter();

const handleLetterClick = (letter: string, event?: Event) => {
  if (!isPremium.value && letter > "E") {
    // showParentGate.value = true;
    return;
  }

  // Handle Double click here
  const now = Date.now();
  if (lastClickedLetter.value === letter && now - lastClickTime.value < 400) {
    lastClickedLetter.value = null;
    lastClickTime.value = 0;
    router.push(`/alphabet/${letter}`);
    return;
  }

  lastClickedLetter.value = letter;
  lastClickTime.value = now;

  // Fast Learning Mode
  if (event) popConfetti(event);

  const { playSequence } = useAudio();
  const detail = idLetterMap[letter];
  const feedbackText = `${letter} untuk ${detail?.word || ""} ${detail?.emoji || ""}`;

  // Sequential audio: "Ini huruf" -> [Letter] -> [Word]
  const sequence: AudioSequence[] = [
    { key: "Ini huruf" },
    { key: letter },
  ];

  // if (detail?.word) {
  //   sequence.push({ key: detail.word, delay: 200 });
  // }

  // playSequence(sequence, feedbackText);
  playSequence(sequence);

  feedback.value = feedbackText;
  setTimeout(() => {
    feedback.value = "";
  }, 3000);
};

const openLetterPage = (letter: string) => {
  if (!isPremium.value && letter > "E") {
    showParentGate.value = true;
    return;
  }
  navigateTo(`/alphabet/${letter}`);
};

const handleParentGateSuccess = () => {
  showParentGate.value = false;
  navigateTo("/parent/premium");
};


onMounted(()=>{
  // playSequence([{ key: "Ini huruf" }, { key: "A" }]);
})

onUnmounted(() => {
  stopAutoPlay();
  stopAllAudio();
});
</script>

<template>
  <div class="flex flex-col gap-4 animate-entrance" :data-speaking="speaking">
    <!-- Learning Dashboard -->
    <div class="shrink-0 px-4 flex flex-col items-center justify-center min-h-[80px]">
      <div
        class="flex flex-wrap items-center justify-center gap-3 md:gap-4 bg-white/30 backdrop-blur-lg p-3 md:p-4 rounded-4xl border-4 border-slate-50 shadow-xl"
        style="
          box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.05),
            inset 0 2px 4px 0 rgba(255, 255, 255, 0.5);
        "
      >
        <!-- Case Toggle -->
        <UiButton
          @click="isUpperCase = !isUpperCase"
          variant="white"
          icon="lucide:case-sensitive"
          ><span class="text-lg md:text-xl xl:text-2xl hidden md:inline font-black">{{
            isUpperCase ? "abc" : "ABC"
          }}</span></UiButton
        >

        <!-- Randomize -->
        <UiButton @click="toggleRandomize" variant="white" icon="lucide:dices"
          ><span class="text-lg md:text-xl xl:text-2xl hidden md:inline font-black">{{
            isRandomized ? "Normal" : "Acak"
          }}</span></UiButton
        >

        <!-- Auto Play -->
        <UiButton
          @click="toggleAutoPlay"
          variant="white"
          :icon="isAutoPlaying ? 'lucide:square' : 'lucide:play'"
          ><span class="text-lg md:text-xl xl:text-2xl hidden md:inline font-black">{{
            isAutoPlaying ? "Stop" : "Play"
          }}</span></UiButton
        >

        <!-- Start Quiz CTA -->
        <UiButton
          @click="emit('start-quiz')"
          variant="primary"
          icon="lucide:gamepad-2"
          ><span class="text-lg md:text-xl xl:text-2xl hidden md:inline font-black"
            >Mulai Tantangan!</span
          ></UiButton
        >
      </div>
    </div>

    <!-- Instructions / Feedback Area -->
    <!-- <div class="shrink-0 text-center h-14 md:h-16 flex items-center justify-center my-2 px-4">
      <transition name="fade" mode="out-in">
        <div
          v-if="feedback"
          :key="feedback"
          class="text-lg md:text-xl xl:text-2xl 2xl:text-3xl font-black text-slate-600 drop-shadow-sm animate-bounce"
        >
          {{ feedback }}
        </div>
        <h1
          v-else
          class="text-xl md:text-2xl xl:text-3xl 2xl:text-4xl font-black text-slate-600 drop-shadow-sm"
        >
          Klik huruf untuk dengar suara!
        </h1>
      </transition>
    </div> -->

    <!-- Alphabet Grid -->
    <div class="flex-1 px-4 pb-12 w-full max-w-7xl mx-auto overflow-visible relative">
      <div
        class="grid grid-cols-[repeat(auto-fit,minmax(70px,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(90px,1fr))] md:grid-cols-[repeat(auto-fit,minmax(100px,1fr))] xl:grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-3 sm:gap-4 lg:gap-5 w-full place-content-center"
      >
        <BubbleCard
          v-for="(letter, index) in learningLetters"
          :key="letter"
          as="button"
          @click="handleLetterClick(letter, $event)"
          class="group cursor-pointer w-full aspect-square border-none rounded-[20%] sm:rounded-3xl transition-all duration-300 animate-entrance outline-none"
          :class="[
            getLetterColor(letter),
            isAutoPlaying && index === autoPlayIndex
              ? 'scale-110 shadow-2xl ring-4 ring-white z-20'
              : 'hover:-translate-y-2 hover:shadow-xl shadow-md',
          ]"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <div
            class="flex flex-col items-center justify-center gap-0.5 sm:gap-1 w-full h-full relative"
          >
           <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="transform scale-0 rotate-[-45deg] opacity-0"
              enter-to-class="transform scale-100 rotate-0 opacity-100"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-0 opacity-0"
              >
              <div
                :class="lastClickedLetter === letter? 'bottom-0 md:bottom-4 left-2 md:left-5' : 'top-1/2  left-1/2 translate-x-[-50%] translate-y-[-50%]'"
                class="absolute flex items-center justify-center transition-all duration-300 ease-in-out"
                >
                <span
                :class="lastClickedLetter === letter? 'scale-75': ''"
                  class="text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl 2xl:text-8xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.15)] select-none font-quicksand"
                  >{{ isUpperCase ? letter : letter.toLowerCase() }}</span
                >
              </div>
              <!-- <span 
                  class="text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl 2xl:text-8xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.15)] select-none font-quicksand"
                  >{{ isUpperCase ? letter : letter.toLowerCase() }}</span
                > -->
            </Transition> 

            <!-- <span
              class="text-lg sm:text-2xl lg:text-3xl 2xl:text-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block absolute bottom-2 xl:bottom-4"
              >{{ idLetterMap[letter]?.emoji }}</span
            > -->

            <!-- Hint Icon: Magnifying Glass -->
            <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="transform scale-0 rotate-[-45deg] opacity-0"
              enter-to-class="transform scale-100 rotate-0 opacity-100"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-0 opacity-0"
            >
              <div
                v-if="lastClickedLetter === letter"
                @click.stop.prevent="openLetterPage(letter)"
                class="absolute top-1 right-1 sm:top-2 sm:right-2 bg-orange-500 backdrop-blur-md rounded-2xl p-1 sm:p-1.5 shadow-sm border-white border-2 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              >
                <Icon
                  name="lucide:arrow-up-right"
                  class="text-white font-bold text-2xl w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5"
                />
              </div>
            </Transition>

            <!-- Lock Icon for Premium Letters -->
             <div
                v-if="!isPremium && letter > 'E'"
                class="absolute top-1 right-1 sm:top-2 sm:right-2 bg-gray-500/50 backdrop-blur-md rounded-full p-1 sm:p-1.5 shadow-sm border-white border-2 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              >
                <Icon
                  name="lucide:lock-keyhole"
                  class="text-white font-bold bg-gray-500/50 size-2 sm:size-3 md:size-4"
                />
              </div>
            <!-- <div
              v-if="!isPremium && letter > 'E'"
              class="absolute inset-0 bg-white/20 backdrop-blur-[2px] rounded-[inherit] flex items-center justify-center pointer-events-none"
            >
              <div class="bg-gray-900/80 p-2 sm:p-3 rounded-full shadow-lg">
                <Icon name="lucide:lock" class="text-white w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div> -->
          </div>
        </BubbleCard>
      </div>
    </div>
    <ParentGate :isOpen="showParentGate" @success="handleParentGateSuccess" @close="showParentGate = false" />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-entrance {
  animation: entrance 0.5s ease-out forwards;
}

@keyframes entrance {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
