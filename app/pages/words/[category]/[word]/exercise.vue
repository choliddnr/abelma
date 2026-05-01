<script setup lang="ts">
import { wordCategories, type Word } from "~/constants/words";
import confetti from "canvas-confetti";
import { stopAllAudio } from "~/composables/useAudio";

const route = useRoute();
const router = useRouter();
const settingsStore = useSettingsStore();
const analyticsStore = useAnalyticsStore();
const rewardStore = useRewardStore();
const { activeProfileId } = storeToRefs(useProfileStore());
const { changeCoins } = useProfileStore();

const categoryId = route.params.category as string;
const wordId = route.params.word as string;

const wordData = computed<Word | null>(() => {
  const category = wordCategories.find((c) => c.id === categoryId);
  if (!category) return null;
  return category.words.find((w) => w.id === wordId) || null;
});

const goBack = () => router.push(`/words/${categoryId}/${wordId}`);

const targetWord = computed(() => wordData.value?.word || "");
const expectedLetters = computed(() => targetWord.value.split(""));

// State
const isComplete = ref(false);
const placedLetters = ref<(string | null)[]>([]);
const availableLetters = ref<{ id: string; letter: string; isDragging?: boolean }[]>([]);
const wrongDropIndex = ref<number | null>(null);
const autoPlayTimeout = ref<number | null>(null);
const touchPosition = ref({ x: 0, y: 0 });
const isTouching = ref(false);

const initializeGame = () => {
  if (!targetWord.value) return;
  isComplete.value = false;
  placedLetters.value = Array.from({ length: targetWord.value.length }, () => null);

  // Generate available letters (target + some noise)
  const letters = targetWord.value.split("").map((l, i) => ({ id: `target-${i}-${l}`, letter: l }));

  // Fix T2: Use Set to safely filter noise letters without unsafe regex
  const wordLetterSet = new Set(targetWord.value.toUpperCase().split(""));
  const noisePool = "ABCDEFGHJKLMNOPQRSTUVWXYZ".split("").filter((l) => !wordLetterSet.has(l));
  for (let i = noisePool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [noisePool[i], noisePool[j]] = [noisePool[j]!, noisePool[i]!];
  }
  const noise = noisePool.slice(0, 3).map((l, i) => ({
    id: `noise-${i}-${l}`,
    letter: l,
  }));

  const allLetters = [...letters, ...noise];
  // Shuffle all letters
  for (let i = allLetters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allLetters[i], allLetters[j]] = [allLetters[j]!, allLetters[i]!];
  }

  availableLetters.value = allLetters;
};

const playTargetWord = () => {
  if (!targetWord.value || !wordData.value) return;
  playWordAudio(targetWord.value, `/audio/words/${wordData.value.id}.mp3`);
};

onMounted(() => {
  if (!wordData.value) {
    router.replace("/words"); // handle invalid route
  } else {
    initializeGame();
    setTimeout(playTargetWord, 500);
  }
});

onUnmounted(() => {
  stopAllAudio();
  if (autoPlayTimeout.value) clearTimeout(autoPlayTimeout.value);
});

const checkCompletion = () => {
  const currentWord = placedLetters.value.join("");
  if (currentWord === targetWord.value) {
    changeCoins(5);
    isComplete.value = true;
    playTargetWord();
    popConfetti();
  }
};

const popConfetti = () => {
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 7,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#FFD93D", "#6BCB77", "#4D96FF", "#ff9a9a", "#A084E8"],
      zIndex: 100,
    });
    confetti({
      particleCount: 7,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#FFD93D", "#6BCB77", "#4D96FF", "#ff9a9a", "#A084E8"],
      zIndex: 100,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
};

// Drag and Drop Logic
const draggedItemIndex = ref<number | null>(null);
const hoveredSlotIndex = ref<number | null>(null);

const onDragStart = (e: DragEvent, index: number) => {
  if (isComplete.value) return;
  draggedItemIndex.value = index;
  const letterObj = availableLetters.value[index];
  if (letterObj) {
    letterObj.isDragging = true;
  }

  // Set data payload (required by Firefox)
  e.dataTransfer?.setData("text/plain", index.toString());
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = "move";
  }
};

const onDragEnd = (index: number) => {
  draggedItemIndex.value = null;
  hoveredSlotIndex.value = null;
  if (availableLetters.value[index]) {
    availableLetters.value[index].isDragging = false;
  }
};

const onDragEnter = (index: number) => {
  if (isComplete.value || placedLetters.value[index] !== null) return;
  hoveredSlotIndex.value = index;
};

const onDragLeave = (index: number) => {
  if (hoveredSlotIndex.value === index) {
    hoveredSlotIndex.value = null;
  }
};

