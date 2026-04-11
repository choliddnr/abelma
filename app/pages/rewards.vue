<script setup lang="ts">
defineOptions({ name: "WordRewards" });
import { playEffectAudio } from "@/utils/audio";
import confetti from "canvas-confetti";
import type { Reward } from "~~/shared/types/api";

const router = useRouter();
const { profile } = storeToRefs(useProfileStore());
const { rewards } = storeToRefs(useRewardStore());
const { fetch } = useRewardStore();
callOnce(async () => await useAsyncData("rewards", () => fetch()));

const celebrationData = ref({
  show: false,
  title: "",
  message: "",
  rewardAmount: null as number | null,
  footerText: "",
  mainEmoji: "",
});

const handleClaim = async (reward: Reward) => {
  if (reward.cost <= profile.value.coins && reward.status === "available") {
    if (!reward || reward.status !== "available") {
      return false;
    }
    if (profile.value.coins >= reward.cost) {
      profile.value.coins -= reward.cost;
      reward.status = "claimed";
      reward.claimedAt = new Date();
      await $fetch("/api/reward/" + reward.id.toString() + "/claim", {
        method: "PATCH",
        body: {
          coins: profile.value.coins,
          status: "claimed",
          claimedAt: new Date(),
        },
        onResponse({ response }) {
          if (response.ok) {
            playEffectAudio("sticker");
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              zIndex: 100,
            });
            celebrationData.value = {
              show: true,
              title: "Selamat!",
              message: `Kamu berhasil menukar ${reward.title}!`,
              rewardAmount: null,
              footerText: "Tunggu Ayah/Bunda ya...",
              mainEmoji: reward.emoji || "🎁"
            };
            setTimeout(() => {
              celebrationData.value.show = false;
            }, 3500);
          }
        },
      });
      // await triggerSync();
    }
    // const success = await rewardStore.claimReward(reward.id);
    //
  }
};
</script>

