<script setup lang="ts">
import type { QuizLevelConfig } from "@/types/stores";

const { activeProfileId } = storeToRefs(useProfileStore());
const { alphabetQuizProgress } = storeToRefs(useAlphabetStore());
const { saveConfig, fetch } = useAlphabetStore();
const settingsStore = useSettingsStore();
const { settings: wordSettings } = storeToRefs(settingsStore);

const { wordQuizProgress } = storeToRefs(useWordStore());
const { fetch: fetchWordProgress } = useWordStore();

const { cvcProgress } = storeToRefs(useCvcStore());
const { fetch: fetchCvcProgress } = useCvcStore();

const { ddvProgress } = storeToRefs(useDdvStore());
const { fetch: fetchDdvProgress } = useDdvStore();

callOnce(async () => {
  await Promise.all([
    fetch(),
    fetchWordProgress(),
    fetchCvcProgress(),
    fetchDdvProgress(),
  ]);
});

// Modal state
const isAlphabetModalOpen = ref(false);
const isWordModalOpen = ref(false);
const isCvcModalOpen = ref(false);
const isDdvModalOpen = ref(false);

const openAlphabetModal = () => {
  isWordModalOpen.value = false;
  isCvcModalOpen.value = false;
  isDdvModalOpen.value = false;
  isAlphabetModalOpen.value = true;
};

const openWordModal = () => {
  isAlphabetModalOpen.value = false;
  isCvcModalOpen.value = false;
  isDdvModalOpen.value = false;
  isWordModalOpen.value = true;
};

const openCvcModal = () => {
  isAlphabetModalOpen.value = false;
  isWordModalOpen.value = false;
  isDdvModalOpen.value = false;
  isCvcModalOpen.value = true;
};

const openDdvModal = () => {
  isAlphabetModalOpen.value = false;
  isWordModalOpen.value = false;
  isCvcModalOpen.value = false;
  isDdvModalOpen.value = true;
};
</script>

