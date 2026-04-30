<script setup lang="ts">
const { profiles, isLoaded } = storeToRefs(useProfileStore());
const { addProfile, fetchProfiles } = useProfileStore();

if (!isLoaded.value) {
  await fetchProfiles();
}

if (isLoaded.value && profiles.value.length > 0) {
  navigateTo("/profiles");
}

const newProfileName = ref("");
const selectedAvatar = ref("👦");
const avatars = ["👦", "👧", "🧒", "👶", "🐱", "🐶", "🦄", "🦁"];
const isCreating = ref(false);

const handleCreateFirstProfile = async () => {
  if (!newProfileName.value.trim()) return;

  isCreating.value = true;
  try {
    await $fetch("/api/profile", {
      method: "POST",
      body: {
        name: newProfileName.value.trim(),
        avatar: selectedAvatar.value,
      },
      onResponse: ({ response }) => {
        if (response.ok) {
          addProfile(response._data);
          navigateTo("/");
        }
      },
    });
  } catch (e) {
    console.error("Failed to create initial profile", e);
  } finally {
    isCreating.value = false;
  }
};

// If profiles already exist, don't stay here
// onMounted(() => {
//   if (isLoaded.value && profiles.value.length > 0) {
//     router.push("/");
//   }
// });

// // Watch isLoaded to push user out if profiles are found after an async sync
// watch(
//   () => isLoaded.value,
//   (loaded) => {
//     if (loaded && profiles.value.length > 0) {
//       router.push("/");
//     }
//   },
// );
onBeforeMount(() => {
  console.log("before mounted", isLoaded.value, profiles.value);
});
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6 relative">
    <!-- Visual Backdrop -->
    <div class="fixed inset-0 bg-linear-to-b from-indigo-50/50 to-white -z-10"></div>

    <div class="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
      <!-- Welcome Header -->
      <div class="text-center mb-6 lg:mb-8 space-y-3">
        <div
          class="inline-flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 bg-white rounded-[2.5rem] shadow-xl border-4 border-indigo-100 mb-2 lg:mb-4 animate-bounce"
        >
          <span class="text-4xl lg:text-5xl">👋</span>
        </div>
        <h1 class="text-3xl lg:text-4xl font-black text-slate-800 font-quicksand">Selamat Datang!</h1>
        <p class="text-slate-500 font-bold text-base lg:text-lg">
          Mari buat profil si kecil untuk mulai belajar & bermain.
        </p>
      </div>

      <!-- Creation Card -->
      <div
        class="bg-white/90 backdrop-blur-xl rounded-[2.5rem] lg:rounded-[3rem] p-8 lg:p-10 shadow-2xl border border-white space-y-6 lg:space-y-8 relative overflow-hidden"
      >
        <div
          v-if="isCreating"
          class="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center animate-in fade-in duration-300"
        >
          <div
            class="w-16 h-16 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"
          ></div>
          <p class="font-black text-indigo-600">Menyiapkan profil...</p>
        </div>

        <!-- Name Input -->
        <div class="space-y-3">
          <label class="block text-sm font-black text-slate-400 uppercase tracking-widest ml-2"
            >Nama Panggilan</label
          >
          <input
            v-model="newProfileName"
            type="text"
            placeholder="Misal: Andi, Susi..."
            class="w-full p-6 rounded-3xl border-4 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-indigo-400 focus:ring-8 focus:ring-indigo-50/50 focus:outline-none transition-all font-black text-2xl text-slate-700 placeholder:text-slate-200"
            @keyup.enter="handleCreateFirstProfile"
          />
        </div>

        <!-- Avatar Choice -->
        <div class="space-y-4">
          <label class="block text-sm font-black text-slate-400 uppercase tracking-widest ml-2"
            >Pilih Avatar</label
          >
          <div class="grid grid-cols-4 gap-3">
            <UiButton
              v-for="a in avatars"
              :key="a"
              @click="selectedAvatar = a"
              variant="none"
              class="aspect-square rounded-2xl border-4 flex items-center justify-center text-4xl transition-all hover:scale-105 active:scale-95 px-0 py-0"
              :class="
                selectedAvatar === a
                  ? 'bg-indigo-50 border-indigo-400 shadow-lg scale-110 z-10'
                  : 'bg-white border-slate-50 hover:border-slate-100'
              "
            >
              {{ a }}
            </UiButton>
          </div>
        </div>

        <!-- Action Button -->
        <UiButton
          @click="handleCreateFirstProfile"
          :disabled="!newProfileName.trim() || isCreating"
          :loading="isCreating"
          variant="accent"
          class="w-full py-6 text-xl shadow-xl shadow-indigo-100 mt-4"
          icon="lucide:rocket"
          icon-position="right"
        >
          Mulai Petualangan
        </UiButton>
      </div>

      <p class="text-center mt-8 text-slate-400 font-bold text-sm">
        Tenang, Ayah/Bunda bisa menambah atau mengubah profil nanti di Area Orang Tua.
      </p>
    </div>
  </div>
</template>

<style scoped>
.font-quicksand {
  font-family: "Quicksand", sans-serif;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce 2s infinite ease-in-out;
}
</style>
