<script setup lang="ts">
const profileStore = useProfileStore();
const { profiles, isLoaded } = storeToRefs(profileStore);
const { changeProfile, fetchProfiles } = profileStore;

// Ensure profiles are loaded if they aren't already
onMounted(async () => {
  if (!isLoaded.value) {
    await fetchProfiles();
  }
});

const handleSelectProfile = async (id: string) => {
  await changeProfile(id);
  navigateTo("/");
};
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-indigo-50/30">
    <!-- Animated background elements -->
    <div class="absolute top-[-10%] left-[-10%] w-64 h-64 bg-yellow-200/30 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>

    <div class="w-full max-w-4xl z-10">
      <!-- Header -->
      <div class="text-center mb-12 space-y-4">
        <h1 class="text-4xl md:text-5xl font-black text-indigo-600 font-quicksand drop-shadow-sm">
          Siapa yang mau belajar hari ini?
        </h1>
        <p class="text-xl text-slate-500 font-bold font-quicksand">
          Pilih profilmu untuk memulai petualangan!
        </p>
      </div>

      <!-- Profiles Grid -->
      <div v-if="isLoaded" class="flex flex-wrap justify-center gap-8 md:gap-12">
        <div
          v-for="p in profiles"
          :key="p.id"
          class="group flex flex-col items-center space-y-4 cursor-pointer"
          @click="handleSelectProfile(p.id)"
        >
          <div
            class="relative w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] md:rounded-[3.5rem] bg-white shadow-xl border-8 border-white group-hover:border-indigo-400 group-hover:scale-110 transition-all duration-300 flex items-center justify-center text-6xl md:text-8xl overflow-hidden"
          >
            <!-- Avatar -->
            <span class="transform group-hover:rotate-12 transition-transform duration-300">
              {{ p.avatar }}
            </span>
            
            <!-- Hover Overlay -->
            <div class="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors duration-300 flex items-center justify-center">
              <Icon name="lucide:play" class="text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300 w-12 h-12" />
            </div>
          </div>
          
          <span class="text-2xl md:text-3xl font-black text-slate-700 group-hover:text-indigo-600 transition-colors font-quicksand">
            {{ p.name }}
          </span>
        </div>

        <!-- Add Profile Button -->
        <NuxtLink
          to="/welcome"
          class="group flex flex-col items-center space-y-4 cursor-pointer"
        >
          <div
            class="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] md:rounded-[3.5rem] bg-slate-100 border-8 border-dashed border-slate-300 group-hover:border-indigo-400 group-hover:bg-indigo-50 transition-all duration-300 flex items-center justify-center"
          >
            <Icon name="lucide:plus" class="w-16 h-16 md:w-24 md:h-24 text-slate-400 group-hover:text-indigo-400 transform group-hover:rotate-90 transition-all duration-500" />
          </div>
          <span class="text-xl md:text-2xl font-black text-slate-400 group-hover:text-indigo-400 transition-colors font-quicksand">
            Tambah Profil
          </span>
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-else class="flex justify-center py-20">
        <LoadingSpinner size="lg" color="indigo" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-quicksand {
  font-family: "Quicksand", sans-serif;
}
</style>
