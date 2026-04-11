<script setup lang="ts">
import { authClient } from "~/utils/auth-client";
import { ref, watch } from "vue";

const username = ref("");
const password = ref("");
const isPending = ref(false);
const error = ref("");
const isUsernameAvailable = ref<boolean | null>(null);
const isValidatingUsername = ref(false);

// Real-time username availability check
let debounceTimer: any;
watch(username, (newVal) => {
  if (newVal.length < 3) {
    isUsernameAvailable.value = null;
    return;
  }

  isValidatingUsername.value = true;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    try {
      const { data } = await authClient.isUsernameAvailable({
        username: newVal,
      });
      isUsernameAvailable.value = data?.available ?? false;
    } catch (err) {
      console.error("Error checking username availability", err);
    } finally {
      isValidatingUsername.value = false;
    }
  }, 500);
});

const signUp = async () => {
  if (!username.value || !password.value) {
    error.value = "Username dan password harus diisi";
    return;
  }

  if (isUsernameAvailable.value === false) {
    error.value = "Username sudah digunakan";
    return;
  }

  isPending.value = true;
  error.value = "";

  try {
    const { data, error: authError } = await authClient.signUp.email({
      email: `${username.value}@abelma.local`, // Dummy email to satisfy schema if needed
      password: password.value,
      username: username.value,
      name: username.value, // Default name to username
      callbackURL: "/welcome",
    });

    if (authError) {
      error.value = authError.message || "Gagal mendaftar. Silakan coba lagi.";
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
  <div class="flex flex-col items-center justify-center min-h-[70vh] px-4 py-8">
    <div
      class="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-4xl shadow-2xl p-8 md:p-12 border border-white/50 flex flex-col items-center gap-8 relative overflow-hidden"
    >
      <!-- Decorative background -->
      <div
        class="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-2xl"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-32 h-32 bg-secondary/20 rounded-full -ml-16 -mb-16 blur-2xl"
      ></div>

      <div class="z-10 text-center space-y-2">
        <h2 class="text-4xl font-black text-[#5C4D00]">Daftar Akun</h2>
        <p class="text-lg font-bold text-[#8B7700]">Petualangan barumu dimulai di sini!</p>
      </div>

      <div class="z-10 w-full space-y-4">
        <div
          v-if="error"
          class="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 mb-4 animate-shake"
        >
          {{ error }}
        </div>

        <div class="space-y-2">
          <label for="username" class="text-sm font-black text-[#5C4D00] ml-2"
            >Pilih Username</label
          >
          <div class="relative">
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Contoh: jagoan_kecil"
              class="w-full bg-white/50 border-2 border-[#E5E7EB] focus:border-primary px-6 py-4 rounded-2xl outline-none transition-all font-bold text-gray-700"
              :class="{
                'border-red-300': isUsernameAvailable === false,
                'border-green-300': isUsernameAvailable === true,
              }"
              @keyup.enter="signUp"
            />
            <div class="absolute right-4 top-1/2 -translate-y-1/2">
              <div
                v-if="isValidatingUsername"
                class="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"
              ></div>
              <span v-else-if="isUsernameAvailable === true" class="text-green-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              <span v-else-if="isUsernameAvailable === false" class="text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </span>
            </div>
          </div>
          <p v-if="isUsernameAvailable === false" class="text-xs text-red-500 font-bold ml-2">
            Yah, username ini sudah diambil teman lain.
          </p>
        </div>

        <div class="space-y-2">
          <label for="password" class="text-sm font-black text-[#5C4D00] ml-2">Kata Sandi</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Rahasia..."
            class="w-full bg-white/50 border-2 border-[#E5E7EB] focus:border-primary px-6 py-4 rounded-2xl outline-none transition-all font-bold text-gray-700"
            @keyup.enter="signUp"
          />
        </div>

        <button
          @click="signUp"
          :disabled="isPending || isValidatingUsername"
          class="w-full mt-4 bg-primary hover:bg-primary-dark text-black font-black py-4 px-6 rounded-2xl shadow-lg border-b-4 border-black/20 transform active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xl"
        >
          <span v-if="isPending">Sedang Mendaftar...</span>
          <span v-else>Mulai Petualangan! 🚀</span>
        </button>

        <div class="text-center pt-4">
          <p class="text-sm font-bold text-[#8B7700]">
            Sudah punya akun?
            <NuxtLink to="/login" class="text-[#5C4D00] hover:underline">Masuk di sini</NuxtLink>
          </p>
        </div>
      </div>

      <div class="z-10 pt-4 text-center">
        <p class="text-xs text-gray-400 font-medium">Dibuat dengan ❤️ untuk anak-anak Indonesia</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bubble-bg {
  mask-image: radial-gradient(circle, white, transparent);
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
