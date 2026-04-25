<script setup lang="ts">
import { wordCategories } from "~/constants/words";
const router = useRouter();
const settingsStore = useSettingsStore();
const activeCategoryId = ref(wordCategories[0]?.id || "");

const activeCategory = computed(() => {
  return wordCategories.find((c) => c.id === activeCategoryId.value);
});

const goBack = () => router.push("/words");

const navigateToWord = (wordId: string) => {
  if (activeCategory.value) {
    router.push(`/words/${activeCategory.value.id}/${wordId}`);
  }
};
</script>

<template>
  <div class="flex flex-col gap-4 h-auto">
    <!-- Header -->
    <div class="flex items-center justify-center shrink-0 px-4 pt-4 pb-2 z-10">
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
          v-for="word in activeCategory.words"
          :key="word.id"
          @click="navigateToWord(word.id)"
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
        </UiButton>
      </div>
    </div>
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