// Fix T4: Extract core drop logic so touch and drag can share it
const dropAtSlot = (slotIndex: number) => {
  hoveredSlotIndex.value = null;
  if (isComplete.value || draggedItemIndex.value === null) return;

  if (placedLetters.value[slotIndex] !== null) {
    putBackLetter(slotIndex);
  }

  const sourceIndex = draggedItemIndex.value;
  const letterObj = availableLetters.value[sourceIndex]!;
  const correctLetter = expectedLetters.value[slotIndex];

  if (letterObj.letter === correctLetter) {
    placedLetters.value[slotIndex] = letterObj.letter;
    availableLetters.value.splice(sourceIndex, 1);
    draggedItemIndex.value = null;
    checkCompletion();
  } else {
    if (wordData.value && activeProfileId.value) {
      analyticsStore.recordMistake(activeProfileId.value, "word", wordData.value.id);
    }
    wrongDropIndex.value = slotIndex;
    setTimeout(() => {
      wrongDropIndex.value = null;
    }, 500);
    playEffectAudio("wrong");
    draggedItemIndex.value = null;
  }
};

const onDrop = (e: DragEvent, slotIndex: number) => {
  dropAtSlot(slotIndex);
};

// Function to handle moving placed letter back to pool
const putBackLetter = (slotIndex: number) => {
  if (isComplete.value) return;
  const letter = placedLetters.value[slotIndex];
  if (letter) {
    availableLetters.value.push({ id: `returned-${Date.now()}`, letter });
    placedLetters.value[slotIndex] = null;
  }
};

// Fix T4: Touch drag support for mobile
const onTouchStart = (e: TouchEvent, index: number) => {
  if (isComplete.value) return;
  draggedItemIndex.value = index;
  const letterObj = availableLetters.value[index];
  if (letterObj) letterObj.isDragging = true;

  isTouching.value = true;
  const touch = e.touches[0];
  if (touch) {
    touchPosition.value = { x: touch.clientX, y: touch.clientY };
  }
};

const onTouchMove = (e: TouchEvent) => {
  const touch = e.touches[0];
  if (!touch) return;

  touchPosition.value = { x: touch.clientX, y: touch.clientY };

  const el = document.elementFromPoint(touch.clientX, touch.clientY);
  const slotEl = el?.closest("[data-slot-index]");
  hoveredSlotIndex.value = slotEl ? parseInt(slotEl.getAttribute("data-slot-index")!) : null;
};

const onTouchEnd = (e: TouchEvent) => {
  const savedLetterObj =
    draggedItemIndex.value !== null ? availableLetters.value[draggedItemIndex.value] : null;

  const touch = e.changedTouches[0];
  if (touch) {
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const slotEl = el?.closest("[data-slot-index]");
    if (slotEl) {
      dropAtSlot(parseInt(slotEl.getAttribute("data-slot-index")!));
    }
  }

  if (savedLetterObj) savedLetterObj.isDragging = false;
  if (draggedItemIndex.value !== null) draggedItemIndex.value = null;
  hoveredSlotIndex.value = null;
  isTouching.value = false;
};
</script>