<template>
  <div class="min-h-screen flex flex-col p-4 md:p-8 relative overflow-hidden">
    <!-- Background Decoration -->
    <div
      class="absolute -top-10 -right-10 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl"
    ></div>
    <div
      class="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl"
    ></div>

    <!-- Header (Animated) -->
    <div
      class="relative z-10 flex items-center justify-between w-full max-w-5xl mx-auto mb-8 animate-entrance"
    >
      <h1
        class="text-3xl md:text-5xl font-black text-indigo-600 drop-shadow-sm font-quicksand flex items-center gap-2"
      >
        <span class="text-4xl">🎁</span> Toko Hadiah
      </h1>
    </div>

    <!-- Reward Grid -->
    <div class="relative z-10 flex-1 w-full max-w-5xl mx-auto">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(reward, index) in rewards"
          :key="reward.id"
          class="glass-card bg-white flex flex-col p-6 rounded-[2.5rem] border-x-4 border-t-4 transition-all duration-300 group animate-entrance"
          :class="[
            reward.status === 'available' && profile.coins >= reward.cost
              ? 'border-indigo-100 hover:-translate-y-3 hover:shadow-2xl'
              : 'border-slate-50 opacity-80',
            reward.status === 'claimed'
              ? 'bg-indigo-50/50 border-indigo-200'
              : '',
            reward.status === 'fulfilled'
              ? 'opacity-40 grayscale scale-95'
              : '',
          ]"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <!-- Emoji & Cost -->
          <div class="flex justify-between items-start mb-6">
            <div
              class="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-5xl shadow-inner group-hover:scale-110 transition-transform"
            >
              {{ reward.emoji }}
            </div>
            <div
              class="bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-black text-lg border-2 border-amber-200"
            >
              {{ reward.cost }} 🪙
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1 mb-6">
            <h3 class="text-2xl font-black text-slate-800 font-quicksand mb-1">
              {{ reward.title }}
            </h3>
            <p
              v-if="reward.status === 'available'"
              class="text-slate-500 font-bold"
            >
              Ayo kumpulkan koin untuk tukar!
            </p>
            <p
              v-else-if="reward.status === 'claimed'"
              class="text-indigo-600 font-black flex items-center gap-1"
            >
              ⌚ Sudah ditukar! Tunggu Ayah/Bunda ya...
            </p>
            <p v-else class="text-emerald-600 font-black">✨ Sudah diterima!</p>
          </div>

          <!-- Action -->
          <UiButton
            v-if="reward.status === 'available'"
            @click="handleClaim(reward)"
            :disabled="profile.coins < reward.cost"
            variant="primary"
            class="w-full text-xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
            icon="🚀"
            icon-position="right"
          >
            <span class="drop-shadow-sm uppercase font-black"
              >Tukar Hadiah</span
            >
          </UiButton>
          <div
            v-else-if="reward.status === 'claimed'"
            class="py-3 px-6 bg-indigo-100 text-indigo-700 border-2 border-indigo-200 rounded-2xl text-center font-black"
          >
            TERKLAIM ✅
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="rewards.length === 0"
        class="flex flex-col items-center justify-center py-10 md:py-16 px-2 animate-entrance"
      >
        <div
          class="glass-card relative w-full max-w-lg mx-auto overflow-hidden px-6 py-10 md:px-10 md:py-12 border-x-4 border-t-4 border-dashed border-indigo-200/90 bg-gradient-to-b from-white/90 to-indigo-50/40 shadow-lg"
        >
          <div
            class="pointer-events-none absolute -top-6 -right-4 w-32 h-32 rounded-full bg-amber-200/35 blur-2xl"
          />
          <div
            class="pointer-events-none absolute -bottom-8 -left-4 w-36 h-36 rounded-full bg-indigo-200/25 blur-2xl"
          />

          <div class="relative flex flex-col items-center text-center gap-6">
            <div class="flex items-end justify-center gap-1 min-h-[5.5rem]">
              <span
                class="text-5xl sm:text-6xl drop-shadow-sm animate-float select-none"
                :style="{ animationDelay: '0s' }"
                aria-hidden="true"
                >🎁</span
              >
              <span
                class="text-3xl sm:text-4xl pb-1 opacity-85 animate-float select-none"
                :style="{ animationDelay: '0.6s' }"
                aria-hidden="true"
                >✨</span
              >
              <span
                class="text-4xl sm:text-5xl pb-0.5 opacity-90 animate-float select-none"
                :style="{ animationDelay: '1.1s' }"
                aria-hidden="true"
                >🪙</span
              >
            </div>

            <div class="space-y-3 max-w-md">
              <h2
                class="text-2xl sm:text-3xl font-black text-indigo-600 font-quicksand leading-tight"
              >
                Toko hadiahnya masih kosong
              </h2>
              <p class="text-slate-600 font-bold text-base sm:text-lg leading-relaxed">
                Belum ada hadiah yang disiapkan Ayah/Bunda. Tenang — koinmu tetap aman. Yuk
                lanjut belajar, nanti cek lagi!
              </p>
            </div>

            <div
              class="flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full"
            >
              <span
                class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-2 text-sm font-black text-amber-900 border-2 border-amber-200/80 shadow-sm"
              >
                🪙 Koinmu menunggu
              </span>
              <span
                class="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-sm font-black text-indigo-700 border-2 border-indigo-100 shadow-sm"
              >
                📚 Belajar dulu
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Motivational Footer -->
    <div
      v-if="rewards.length > 0"
      class="mt-8 text-center text-indigo-400 font-bold font-quicksand italic animate-pulse"
    >
      "Terus belajar, kumpulkan koinnya, dapatkan hadiahnya! 🚀✨"
    </div>
    <div
      v-else
      class="mt-8 text-center text-slate-500 font-bold font-quicksand text-sm sm:text-base max-w-md mx-auto leading-relaxed px-2"
    >
      Begitu Ayah/Bunda menambah hadiah baru, kamu bisa langsung menukarnya dengan
      koin. ✨
    </div>

    <!-- Reward Celebration Pop-up -->
    <UiCelebrationModal
      v-model="celebrationData.show"
      :title="celebrationData.title"
      :message="celebrationData.message"
      :reward-amount="celebrationData.rewardAmount"
      :footer-text="celebrationData.footerText"
      :main-emoji="celebrationData.mainEmoji"
    />
  </div>
</template>

<style scoped>
.font-quicksand {
  font-family: "Quicksand", sans-serif;
}
</style>