<template>
  <div class="flex-1 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-xl font-black text-slate-800">Pengaturan Belajar</h3>
        <p class="text-sm font-semibold text-slate-700 mt-1">
          Pilih kategori yang ingin disesuaikan.
        </p>
      </div>
    </div>

    <div
      v-if="!activeProfileId"
      class="bg-slate-50 p-8 rounded-3xl text-center text-slate-400 font-bold"
    >
      Pilih profil anak terlebih dahulu.
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-12">
      <!-- Card: Alphabet Settings -->
      <button
        @click="openAlphabetModal"
        class="group relative bg-white/70 backdrop-blur-md rounded-[2.5rem] border-4 border-white p-8 text-left transition-all hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
      >
        <div
          class="absolute -top-10 -right-10 w-40 h-40 bg-sky-100 rounded-full blur-3xl group-hover:bg-sky-200 transition-colors"
        ></div>
        <div class="relative z-10 flex flex-col gap-6">
            <div
              class="w-16 h-16 rounded-2xl bg-sky-500 text-white flex items-center justify-center text-3xl shadow-lg shadow-sky-200 group-hover:scale-110 transition-transform"
            >
              <Icon name="lucide:case-sensitive" />
            </div>
          <div>
            <h4 class="text-2xl font-black text-slate-800 font-quicksand">Tantangan Huruf</h4>
            <p class="text-slate-500 font-bold mt-1">
              Atur target bobot, timer, dan hadiah koin untuk setiap level.
            </p>
          </div>
            <div class="flex items-center gap-2 text-sky-600 font-black">
              <span>Buka Pengaturan</span>
              <Icon name="lucide:arrow-right" class="group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
      </button>

      <!-- Card: Word Settings -->
      <button
        @click="openWordModal"
        class="group relative bg-white/70 backdrop-blur-md rounded-[2.5rem] border-4 border-white p-8 text-left transition-all hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
      >
        <div
          class="absolute -top-10 -right-10 w-40 h-40 bg-violet-100 rounded-full blur-3xl group-hover:bg-violet-200 transition-colors"
        ></div>
        <div class="relative z-10 flex flex-col gap-6">
            <div
              class="w-16 h-16 rounded-2xl bg-violet-500 text-white flex items-center justify-center text-3xl shadow-lg shadow-violet-200 group-hover:scale-110 transition-transform"
            >
              <Icon name="lucide:book-open" />
            </div>
          <div>
            <h4 class="text-2xl font-black text-slate-800 font-quicksand">Belajar Kata</h4>
            <p class="text-slate-500 font-bold mt-1">
              Sesuaikan gaya tulisan (KAPITAL/kecil) dan batas waktu kuis.
            </p>
          </div>
            <div class="flex items-center gap-2 text-violet-600 font-black">
              <span>Buka Pengaturan</span>
              <Icon name="lucide:arrow-right" class="group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
      </button>

      <!-- Card: CVC Settings -->
      <button
        @click="openCvcModal"
        class="group relative bg-white/70 backdrop-blur-md rounded-[2.5rem] border-4 border-white p-8 text-left transition-all hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
      >
        <div
          class="absolute -top-10 -right-10 w-40 h-40 bg-indigo-100 rounded-full blur-3xl group-hover:bg-indigo-200 transition-colors"
        ></div>
        <div class="relative z-10 flex flex-col gap-6">
            <div
              class="w-16 h-16 rounded-2xl bg-indigo-500 text-white flex items-center justify-center text-3xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform"
            >
              <Icon name="lucide:flask-conical" />
            </div>
          <div>
            <h4 class="text-2xl font-black text-slate-800 font-quicksand">Lab Kata (CVC)</h4>
            <p class="text-slate-500 font-bold mt-1">
              Atur hadiah koin, bonus naik level, dan sistem streak untuk Lab Kata.
            </p>
          </div>
            <div class="flex items-center gap-2 text-indigo-600 font-black">
              <span>Buka Pengaturan</span>
              <Icon name="lucide:arrow-right" class="group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
      </button>

      <!-- Card: DDV Settings -->
      <button
        @click="openDdvModal"
        class="group relative bg-white/70 backdrop-blur-md rounded-[2.5rem] border-4 border-white p-8 text-left transition-all hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
      >
        <div
          class="absolute -top-10 -right-10 w-40 h-40 bg-teal-100 rounded-full blur-3xl group-hover:bg-teal-200 transition-colors"
        ></div>
        <div class="relative z-10 flex flex-col gap-6">
            <div
              class="w-16 h-16 rounded-2xl bg-teal-500 text-white flex items-center justify-center text-3xl shadow-lg shadow-teal-200 group-hover:scale-110 transition-transform"
            >
              <Icon name="lucide:puzzle" />
            </div>
          <div>
            <h4 class="text-2xl font-black text-slate-800 font-quicksand">Vokal Rangkap</h4>
            <p class="text-slate-500 font-bold mt-1">
              Atur hadiah koin untuk diftong, cluster, dan sistem streak Vokal Rangkap.
            </p>
          </div>
            <div class="flex items-center gap-2 text-teal-600 font-black">
              <span>Buka Pengaturan</span>
              <Icon name="lucide:arrow-right" class="group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
      </button>
    </div>

    <!-- Modals -->
    <ParentAlphabetSettingsModal
      :is-open="isAlphabetModalOpen"
      @close="isAlphabetModalOpen = false"
      @switch-to-word="openWordModal"
    />

    <ParentWordSettingsModal
      :is-open="isWordModalOpen"
      @close="isWordModalOpen = false"
      @switch-to-alphabet="openAlphabetModal"
    />

    <ParentCvcSettingsModal
      :is-open="isCvcModalOpen"
      @close="isCvcModalOpen = false"
      @switch-to-word="openWordModal"
    />

    <ParentDdvSettingsModal
      :is-open="isDdvModalOpen"
      @close="isDdvModalOpen = false"
      @switch-to-cvc="openCvcModal"
    />
  </div>
</template>

<style scoped>
.font-quicksand {
  font-family: "Quicksand", sans-serif;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
