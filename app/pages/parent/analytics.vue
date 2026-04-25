<script setup lang="ts">
const profileStore = useProfileStore();
const { activeProfileId, profiles } = storeToRefs(profileStore);
const alphabetStore = useAlphabetStore();
const storybookStore = useStorybookStore();

// Modal state
const isAlphabetModalOpen = ref(false);
const isWordModalOpen = ref(false);

const openAlphabetModal = () => {
  isWordModalOpen.value = false;
  isAlphabetModalOpen.value = true;
};

const openWordModal = () => {
  isAlphabetModalOpen.value = false;
  isWordModalOpen.value = true;
};

// Fetch data on active profile change
watch(
  activeProfileId,
  async (newId) => {
    if (newId) {
      await Promise.all([
        alphabetStore.fetch(),
        storybookStore.loadFromCloud(),
      ]);
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex-1 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
    <div v-if="activeProfileId" class="space-y-6">
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-black text-slate-800">
          Laporan:
          {{ profiles.find((p: any) => p.id === activeProfileId)?.name }}
        </h3>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-12">
        <!-- Card: Alphabet Analytics -->
        <button
          @click="openAlphabetModal"
          class="group relative bg-white/70 backdrop-blur-md rounded-[2.5rem] border-4 border-white p-8 text-left transition-all hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
        >
          <div
            class="absolute -top-10 -right-10 w-40 h-40 bg-indigo-100 rounded-full blur-3xl group-hover:bg-indigo-200 transition-colors"
          ></div>
          <div class="relative z-10 flex flex-col gap-6">
            <div
              class="w-16 h-16 rounded-2xl bg-indigo-500 text-white flex items-center justify-center text-3xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform"
            >
              <Icon name="lucide:case-sensitive" />
            </div>
            <div>
              <h4 class="text-2xl font-black text-slate-800 font-quicksand">Progres Huruf</h4>
              <p class="text-slate-500 font-bold mt-1">
                Lihat detail tantangan, progres buku cerita, dan huruf yang sulit.
              </p>
            </div>
            <div class="flex items-center gap-2 text-indigo-600 font-black">
              <span>Buka Laporan</span>
              <Icon name="lucide:arrow-right" class="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>

        <!-- Card: Word Analytics -->
        <button
          @click="openWordModal"
          class="group relative bg-white/70 backdrop-blur-md rounded-[2.5rem] border-4 border-white p-8 text-left transition-all hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
        >
          <div
            class="absolute -top-10 -right-10 w-40 h-40 bg-rose-100 rounded-full blur-3xl group-hover:bg-rose-200 transition-colors"
          ></div>
          <div class="relative z-10 flex flex-col gap-6">
            <div
              class="w-16 h-16 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-3xl shadow-lg shadow-rose-200 group-hover:scale-110 transition-transform"
            >
              <Icon name="lucide:book-open" />
            </div>
            <div>
              <h4 class="text-2xl font-black text-slate-800 font-quicksand">Progres Kata</h4>
              <p class="text-slate-500 font-bold mt-1">
                Analisis penguasaan kosa kata dan kata-kata yang sering keliru.
              </p>
            </div>
            <div class="flex items-center gap-2 text-rose-600 font-black">
              <span>Buka Laporan</span>
              <Icon name="lucide:arrow-right" class="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>
      </div>

      <!-- Modals -->
      <ParentAlphabetAnalyticsModal
        :is-open="isAlphabetModalOpen"
        @close="isAlphabetModalOpen = false"
        @switch-to-word="openWordModal"
      />

      <ParentWordAnalyticsModal
        :is-open="isWordModalOpen"
        @close="isWordModalOpen = false"
        @switch-to-alphabet="openAlphabetModal"
      />
    </div>
    <div v-else class="text-center py-12">
      <div class="bg-slate-50 p-12 rounded-[3rem] border-4 border-dashed border-slate-100 inline-block px-20">
        <Icon name="lucide:hand" class="text-6xl mb-4 block mx-auto text-amber-400" />
        <p class="text-slate-500 font-black text-xl font-quicksand">Silakan pilih profil anak...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-quicksand {
  font-family: "Quicksand", sans-serif;
}
</style>
