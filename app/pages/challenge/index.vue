<script setup lang="ts">
const { playEffectAudio } = useAudio();
import confetti from "canvas-confetti";

defineOptions({ name: "ChallengesList" });

const { profile } = storeToRefs(useProfileStore());
const { challenges } = storeToRefs(useChallengeStore());
const { fetch } = useChallengeStore();

callOnce(async () => await useAsyncData("challenges", () => fetch()));

const celebrationData = ref({
  show: false,
  title: "",
  message: "",
  rewardAmount: null as number | null,
  footerText: "",
  mainEmoji: "",
});

const { success: notifySuccess, error: notifyError } = useNotification();

const handleComplete = async (challenge: any) => {
  if (challenge.status === "available") {
    challenge.status = "pending_validation";
    await $fetch(`/api/challenges/${challenge.id}`, {
      method: "PATCH",
      body: {
        status: "pending_validation",
      },
      onResponse({ response, error }) {
        if (!error && response.ok) {
          notifySuccess("Misi berhasil diklaim!");
          playEffectAudio("sticker");
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            zIndex: 100,
          });
          celebrationData.value = {
            show: true,
            title: "Hebat!",
            message: `Kamu sudah menyelesaikan "${challenge.title}"!`,
            rewardAmount: null,
            footerText: "Tunggu Ayah/Bunda untuk memberikan koinmu ya...",
            mainEmoji: "⭐",
          };
          setTimeout(() => {
            celebrationData.value.show = false;
          }, 4000);
        } else {
          notifyError("Gagal mengklaim misi. Silakan coba lagi.");
          challenge.status = "available"; // Revert status on failure
        }
      },
    });
  }
};
</script>

<template>
  <div class="h-auto flex flex-col p-4 md:p-8 relative overflow-hidden">
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
        class="text-3xl md:text-5xl font-black text-sky-600 drop-shadow-sm font-quicksand flex items-center gap-2"
      >
        <Icon name="lucide:star" class="text-4xl text-amber-400" /> Papan Misi
      </h1>
    </div>

    <!-- Challenge Grid -->
    <div class="relative z-10 flex-1 w-full max-w-5xl mx-auto">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(challenge, index) in challenges"
          :key="challenge.id"
          class="glass-card bg-white flex flex-col p-6 rounded-[2.5rem] border-x-4 border-t-4 transition-all duration-300 group animate-entrance"
          :class="[
            challenge.status === 'available'
              ? 'border-sky-100 hover:-translate-y-3 hover:shadow-2xl'
              : 'border-slate-50 opacity-80',
            challenge.status === 'pending_validation'
              ? 'bg-sky-50/50 border-sky-200'
              : '',
            challenge.status === 'completed'
              ? 'opacity-40 grayscale scale-95'
              : '',
          ]"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <!-- Emoji & Reward -->
          <div class="flex justify-between items-start mb-6">
            <div
              class="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-5xl shadow-inner group-hover:scale-110 transition-transform"
            >
              <Icon name="lucide:star" class="text-amber-400" />
            </div>
            <div
              class="bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-black text-lg border-2 border-amber-200"
            >
              +{{ challenge.coinReward }} <Icon name="lucide:circle-dollar-sign" class="ml-1" />
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1 mb-6">
            <h3
              class="text-2xl font-black text-slate-800 font-quicksand mb-1 line-clamp-2"
            >
              {{ challenge.title }}
            </h3>
            <p class="text-slate-600 font-bold mb-3 line-clamp-3">
              {{ challenge.description }}
            </p>
            <p
              v-if="challenge.status === 'available'"
              class="text-sky-600 font-bold"
            >
              Ayo selesaikan misi ini!
            </p>
            <p
              v-else-if="challenge.status === 'pending_validation'"
              class="text-indigo-600 font-black flex items-center gap-1"
            >
              <Icon name="lucide:clock" /> Sudah dikerjakan! Tunggu validasi...
            </p>
            <p v-else class="text-emerald-600 font-black"><Icon name="lucide:sparkles" /> Misi Selesai!</p>
          </div>

          <!-- Action -->
          <UiButton
            v-if="challenge.status === 'available'"
            @click="handleComplete(challenge)"
            variant="primary"
            class="w-full text-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 bg-sky-500 hover:bg-sky-600 border-sky-600 shadow-sky-500/50"
            icon="lucide:rocket"
            icon-position="right"
          >
            <span class="drop-shadow-sm uppercase font-black text-sm"
              >Aku Sudah Selesai!</span
            >
          </UiButton>
          <div
            v-else-if="challenge.status === 'pending_validation'"
            class="py-3 px-6 bg-sky-100 text-sky-700 border-2 border-sky-200 rounded-2xl text-center font-black text-sm uppercase"
          >
            MENUNGGU VALIDASI <Icon name="lucide:check-circle" />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="challenges.length === 0"
        class="flex flex-col items-center justify-center py-10 md:py-16 px-2 animate-entrance"
      >
        <div
          class="glass-card relative w-full max-w-lg mx-auto overflow-hidden px-6 py-10 md:px-10 md:py-12 border-x-4 border-t-4 border-dashed border-sky-200/90 bg-gradient-to-b from-white/90 to-sky-50/40 shadow-lg"
        >
          <div class="relative flex flex-col items-center text-center gap-6">
            <div class="flex items-end justify-center gap-1 min-h-[5.5rem]">
              <Icon
                name="lucide:star"
                class="text-5xl sm:text-6xl drop-shadow-sm animate-float select-none text-amber-400"
                :style="{ animationDelay: '0s' }"
              />
            </div>

            <div class="space-y-3 max-w-md">
              <h2
                class="text-2xl sm:text-3xl font-black text-sky-600 font-quicksand leading-tight"
              >
                Belum ada misi baru
              </h2>
              <p
                class="text-slate-600 font-bold text-base sm:text-lg leading-relaxed"
              >
                Tunggu Ayah/Bunda memberikan misi baru ya. Kalau kamu rajin,
                pasti dapat koin banyak!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Celebration Pop-up -->
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
