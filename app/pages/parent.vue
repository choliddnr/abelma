<script setup lang="ts">
import { authClient } from "~/utils/auth-client";

const route = useRoute();
const router = useRouter();
const session = authClient.useSession();

const isSyncing = ref(false);

const goBack = () => router.push("/");

const logout = async () => {
  await authClient.signOut();
  router.push("/login");
};

// Parent Gate State
const isGatePassed = ref(false);
const num1 = ref(Math.floor(Math.random() * 5) + 2);
const num2 = ref(Math.floor(Math.random() * 5) + 2);
const userAnswer = ref("");
const gateError = ref(false);

const checkGate = () => {
  if (parseInt(userAnswer.value) === num1.value + num2.value) {
    isGatePassed.value = true;
    gateError.value = false;
  } else {
    gateError.value = true;
    userAnswer.value = "";
    num1.value = Math.floor(Math.random() * 5) + 2;
    num2.value = Math.floor(Math.random() * 5) + 2;
  }
};

const handleManualSync = async () => {
  isSyncing.value = true;
  try {
    // await triggerSync();
  } finally {
    isSyncing.value = false;
  }
};

onUnmounted(async () => {});
</script>

<template>
  <div class="min-h-screen relative flex flex-col items-center">
    <!-- Full-screen Frosted Overlay (Only after gate passed) -->
    <div
      v-if="isGatePassed"
      class="fixed inset-0 bg-white/20 backdrop-blur-md -z-10 animate-in fade-in duration-700"
    ></div>

    <!-- Parent Gate Section (Enhanced Glassmorphism) -->
    <div
      v-if="!isGatePassed"
      class="glass-card w-full max-w-md p-10 flex flex-col items-center gap-8 animate-entrance relative z-20 mt-24 mb-12"
    >
      <div
        class="w-20 h-20 bg-linear-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center text-4xl shadow-lg transform -rotate-6"
      >
        🔒
      </div>
      <div class="text-center space-y-2">
        <h2 class="text-3xl font-black text-slate-800 font-quicksand">
          Area Orang Tua
        </h2>
        <p class="text-slate-500 font-semibold">
          Selesaikan teka-teki kecil ini:
        </p>
      </div>

      <div
        class="text-5xl font-black text-indigo-600 font-quicksand py-6 bg-slate-50 w-full text-center rounded-3xl border-2 border-slate-100 shadow-inner"
      >
        {{ num1 }} + {{ num2 }}
      </div>

      <div class="w-full space-y-4">
        <input
          v-model="userAnswer"
          type="number"
          class="w-full text-center text-4xl font-black p-5 rounded-3xl border-4 border-slate-100 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 focus:outline-none transition-all"
          placeholder="?"
          @keyup.enter="checkGate"
        />
        <p
          v-if="gateError"
          class="text-rose-500 font-black text-center animate-bounce"
        >
          Ups, hitung lagi ya! 🧐
        </p>
      </div>

      <div class="flex gap-4 w-full">
        <button
          @click="goBack"
          class="ui-capsule-interactive bg-white border-slate-200 text-slate-500 flex-1 hover:bg-slate-50"
        >
          Batal
        </button>
        <button
          @click="checkGate"
          class="ui-capsule-interactive bg-indigo-500 border-indigo-600 text-white flex-2 shadow-indigo-200"
        >
          Masuk
        </button>
      </div>
    </div>

    <!-- Main Dashboard (Full Screen Glassy Style) -->
    <div
      v-else
      class="w-full max-w-7xl mx-auto flex flex-col gap-8 p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div
        class="flex items-center justify-between border-b border-slate-200/50 pb-6"
      >
        <div class="flex items-center gap-4">
          <div v-if="session.data?.user?.image" class="relative group">
            <img
              :src="session.data.user.image"
              class="w-16 h-16 rounded-2xl border-4 border-white shadow-md object-cover transform -rotate-3 group-hover:rotate-0 transition-transform"
            />
          </div>
          <div
            v-else
            class="w-16 h-16 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl shadow-sm border border-white"
          >
            👨‍👩‍👧
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2
                class="text-3xl md:text-4xl font-black text-slate-800 font-quicksand"
              >
                Halo, {{ session.data?.user?.name }}
              </h2>
              <button
                @click="logout"
                class="ml-2 text-[10px] md:text-xs font-black text-rose-500 hover:text-rose-600 bg-rose-50 px-2 py-1 rounded-lg transition-colors uppercase tracking-tight"
              >
                Keluar
              </button>
            </div>
            <p class="text-slate-500 font-bold">
              Kelola profil, hadiah, dan tingkat kesulitan.
            </p>
          </div>
        </div>
        <div class="flex gap-3">
          <button
            @click="handleManualSync"
            :disabled="isSyncing"
            class="ui-capsule-interactive bg-white/80 border-slate-200 text-slate-700 w-auto px-6 shadow-sm hover:bg-white disabled:opacity-50"
          >
            <span class="text-xl mr-2">{{ isSyncing ? "⌛" : "☁️" }}</span>
            <span class="font-black text-sm md:text-base hidden sm:inline">{{
              isSyncing ? "Menyinkronkan..." : "Sinkron Awan"
            }}</span>
          </button>
          <button
            @click="goBack"
            class="ui-capsule-interactive bg-emerald-500 border-emerald-600 text-white w-auto px-8 shadow-emerald-200"
          >
            Selesai
          </button>
        </div>
      </div>

      <div
        class="grid grid-cols-4 p-2 bg-white/40 backdrop-blur-md rounded-4xl gap-2 border border-white/50 shadow-sm mb-4"
      >
        <NuxtLink
          to="/parent"
          class="flex flex-col md:flex-row items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs md:text-base transition-all duration-300"
          :class="
            route.path === '/parent'
              ? 'bg-white text-indigo-600 shadow-md scale-[1.02]'
              : 'text-slate-500 hover:bg-white/40'
          "
        >
          <span class="text-xl md:text-2xl">👥</span>
          <span>Anak</span>
        </NuxtLink>
        <NuxtLink
          to="/parent/reward"
          class="flex flex-col md:flex-row items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs md:text-base transition-all duration-300"
          :class="
            route.path === '/parent/reward'
              ? 'bg-white text-amber-600 shadow-md scale-[1.02]'
              : 'text-slate-500 hover:bg-white/40'
          "
        >
          <span class="text-xl md:text-2xl">🎁</span>
          <span>Hadiah</span>
        </NuxtLink>
        <NuxtLink
          to="/parent/analytics"
          class="flex flex-col md:flex-row items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs md:text-base transition-all duration-300"
          :class="
            route.path === '/parent/analytics'
              ? 'bg-white text-emerald-600 shadow-md scale-[1.02]'
              : 'text-slate-500 hover:bg-white/40'
          "
        >
          <span class="text-xl md:text-2xl">📊</span>
          <span>Laporan</span>
        </NuxtLink>
        <NuxtLink
          to="/parent/challenge"
          class="flex flex-col md:flex-row items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs md:text-base transition-all duration-300"
          :class="
            route.path === '/parent/challenge'
              ? 'bg-white text-violet-600 shadow-md scale-[1.02]'
              : 'text-slate-500 hover:bg-white/40'
          "
        >
          <span class="text-xl md:text-2xl">🎮</span>
          <span>Tantangan</span>
        </NuxtLink>
      </div>

      <NuxtPage />
    </div>
  </div>
</template>

<style scoped>
.font-quicksand {
  font-family: "Quicksand", sans-serif;
}
</style>
