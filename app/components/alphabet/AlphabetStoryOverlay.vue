<script setup lang="ts">
import type { AlphabetStorybook } from "@/types/alphabet";
import InteractionZone from "@/components/InteractionZone.vue";

const props = defineProps<{
  currentStory: AlphabetStorybook | null;
  isSpeakingStory: boolean;
  data: AlphabetStorybook[];
  emojiMap: Record<string, string>;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "speak"): void;
  (e: "prev"): void;
  (e: "next"): void;
  (e: "success"): void;
  (e: "fail"): void;
}>();

const showChallenge = ref(false);
const imageError = ref(false);
const interactionRef = ref<InstanceType<typeof InteractionZone> | null>(null);

const storyImageSrc = computed(() => {
  if (!props.currentStory) return "";
  return `/${props.currentStory.letter.upper}.webp`;
});

const highlightedStory = computed(() => {
  if (!props.currentStory) return "";
  const u = props.currentStory.letter.upper;
  const l = props.currentStory.letter.lower;
  return props.currentStory.story.replace(
    new RegExp(`(${u}|${l})`, "g"),
    `<mark class="story-mark">$1</mark>`,
  );
});

const currentIndex = computed(() => {
  if (!props.currentStory) return -1;
  return props.data.findIndex((d) => d.id === props.currentStory?.id);
});

watch(
  () => props.currentStory,
  () => {
    imageError.value = false;
    showChallenge.value = false;
    nextTick(() => interactionRef.value?.reset());
  },
);

const onChallengeSuccess = () => {
  emit("success");
};

const onChallengeFail = () => {
  emit("fail");
};

defineExpose({
  resetChallenge: () => {
    showChallenge.value = false;
    nextTick(() => interactionRef.value?.reset());
  },
});
</script>

