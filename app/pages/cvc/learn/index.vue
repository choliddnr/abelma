<script setup lang="ts">
import { cvcLevels } from "~/constants/cvcBlends";

const { cvcProgress } = storeToRefs(useCvcStore());
const { isPremium } = useSubscription();

const isUnlocked = (levelId: number) =>
  cvcProgress.value.learningLevel >= Number(levelId);
const isPremiumLocked = (levelId: number) => !isPremium.value && levelId !== 1;
const getScore = (levelId: number) =>
  cvcProgress.value.levelScores[levelId] || 0;

const getLink = (levelId: number) => {
  if (isPremiumLocked(levelId)) return "/parent/premium";
  return isUnlocked(levelId) ? `/cvc/learn/${levelId}` : "#";
};
</script>

<template>
  <div
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto p-4"
  >
    <div v-for="level in cvcLevels" :key="level.id" class="relative group">
      <MenuCard
        :to="getLink(level.id)"
        :data="level"
        :index="level.id"
        :isUnlocked="isUnlocked(level.id)"
        :isPremium="isPremiumLocked(level.id)"
        class="bg-white/10"
      >
        <template #footer>
          <div
            v-if="isUnlocked(level.id) && !isPremiumLocked(level.id)"
            class="mt-auto w-full"
          >
            <div class="flex items-center justify-between mb-1">
              <span
                class="text-xs font-black text-indigo-500 uppercase tracking-widest"
                >Skor</span
              >
              <span class="text-lg font-black text-indigo-600">{{
                getScore(level.id)
              }}</span>
            </div>
            <div class="w-full h-3 bg-indigo-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-indigo-500 transition-all duration-1000"
                :style="{
                  width: `${Math.min(100, (getScore(level.id) / 50) * 100)}%`,
                }"
              ></div>
            </div>
          </div>
        </template>
      </MenuCard>
      <!-- <NuxtLink
        :to="getLink(level.id)"
        class="block h-full"
        :class="{ 'pointer-events-none': !isUnlocked(level.id) && !isPremiumLocked(level.id) }"
      >
        <div
          class="h-full glass-card p-8 flex flex-col items-center gap-4 transition-all duration-300 overflow-hidden"
          :class="[
            isUnlocked(level.id) && !isPremiumLocked(level.id)
              ? 'hover:-translate-y-4 hover:shadow-2xl cursor-pointer border-indigo-200' 
              : 'opacity-70 grayscale'
          ]"
        > -->
      <!-- Level Icon -->
      <!-- <div
            class="size-24 rounded-full bg-linear-to-br from-indigo-50 to-white shadow-inner flex items-center justify-center text-6xl group-hover:scale-110 transition-transform"
          >
            {{ level.emoji }}
          </div> -->

      <!-- Level Info -->
      <!-- <div class="text-center">
            <h3 class="text-2xl font-black text-slate-800">{{ level.name }}</h3>
            <p class="text-slate-500 font-bold mt-1 leading-tight">{{ level.description }}</p>
          </div> -->

      <!-- Progress Info -->
      <!-- <div v-if="isUnlocked(level.id) && !isPremiumLocked(level.id)" class="mt-auto w-full">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-black text-indigo-500 uppercase tracking-widest">Skor</span>
              <span class="text-lg font-black text-indigo-600">{{ getScore(level.id) }}</span>
            </div>
            <div class="w-full h-3 bg-indigo-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-indigo-500 transition-all duration-1000"
                :style="{ width: `${Math.min(100, (getScore(level.id) / 50) * 100)}%` }"
              ></div>
            </div>
          </div> -->

      <!-- Premium Locked Overlay -->
      <!-- <div
            v-if="isPremiumLocked(level.id)"
            class="absolute inset-0 bg-slate-900/30 flex flex-col items-center justify-center gap-2 backdrop-blur-[4px] rounded-[inherit] hover:bg-slate-900/40 transition-colors"
          >
            <div class="size-14 bg-linear-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white/20">
              <Icon name="lucide:lock-keyhole" class="size-7" />
            </div>
            <span class="text-sm font-black text-white uppercase tracking-widest drop-shadow-md">Premium</span>
          </div> -->

      <!-- Locked Overlay -->
      <!-- <div
            v-else-if="!isUnlocked(level.id)"
            class="absolute inset-0 bg-slate-900/10 flex flex-col items-center justify-center gap-2 backdrop-blur-[2px] rounded-[inherit]"
          >
            <div class="size-12 bg-slate-800/80 rounded-full flex items-center justify-center text-white shadow-lg">
              <Icon name="lucide:lock" class="size-6" />
            </div>
            <span class="text-xs font-black text-slate-700 uppercase tracking-tighter">Terkunci</span>
          </div>
        </div>
      </NuxtLink> -->
    </div>
  </div>
</template>
