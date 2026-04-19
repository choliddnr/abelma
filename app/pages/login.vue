<script setup lang="ts">
import { authClient } from "~/utils/auth-client";
const session = authClient.useSession();

const username = ref("wadidaw");
const password = ref("12341234");
const isPending = ref(false);
const error = ref("");

const loginWithGoogle = async () => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/welcome",
  });
};

const loginWithUsername = async () => {
  if (!username.value || !password.value) {
    error.value = "Username dan password harus diisi";
    return;
  }

  isPending.value = true;
  error.value = "";

  try {
    const { data, error: authError } = await authClient.signIn.username({
      username: username.value,
      password: password.value,
      callbackURL: "/welcome",
    });

    if (authError) {
      error.value = authError.message || "Gagal masuk. Cek username/password.";
    } else {
      await navigateTo("/welcome");
    }
  } catch (err) {
    error.value = "Terjadi kesalahan sistem.";
    console.error(err);
  } finally {
    isPending.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12">
    <div
      class="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-4xl shadow-2xl p-8 md:p-12 border border-white/50 flex flex-col items-center gap-8 relative overflow-hidden"
    >
      <!-- Decorative background inside the card -->
      <div
        class="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-2xl"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-32 h-32 bg-secondary/20 rounded-full -ml-16 -mb-16 blur-2xl"
      ></div>

      <div class="z-10 text-center space-y-2">
        <h2 class="text-4xl font-black text-[#5C4D00]">Selamat Datang!</h2>
        <p class="text-lg font-bold text-[#8B7700]">Masuk untuk menyimpan kemajuan belajarmu</p>
      </div>

      <div class="z-10 w-full space-y-6">
        <div
          v-if="error"
          class="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 animate-shake"
        >
          {{ error }}
        </div>

        <!-- Username Form -->
        <div class="space-y-4">
          <div class="space-y-2">
            <input
              v-model="username"
              type="text"
              placeholder="Username"
              class="w-full bg-white/50 border-2 border-gray-100 focus:border-primary px-6 py-4 rounded-2xl outline-none transition-all font-bold text-gray-700"
              @keyup.enter="loginWithUsername"
            />
          </div>
          <div class="space-y-2">
            <input
              v-model="password"
              type="password"
              placeholder="Kata Sandi"
              class="w-full bg-white/50 border-2 border-gray-100 focus:border-primary px-6 py-4 rounded-2xl outline-none transition-all font-bold text-gray-700"
              @keyup.enter="loginWithUsername"
            />
          </div>
          <button
            @click="loginWithUsername"
            :disabled="isPending"
            class="w-full bg-primary hover:bg-primary-dark text-black font-black py-4 px-6 rounded-2xl shadow-lg border-b-4 border-black/10 transform active:translate-y-1 transition-all disabled:opacity-50"
          >
            <span v-if="isPending">Sabar ya...</span>
            <span v-else>Masuk Sekarang</span>
          </button>
        </div>

        <div class="relative py-2 flex items-center gap-4 text-gray-300 font-bold">
          <div class="flex-1 border-t-2 border-gray-100"></div>
          <span class="text-xs uppercase">atau</span>
          <div class="flex-1 border-t-2 border-gray-100"></div>
        </div>

        <button
          @click="loginWithGoogle"
          :disabled="session.isPending"
          class="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 px-6 rounded-2xl shadow-md border border-gray-200 flex items-center justify-center gap-4 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <svg class="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span v-if="session.isPending">Sedang diproses...</span>
          <span v-else>Masuk dengan Google</span>
        </button>

        <div class="text-center space-y-4">
          <p class="text-sm font-bold text-[#8B7700]">
            Belum punya akun?
            <NuxtLink to="/signup" class="text-[#5C4D00] hover:underline"
              >Daftar petualang baru</NuxtLink
            >
          </p>

          <NuxtLink
            to="/"
            class="block text-center text-[#8B7700] font-bold hover:text-[#5C4D00] transition-colors"
          >
            Nanti saja, lanjut bermain
          </NuxtLink>
        </div>
      </div>

      <div class="z-10 pt-4 text-center">
        <p class="text-xs text-gray-400 font-medium">Dibuat dengan ❤️ untuk anak-anak Indonesia</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}
</style>