<template>
  <Teleport to="body">
    <transition name="pop-in">
      <div
        v-if="currentStory"
        class="fixed inset-0 z-500 flex items-end sm:items-center justify-center sm:p-6 bg-black/50 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <!-- Card container: mirrors AlphabetStorybookView story card exactly -->
        <div
          class="relative bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col border-8 border-white/80 overflow-hidden w-full max-w-4xl h-[93vh] sm:h-[88vh]"
        >
          <!-- Background Image -->
          <template v-if="!imageError">
            <img
              :src="storyImageSrc"
              :alt="currentStory.title"
              class="absolute inset-0 w-full h-full object-cover"
              @error="imageError = true"
              :key="'img-' + currentStory.id"
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
                {{ emojiMap[currentStory.letter.upper] }}
              </span>
            </div>
          </template>

          <!-- Top-left: Large Letter (bounce) -->
          <div
            class="absolute top-6 left-6 md:left-8 flex items-end gap-2 drop-shadow-xl z-10 pointer-events-none"
          >
            <span
              class="font-black leading-none select-none text-white drop-shadow-lg"
              style="
                font-family: &quot;Baloo Bhaijaan 2&quot;, sans-serif;
                font-size: clamp(4rem, 8vw, 6rem);
                animation: letter-bounce 3s ease-in-out infinite;
              "
            >
              {{ currentStory.letter.upper }}
            </span>
            <span
              class="font-black leading-none select-none text-white/90 drop-shadow-lg mb-1"
              style="
                font-family: &quot;Baloo Bhaijaan 2&quot;, sans-serif;
                font-size: clamp(2.5rem, 5vw, 4rem);
              "
            >
              {{ currentStory.letter.lower }}
            </span>
          </div>

          <!-- Top-right: Speak + Close buttons -->
          <div class="absolute top-6 right-6 md:right-8 z-10 flex gap-3">
            <button
              @click="emit('speak')"
              class="relative bg-yellow-400 hover:bg-yellow-300 active:scale-90 p-3 sm:p-4 rounded-full shadow-xl transition-all border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1"
              :class="{ 'animate-pulse': isSpeakingStory }"
            >
              <span class="text-3xl select-none">🔊</span>
              <div
                v-if="!isSpeakingStory"
                class="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full animate-bounce font-black whitespace-nowrap shadow-md"
              >
                KETUK AKU!
              </div>
              <div
                v-else
                class="absolute -top-2 -right-2 bg-indigo-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black whitespace-nowrap shadow-md"
              >
                MEMBACA…
              </div>
            </button>
            <button
              @click="emit('close')"
              class="bg-rose-500 hover:bg-rose-400 active:scale-90 p-3 sm:p-4 rounded-full shadow-xl transition-all border-b-4 border-rose-700 active:border-b-0 active:translate-y-1 text-white font-black text-xl"
            >
              ✕
            </button>
          </div>

          <!-- Bottom floating card: Story text or Challenge -->
          <div class="mt-auto relative z-10 p-4 sm:p-6 flex flex-col items-center w-full">
            <div
              class="bg-white/75 backdrop-blur-md shadow-2xl rounded-3xl p-6 sm:p-8 w-full max-w-3xl border-4 border-white/50 transition-all duration-300"
            >
              <template v-if="!showChallenge">
                <!-- STORY TEXT -->
                <div class="space-y-4 text-center">
                  <h2
                    class="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <span class="text-xl">📖</span> Ayo Baca!
                  </h2>
                  <p
                    class="text-xl md:text-2xl lg:text-3xl font-medium leading-normal text-slate-700 max-w-2xl mx-auto"
                    v-html="highlightedStory"
                  />
                  <div class="pt-2">
                    <button
                      @click="showChallenge = true"
                      class="ui-capsule-interactive bg-green-500 border-green-700 text-white w-full sm:w-auto px-8 py-3 text-lg justify-center hover:bg-green-400"
                    >
                      <span class="font-black">Lanjut ke Tantangan 🎯</span>
                    </button>
                  </div>
                </div>
              </template>

              <template v-else>
                <!-- CHALLENGE -->
                <div class="flex flex-col gap-6">
                  <div class="flex items-center justify-between w-full">
                    <button
                      @click="showChallenge = false"
                      class="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
                    >
                      <span>⬅️ Kembali</span>
                    </button>
                    <span class="text-sm font-black uppercase tracking-widest text-indigo-500"
                      >🎯 Tantangan</span
                    >
                    <div class="w-16"></div>
                  </div>
                  <InteractionZone
                    ref="interactionRef"
                    :target="currentStory.challenge.target"
                    :options="currentStory.challenge.options"
                    :instruction="currentStory.challenge.instruction"
                    :themeColor="currentStory.themeColor"
                    @success="onChallengeSuccess"
                    @fail="onChallengeFail"
                  />
                </div>
              </template>
            </div>
          </div>

          <!-- Footer nav: Prev / Letter counter / Next -->
          <footer class="relative z-10 w-full flex gap-4 px-4 sm:px-6 pt-3 pb-4 shrink-0">
            <button
              @click="emit('prev')"
              class="flex-1 bg-white/30 hover:bg-white/50 text-white py-3 rounded-3xl font-black text-lg transition-all shadow-lg border-b-4 border-black/15 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2"
            >
              ⬅️ <span class="hidden sm:inline">SEBELUMNYA</span>
            </button>
            <div class="flex flex-col items-center justify-center min-w-14">
              <span
                class="text-4xl font-black text-white drop-shadow-md"
                style="font-family: &quot;Baloo Bhaijaan 2&quot;, sans-serif"
                >{{ currentStory.letter.upper }}</span
              >
              <span class="text-xs text-white/70 font-bold"
                >{{ currentIndex + 1 }} / {{ data.length }}</span
              >
            </div>
            <button
              @click="emit('next')"
              class="flex-1 bg-green-400 hover:bg-green-300 text-white py-3 rounded-3xl font-black text-lg transition-all shadow-lg border-b-4 border-green-600 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2"
            >
              <span class="hidden sm:inline">SELANJUTNYA</span> ➡️
            </button>
          </footer>
        </div>
      </div>
    </transition>
  </Teleport>
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
  background: rgba(255, 220, 0, 0.55);
  border-radius: 4px;
  padding: 0 2px;
  font-weight: 900;
  color: #7c5200;
  box-shadow: 0 2px 0 rgba(202, 138, 4, 0.45);
}
</style>
