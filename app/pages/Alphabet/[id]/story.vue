<script setup lang="ts">
import { ALPHABET_STORYBOOK } from "~/constants/alphabetStorybook";
import type { AlphabetStorybook } from "@/types/alphabet";

import FloatingInteractionZone from "~/components/alphabet/FloatingInteractionZone.vue";
import CelebrationModal from "~/components/ui/CelebrationModal.vue";
import { useStorybookStore } from "~/stores/storybookStore";
import { speakTTS, cancelTTS } from "~/composables/useTTS";

const route = useRoute();
const router = useRouter();
const { markCompleted } = useStorybookStore();

const { changeCoins } = useProfileStore();
const { activeProfileId, profile } = storeToRefs(useProfileStore());
const mentorStore = useMentorStore();
const { resetTimer } = useMentorHint("Ayo kita dengarkan ceritanya!", 8000);

const data = ALPHABET_STORYBOOK as AlphabetStorybook[];
const emojiMap: Record<string, string> = {
  A: "🍎",
  B: "⚽",
  C: "🍒",
  D: "🐑",
  E: "🦅",
  F: "📷",
  G: "🐘",
  H: "🚁",
  I: "🐟",
  J: "🦒",
  K: "🐈",
  L: "💡",
  M: "🥭",
  N: "🍍",
  O: "💊",
  P: "🍌",
  Q: "📖",
  R: "🏠",
  S: "🐄",
  T: "🎩",
  U: "🐪",
  V: "🏺",
  W: "🥕",
  X: "🎼",
  Y: "🪀",
  Z: "🦓",
};

const imageError = ref(false);
const showQuiz = ref(false);
const storyText = ref<string>("");

const storybook = computed(() => {
  if (!letter) return null;
  return data.find((d) => d.letter.upper === letter.toUpperCase()) || null;
});

const storyImageSrc = computed(() => {
  if (!storybook.value) return "";
  return `/img/${storybook.value.letter.upper}.webp`;
});

const highlightStory = computed(() => {
  if (!storybook.value) return "";
  const u = storybook.value.letter.upper;
  const l = storybook.value.letter.lower;
  return storyText.value.replace(
    new RegExp(`(${u}|${l})`, "g"),
    `<mark class="story-mark text-white">$1</mark>`,
  );
});

const letter = route.params.id as string;

// const currentIndex = computed(() => {
//   if (!storybook.value) return -1;
//   return data.findIndex((d) => d.id === storybook.value?.id);
// });
const isSpeakingStory = ref(false);

// const buildPhonicsText = (entry: AlphabetStorybook): string => {
//   const u = entry.letter.upper;
//   const l = entry.letter.lower;
//   return `Huruf ${u}. ${u} besar dan ${l} kecil. ${entry.title}. ${entry.story}`;
// };

const currentQuizList = computed(() => {
  if (!storybook.value?.quiz) return [];
  return Array.isArray(storybook.value.quiz)
    ? storybook.value.quiz
    : [storybook.value.quiz];
});

const currentQuizIndex = ref(0);
const activeQuiz = computed(
  () => currentQuizList.value[currentQuizIndex.value] || null,
);

const showCelebration = ref(false);

const readQuizQuestion = () => {
  if (!activeQuiz.value) return;
  const text = activeQuiz.value.question;
  if (!text) return;

  currentPlayId++;
  cancelTTS();
  isSpeakingStory.value = true;

  speakTTS(text, {
    rate: 0.85,
    pitch: 1.1,
    onEnd: () => {
      isSpeakingStory.value = false;
    },
  });
};

const startQuiz = () => {
  showQuiz.value = true;
  readQuizQuestion();
};

let currentPlayId = 0;

const speakStory = () => {
  const story = storybook.value?.story;
  if (!story) return;

  resetTimer();
  const playId = ++currentPlayId;
  cancelTTS();
  isSpeakingStory.value = true;

  let s = 0;

  const playNext = () => {
    if (playId !== currentPlayId) return;

    if (s >= story.length) {
      isSpeakingStory.value = false;
      if (!showQuiz.value && currentQuizList.value.length > 0) {
        setTimeout(() => startQuiz(), 800);
      }
      return;
    }

    storyText.value = story[s] ?? "";

    speakTTS(story[s] as string, {
      rate: 0.85,
      pitch: 1.1,
      onEnd: () => {
        if (playId !== currentPlayId) return;
        s++;
        playNext();
      },
    });
  };

  playNext();
};

const closeStory = () => {
  router.push(`/alphabet/${letter}`);
};

// const nextStoryLetter = () => {
//   if (!storybook.value) return;
//   const currentIdx = data.findIndex((d) => d.id === storybook.value!.id);
//   if (currentIdx < data.length - 1) {
//     router.push(`/alphabet/${data[currentIdx + 1]!.letter.lower}/story`);
//   } else {
//     closeStory();
//   }
// };

// const prevStoryLetter = () => {
//   if (!storybook.value) return;
//   const currentIdx = data.findIndex((d) => d.id === storybook.value!.id);
//   if (currentIdx > 0) {
//     router.push(`/alphabet/${data[currentIdx - 1]!.letter.lower}/story`);
//   }
// };

