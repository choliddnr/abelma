<script setup lang="ts">
import { wordCategories } from "~/constants/words";
import { useSubscription } from "~/composables/useSubscription";
import ParentGate from "~/components/shared/ParentGate.vue";

const router = useRouter();
const settingsStore = useSettingsStore();
const activeCategoryId = ref(wordCategories[0]?.id || "");

const activeCategory = computed(() => {
  return wordCategories.find((c) => c.id === activeCategoryId.value);
});

const { isPremium } = useSubscription();
const showParentGate = ref(false);

const goBack = () => router.push("/words");

const navigateToWord = (wordId: string, index: number) => {
  if (!isPremium.value && index >= 2) {
    showParentGate.value = true;
    return;
  }
  if (activeCategory.value) {
    router.push(`/words/${activeCategory.value.id}/${wordId}`);
  }
};

const { isMobile } = useBreakpoints();
const handleParentGateSuccess = () => {
  showParentGate.value = false;
  navigateTo("/parent/premium");
};
</script>

<template>
  <div class="flex flex-col gap-4 h-auto">
    <!-- Header -->
    <div
      class="inline-flex gap-2 md:gap-4 lg:gap-10 glass-card mx-auto backdrop-blur-sm items-center justify-center shrink-0 px-5 py-2 md:px-10 md:py-5 z-10"
    >
      <Navigation :size="isMobile ? 'sm' : 'md'" gap="gap-1 md:gap-2 " />
      <h1
        class="text-2xl md:text-3xl font-black text-indigo-600 drop-shadow-sm"
      >
        Katalog Kata
      </h1>
    </div>

    <!-- Category Tabs -->
    <div class="px-4 overflow-x-auto hide-scrollbar">
      <div class="flex gap-2 pb-2 min-w-max">
        <UiButton
          v-for="category in wordCategories"
          :key="category.id"
          @click="activeCategoryId = category.id"
          :variant="activeCategoryId === category.id ? 'accent' : 'white'"
          class="transition-all duration-300"
          :class="
            activeCategoryId === category.id
              ? 'shadow-md scale-105 bg-indigo-500 border-indigo-600 text-white'
              : ''
          "
        >
          <span class="text-xl md:text-2xl">{{ category.emoji }}</span>
          <span class="font-black text-sm md:text-base">{{
            category.name
          }}</span>
        </UiButton>
      </div>
    </div>

    <!-- Word Grid -->
    <div class="flex-1 px-4 pb-12 w-full max-w-6xl mx-auto">
      <div
        v-if="activeCategory"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      >
        <UiButton
          v-for="(word, index) in activeCategory.words"
          :key="word.id"
          @click="navigateToWord(word.id, index)"
          variant="none"
          class="group relative flex flex-col items-center justify-between p-4 transition-all duration-300 active:scale-95 cursor-pointer w-full aspect-square border-none ring-0 focus:outline-none overflow-hidden rounded-3xl hover:-translate-y-2 hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)] shadow-[0_8px_20px_-5px_rgba(0,0,0,0.2)] bg-white"
        >
          <!-- Glossy Top Highlight -->
          <div
            class="absolute top-0 inset-x-0 h-1/3 bg-linear-to-b from-white/60 to-transparent opacity-80 rounded-t-[inherit] pointer-events-none"
          ></div>

          <!-- Emoji -->
          <div
            class="flex-1 flex items-center justify-center w-full z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
          >
            <span
              class="text-5xl md:text-6xl xl:text-8xl drop-shadow-md select-none"
            >
              {{ word.emoji }}
            </span>
          </div>

          <!-- Word Text -->
          <div
            class="w-full text-center z-10 bg-slate-50/80 backdrop-blur-sm p-1.5 md:p-2 rounded-xl md:rounded-2xl border border-slate-100/50 mt-1 md:mt-2"
          >
            <span
              class="text-lg md:text-xl xl:text-2xl font-black text-slate-700 tracking-wide"
            >
              {{
                settingsStore.settings.letterCase === "uppercase"
                  ? word.word
                  : word.word.toLowerCase()
              }}
            </span>
          </div>

          <!-- Lock Icon for Premium Words -->
          <!-- <div
            v-if="!isPremium && index >= 2"
            class="absolute inset-0 bg-white/30 backdrop-blur-[2px] rounded-[inherit] flex items-center justify-center pointer-events-none"
          >
            <div class="bg-gray-900/80 p-2 sm:p-3 rounded-full shadow-lg">
              <Icon name="lucide:lock" class="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div> -->
          <div
            v-if="!isPremium && index >= 2"
            class="absolute top-2 right-2 sm:top-3 sm:right-3 bg-gray-500 backdrop-blur-md rounded-full p-1.5 sm:p-2 shadow-sm border-white border-2 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
          >
            <Icon
              name="lucide:lock-keyhole"
              class="text-white font-bold text-xl sm:text-2xl md:text-3xl"
            />
          </div>
        </UiButton>
      </div>
    </div>
    <ParentGate
      :isOpen="showParentGate"
      @success="handleParentGateSuccess"
      @close="showParentGate = false"
    />
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