<template>
  <div v-if="wordData" class="flex flex-col min-h-screen overflow-hidden relative">
    <!-- Celebration Modal -->
    <UiCelebrationModal
      v-model="isComplete"
      title="HEBAT!"
      message="Kamu berhasil menyusun kata!"
      :reward-amount="5"
      :main-emoji="wordData.emoji"
      footer-text="Klik di mana saja untuk lanjut"
      @update:model-value="(val) => !val && goBack()"
    />

    <!-- Main Game Area -->
    <div
      class=" flex-1 flex flex-col items-center justify-center gap-2 md:gap-4 max-w-6xl mx-auto w-full p-2 overflow-hidden pt-2"
    >
      <!-- Top Section: Image & Full Word (Animated) -->
      <div
        class="flex flex-col items-center gap-4 w-full relative animate-entrance"
        style="animation-delay: 0.2s"
      >
        <!-- Giant Emoji -->
        <UiButton
          @click="playTargetWord"
          variant="none"
          class="relative w-40 h-40 md:w-48 md:h-48 2xl:w-64 2xl:h-64 rounded-[2.5rem] md:rounded-[3rem] bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border-4 border-white flex items-center justify-center transition-all active:scale-95 group hover:scale-105"
        >
          <span
            class="text-7xl md:text-8xl xl:text-[140px] drop-shadow-xl select-none group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500"
          >
            {{ wordData.emoji }}
          </span>
          <div
            class="absolute -bottom-4 -right-4 w-12 h-12 md:w-16 md:h-16 bg-white rounded-full shadow-lg border-4 border-indigo-50 flex items-center justify-center text-2xl md:text-3xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
          >
            <Icon name="lucide:volume-2" />
          </div>
        </UiButton>
      </div>
      <!-- Target Slots -->
      <div class="flex flex-wrap justify-center gap-2 md:gap-4 xl:gap-6 w-full">
        <div
          v-for="(slot, index) in placedLetters"
          :key="`slot-${index}`"
          :data-slot-index="index"
          @click="placedLetters[index] !== null ? putBackLetter(index) : undefined"
          @dragover.prevent
          @dragenter.prevent="onDragEnter(index)"
          @dragleave.prevent="onDragLeave(index)"
          @drop.prevent="onDrop($event, index)"
          class="relative w-16 h-20 md:w-24 md:h-32 2xl:w-32 2xl:h-40 rounded-xl md:rounded-3xl border-2 md:border-4 xl:border-8 flex items-center justify-center transition-all duration-300"
          :class="[
            placedLetters[index] !== null
              ? 'bg-emerald-400 border-white shadow-[0_10px_20px_rgba(52,211,153,0.4)] scale-105 cursor-pointer'
              : 'bg-slate-100 border-dashed border-slate-300 shadow-inner',
            wrongDropIndex === index ? 'shake-animation bg-rose-400 border-rose-500' : '',
            hoveredSlotIndex === index && placedLetters[index] === null
              ? 'ring-4 md:ring-8 ring-indigo-400 bg-indigo-50 border-indigo-400 scale-110 shadow-[inset_0_0_20px_rgba(99,102,241,0.6)]'
              : '',
          ]"
        >
          <span
            v-if="placedLetters[index] !== null"
            class="text-4xl md:text-6xl xl:text-[5rem] font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.15)] leading-none font-quicksand"
            :class="{ 'pop-animation': true }"
          >
            {{
              settingsStore.settings.letterCase === "uppercase"
                ? placedLetters[index]?.toUpperCase()
                : placedLetters[index]?.toLowerCase()
            }}
          </span>
        </div>
      </div>

      <!-- Draggable Items (Available Letters) -->
      <div class="w-full">
        <!-- Instruction -->

        <div
          class="flex flex-col justify-center gap-2 md:gap-4 w-full p-3 md:p-4 2xl:p-8 bg-white/50 backdrop-blur-md rounded-[2.5rem] md:rounded-[3rem] border-t-4 border-white shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.1)] min-h-[120px] md:min-h-[140px] xl:min-h-[160px]"
        >
          <p
            class="text-center text-slate-500 font-bold mb-2 md:mb-4 text-base md:text-lg xl:text-xl uppercase tracking-widest font-quicksand"
          >
            {{ isComplete ? "Luar biasa!" : "Tarik huruf ke dalam kotak kosong" }}
          </p>
          <div class="flex flex-wrap justify-center gap-2 md:gap-4 w-full">
            <BubbleCard
              v-for="(item, index) in availableLetters"
              :key="item.id"
              draggable="true"
              @dragstart="onDragStart($event, index)"
              @dragend="onDragEnd(index)"
              @touchstart.prevent="onTouchStart($event, index)"
              @touchmove.prevent="onTouchMove($event)"
              @touchend.prevent="onTouchEnd($event)"
              class="w-14 h-16 md:w-24 md:h-32 2xl:w-32 2xl:h-40 rounded-xl md:rounded-3xl active:scale-95 shadow-[0_8px_20px_-5px_rgba(0,0,0,0.2)] border-2 border-indigo-200/50 bg-sky-400 cursor-grab active:cursor-grabbing hover:-translate-y-2 hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)] transition-all duration-300 touch-none"
              :class="[
                item.isDragging ? 'opacity-20 scale-95 rotate-6' : 'opacity-100',
                isComplete ? 'opacity-0 scale-50 pointer-events-none' : '',
              ]"
            >
              <span
                class="text-3xl md:text-5xl xl:text-[4rem] font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.15)] tracking-wider pointer-events-none font-quicksand"
              >
                {{
                  settingsStore.settings.letterCase === "uppercase"
                    ? item.letter.toUpperCase()
                    : item.letter.toLowerCase()
                }}
              </span>
            </BubbleCard>
          </div>
        </div>
      </div>
    </div>

    <!-- Touch Drag Preview -->
    <Teleport to="body" v-if="isTouching && draggedItemIndex !== null">
      <div
        class="fixed pointer-events-none z-50 transition-transform duration-75"
        :style="{
          left: `${touchPosition.x}px`,
          top: `${touchPosition.y + 50}px`,
          transform: 'translate(-50%, -120%) scale(1.1)',
        }"
      >
        <BubbleCard
          v-if="availableLetters[draggedItemIndex]"
          class="w-16 h-20 rounded-2xl bg-sky-400/70 shadow-[0_20px_40px_rgba(0,0,0,0.4)] border-2 border-white/50 flex items-center justify-center"
        >
          <span
            class="text-5xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.15)] font-quicksand"
          >
            {{
              settingsStore.settings.letterCase === "uppercase"
                ? availableLetters[draggedItemIndex]?.letter.toUpperCase()
                : availableLetters[draggedItemIndex]?.letter.toLowerCase()
            }}
          </span>
        </BubbleCard>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.shake-animation {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000px;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-2px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(4px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-8px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(8px, 0, 0);
  }
}

.pop-animation {
  animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1.1);
  }
}
</style>
