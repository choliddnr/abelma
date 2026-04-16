<script setup lang="ts">
import { ALPHABET_STORYBOOK } from "~/constants/alphabetStorybook";
import type { AlphabetStorybook } from "@/types/alphabet";

import FloatingInteractionZone from "~/components/alphabet/FloatingInteractionZone.vue";
import CelebrationModal from "~/components/ui/CelebrationModal.vue";
import { useStorybookStore } from "~/stores/storybookStore";

const route = useRoute();
const router = useRouter();
const { markCompleted } = useStorybookStore();

const { changeCoins } = useProfileStore();
const { activeProfileId, profile } = storeToRefs(useProfileStore());

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
const showChallenge = ref(false);
const storyText = ref<string>("");

const storybook = computed(() => {
  if (!letter) return null;
  return data.find((d) => d.letter.upper === letter.toUpperCase()) || null;
});

const storyImageSrc = computed(() => {
  if (!storybook.value) return "";
  return `/${storybook.value.letter.upper}.webp`;
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

// const highlightedStory = computed(() => {
//   if (!storybook.value) return "";
//   const u = storybook.value.letter.upper;
//   const l = storybook.value.letter.lower;
//   return storybook.value.story.replace(
//     new RegExp(`(${u}|${l})`, "g"),
//     `<mark class="story-mark">$1</mark>`,
//   );
// });

const letter = route.params.id as string;

const currentIndex = computed(() => {
  if (!storybook.value) return -1;
  return data.findIndex((d) => d.id === storybook.value?.id);
});
const isSpeakingStory = ref(false);

const buildPhonicsText = (entry: AlphabetStorybook): string => {
  const u = entry.letter.upper;
  const l = entry.letter.lower;
  return `Huruf ${u}. ${u} besar dan ${l} kecil. ${entry.title}. ${entry.story}`;
};

const currentChallengeList = computed(() => {
  if (!storybook.value?.challenge) return [];
  return Array.isArray(storybook.value.challenge)
    ? storybook.value.challenge
    : [storybook.value.challenge];
});

const currentChallengeIndex = ref(0);
const activeChallenge = computed(
  () => currentChallengeList.value[currentChallengeIndex.value] || null,
);

const showCelebration = ref(false);

const readChallengeQuestion = () => {
  if (!activeChallenge.value) return;
  const text = activeChallenge.value.question;
  if (!text) return;

  currentPlayId++;
  window.speechSynthesis.cancel();
  isSpeakingStory.value = true;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "id-ID";
  utterance.rate = 0.85;
  utterance.pitch = 1.1;
  utterance.onend = utterance.onerror = () => {
    isSpeakingStory.value = false;
  };
  window.speechSynthesis.speak(utterance);
};

const startChallenge = () => {
  showChallenge.value = true;
  readChallengeQuestion();
};

let currentPlayId = 0;

const speakStory = () => {
  const story = storybook.value?.story;
  if (!story) return;

  const playId = ++currentPlayId;
  window.speechSynthesis.cancel();
  isSpeakingStory.value = true;

  let s = 0;

  const playNext = () => {
    if (playId !== currentPlayId) return;

    if (s >= story.length) {
      isSpeakingStory.value = false;
      if (!showChallenge.value && currentChallengeList.value.length > 0) {
        setTimeout(() => startChallenge(), 800);
      }
      return;
    }

    storyText.value = story[s] ?? "";
    const utterance = new SpeechSynthesisUtterance(story[s] as string);
    utterance.lang = "id-ID";
    utterance.rate = 0.85;
    utterance.pitch = 1.1;

    utterance.onend = () => {
      if (playId !== currentPlayId) return;
      s++;
      playNext();
    };

    utterance.onerror = () => {
      if (playId !== currentPlayId) return;
      isSpeakingStory.value = false;
    };

    window.speechSynthesis.speak(utterance);
  };

  playNext();
};

const closeStory = () => {
  router.push(`/alphabet/${letter}`);
};

const nextStoryLetter = () => {
  if (!storybook.value) return;
  const currentIdx = data.findIndex((d) => d.id === storybook.value!.id);
  if (currentIdx < data.length - 1) {
    router.push(`/alphabet/${data[currentIdx + 1]!.letter.lower}/story`);
  } else {
    closeStory();
  }
};

const prevStoryLetter = () => {
  if (!storybook.value) return;
  const currentIdx = data.findIndex((d) => d.id === storybook.value!.id);
  if (currentIdx > 0) {
    router.push(`/alphabet/${data[currentIdx - 1]!.letter.lower}/story`);
  }
};

const onChallengeSuccess = async () => {
  showCelebration.value = true;

  changeCoins(10);

  if (currentChallengeIndex.value < currentChallengeList.value.length - 1) {
    // Has more questions
    setTimeout(() => {
      showCelebration.value = false;
      currentChallengeIndex.value++;
      setTimeout(() => readChallengeQuestion(), 300);
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

const onChallengeFail = () => {
  // Add logic later if needed (FloatingInteractionZone already shakes and randomizes)
};

onMounted(() => {
  speakStory();
});

onUnmounted(() => {
  currentPlayId++;
  window.speechSynthesis.cancel();
});
</script>

<template>
  <div
    v-if="storybook"
    class="flex sm:items-center justify-center sm:p-6"
    @click.self="closeStory"
  >
    <div
      class="relative bg-white rounded-[2.5rem] shadow-2xl flex flex-col mt-5 border-8 border-white/80 overflow-hidden w-full max-w-4xl h-screen sm:h-[88vh] mb-5 mx-2 md:mx-0 md:mb-0"
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
        v-if="showChallenge && activeChallenge"
        :key="'challenge-' + currentChallengeIndex"
        :target="activeChallenge.target"
        :options="activeChallenge.options"
        @success="onChallengeSuccess"
        @fail="onChallengeFail"
      />

      <!-- Top-left: Large Letter (bounce) -->
      <div
        v-if="!showChallenge"
        class="absolute top-6 left-6 md:left-8 flex items-end gap-2 drop-shadow-xl z-10 pointer-events-none"
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
          icon="🎯"
          v-if="!showChallenge && currentChallengeList.length > 0"
          @click="startChallenge"
          class="px-4"
        />
        <UiButton
          label="🔊"
          variant="white"
          @click="showChallenge ? readChallengeQuestion() : speakStory()"
          class="py-4 px-5"
          :class="{ 'animate-pulse': isSpeakingStory }"
        />
        <UiButton
          label="X"
          @click="closeStory"
          class="bg-rose-500 hover:bg-rose-400 active:scale-90 rounded-full shadow-xl transition-all border-b-4 border-rose-700 active:border-b-0 active:translate-y-1 text-white font-black text-xl"
        />
      </div>

      <!-- Bottom floating card: Story text or Challenge -->

      <div
        class="mt-auto relative z-10 p-4 sm:p-6 flex flex-col items-center w-full"
      >
        <template v-if="!showChallenge">
          <div class="space-y-4 text-center bg-black/50 rounded-2xl max-w-2xl">
            <span class="text-xl md:text-2xl lg:text-3xl text-white font-bold"
              >📖 {{ storybook.title }}</span
            >
            <p
              class="text-xl md:text-2xl lg:text-3xl font-medium leading-normal p-2 text-white mx-auto"
              v-html="highlightStory"
            />
          </div>
        </template>
        <!-- <template v-else-if="activeChallenge">
          <div
            class="text-center bg-black/60 rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-sm pointer-events-none w-full max-w-2xl"
          >
            <p
              class="text-xl md:text-2xl lg:text-3xl font-black text-white px-2"
            >
              {{ activeChallenge.question || activeChallenge.instruction }}
            </p>
          </div>
        </template> -->
      </div>
    </div>
    <CelebrationModal
      v-model="showCelebration"
      title="Hebat Sekali!"
      :message="
        currentChallengeIndex < currentChallengeList.length - 1
          ? 'Kamu berhasil! Mari lanjut ke pertanyaan berikutnya!'
          : 'Kerja bagus! Kamu sudah menyelesaikan semua pertanyaan!'
      "
      :footer-text="
        currentChallengeIndex < currentChallengeList.length - 1
          ? 'Lanjut...'
          : 'Selesai'
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