const onQuizSuccess = async () => {
  showCelebration.value = true;
  playEffectAudio("correct");

  changeCoins(10);

  if (currentQuizIndex.value < currentQuizList.value.length - 1) {
    // Has more questions
    setTimeout(() => {
      showCelebration.value = false;
      currentQuizIndex.value++;
      setTimeout(() => readQuizQuestion(), 300);
    }, 2000);
  } else {
    // All questions finished
    const story = storybook.value;
    if (story) {
      const idx = data.findIndex((d) => d.id === story.id);
      if (idx !== -1) markCompleted(idx);
    }
    await $fetch("/api/profile/" + activeProfileId.value, {
      method: "PUT",
      body: {
        coins: profile.value.coins,
      },
      onResponse: ({ response }) => {
        if (!response.ok) {
          console.error("failed to update coin");
        }
      },
    });
    setTimeout(() => {
      showCelebration.value = false;
      router.push(`/alphabet`);
    }, 2500);
  }
};

const onQuizFail = () => {
  // Add logic later if needed (FloatingInteractionZone already shakes and randomizes)
  mentorStore.wiggle();
  mentorStore.showMessage("Kurang tepat, coba lagi yaaa!");
};

onMounted(() => {
  speakStory();
});

onUnmounted(() => {
  currentPlayId++;
  cancelTTS();
});
</script>

<template>
  <div
    v-if="storybook"
    class="flex sm:items-center justify-center sm:p-6"
    @click.self="closeStory"
  >
    <div
      class="relative bg-white rounded-[2.5rem] shadow-2xl flex flex-col mt-5 border-8 border-white/80 overflow-hidden w-full max-w-4xl h-[85vh] sm:h-[88vh] mb-5 mx-2 md:mx-0 md:mb-0"
    >
      <!-- Background Image -->
      <template v-if="!imageError">
        <img
          :src="storyImageSrc"
          :alt="storybook.title"
          class="absolute inset-0 w-full h-full object-cover"
          @error="imageError = true"
          :key="'img-' + storybook.id"
        />
        <div class="absolute inset-0 bg-black/30 pointer-events-none" />
      </template>

      <template v-else>
        <div
          class="absolute inset-0 bg-slate-50 flex items-center justify-center overflow-hidden"
        >
          <span
            class="text-[15rem] select-none opacity-[0.15]"
            style="animation: letter-bounce 3s ease-in-out infinite"
          >
            {{ emojiMap[storybook.letter.upper] }}
          </span>
        </div>
      </template>

      <FloatingInteractionZone
        v-if="showQuiz && activeQuiz"
        :key="'quiz-' + currentQuizIndex"
        :target="activeQuiz.target"
        :options="activeQuiz.options"
        @success="onQuizSuccess"
        @fail="onQuizFail"
      />

      <!-- Top-left: Large Letter (bounce) -->
      <div
        v-if="!showQuiz"
        class="absolute top-6 left-6 md:left-8 items-end gap-2 drop-shadow-xl z-10 pointer-events-none hidden sm:flex"
      >
        <span
          class="font-black leading-none select-none text-white drop-shadow-lg text-8xl animate-bounce"
        >
          {{ storybook.letter.upper }}
        </span>
        <span
          class="font-black leading-none select-none text-white/90 drop-shadow-lg mb-1 text-8xl animate-bounce"
        >
          {{ storybook.letter.lower }}
        </span>
      </div>

      <div class="absolute top-6 right-6 md:right-8 z-30 flex gap-3">
        <UiButton
          variant="primary"
          icon="lucide:target"
          v-if="!showQuiz && currentQuizList.length > 0"
          @click="startQuiz"
          class="px-4"
        />
        <UiButton
          icon="lucide:volume-2"
          variant="white"
          @click="showQuiz ? readQuizQuestion() : speakStory()"
          class="py-4 px-5"
          :class="{ 'animate-pulse': isSpeakingStory }"
        />
        <UiButton
          icon="lucide:x"
          @click="closeStory"
          class="bg-rose-500 hover:bg-rose-400 active:scale-90 rounded-full shadow-xl transition-all border-b-4 border-rose-700 active:border-b-0 active:translate-y-1 text-white font-black text-xl px-4 py-4"
        />
      </div>

      <!-- Bottom floating card: Story text or Quiz -->

      <div
        class="mt-auto relative z-10 p-4 sm:p-6 flex flex-col items-center w-full"
      >
        <template v-if="!showQuiz">
          <div class="space-y-4 text-center bg-black/50 rounded-2xl max-w-2xl">
            <span class="text-xl md:text-2xl lg:text-3xl text-white font-bold"
              ><Icon name="lucide:book-open" class="mr-1" /> {{ storybook.title }}</span
            >
            <p
              class="text-xl md:text-2xl lg:text-3xl font-medium leading-normal p-2 text-white mx-auto"
              v-html="highlightStory"
            />
          </div>
        </template>
      </div>
    </div>
    <CelebrationModal
      v-model="showCelebration"
      title="Hebat Sekali!"
      :message="
        currentQuizIndex < currentQuizList.length - 1
          ? 'Kamu berhasil! Mari lanjut ke pertanyaan berikutnya!'
          : 'Kerja bagus! Kamu sudah menyelesaikan semua pertanyaan!'
      "
      :footer-text="
        currentQuizIndex < currentQuizList.length - 1 ? 'Lanjut...' : 'Selesai'
      "
    />
  </div>
</template>

<style scoped>
@keyframes letter-bounce {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

.pop-in-enter-active {
  animation: pop-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pop-in-leave-active {
  transition: opacity 0.2s ease;
}

.pop-in-leave-to {
  opacity: 0;
}

@keyframes pop-in {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

:deep(.story-mark) {
  background: rgba(192, 166, 0, 0.9);
  border-radius: 4px;
  padding: 0 2px;
  font-weight: 900;
  color: #ffffff;
  box-shadow: 0 2px 0 rgba(202, 138, 4, 0.45);
}
</style>
