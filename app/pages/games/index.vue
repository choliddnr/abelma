<script setup lang="ts">
defineOptions({ name: "GamesIndex" });
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col p-4 md:p-8">
    <div class="w-full max-w-5xl mx-auto">
      <h1 class="text-3xl md:text-5xl font-black text-amber-500 drop-shadow-sm font-quicksand mb-8">
        Pilih Permainan
      </h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Memory Match -->
        <NuxtLink
          to="/games/memory"
          class="glass-card p-6 rounded-[3rem] border-4 border-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex flex-col items-center text-center group"
        >
          <div
            class="text-6xl md:text-8xl mb-4 group-hover:scale-110 transition-transform duration-300"
          >
            🧠
          </div>
          <h2 class="text-2xl md:text-3xl font-black text-slate-800 mb-2 font-quicksand">
            Memory Match
          </h2>
          <p class="text-slate-500 font-bold text-sm md:text-base">
            Cari pasangan kartu yang cocok
          </p>
          <span
            class="mt-4 px-4 py-2 bg-amber-500 text-white rounded-full font-black text-sm shadow-md group-hover:bg-amber-600 transition-colors"
          >
            Main Sekarang
          </span>
        </NuxtLink>

        <!-- Word Scramble -->
        <NuxtLink
          to="/games/word-scramble"
          class="glass-card p-6 rounded-[3rem] border-4 border-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex flex-col items-center text-center group"
        >
          <div
            class="text-6xl md:text-8xl mb-4 group-hover:scale-110 transition-transform duration-300"
          >
            🔤
          </div>
          <h2 class="text-2xl md:text-3xl font-black text-slate-800 mb-2 font-quicksand">
            Word Scramble
          </h2>
          <p class="text-slate-500 font-bold text-sm md:text-base">Susun huruf menjadi kata</p>
          <span
            class="mt-4 px-4 py-2 bg-amber-500 text-white rounded-full font-black text-sm shadow-md group-hover:bg-amber-600 transition-colors"
          >
            Main Sekarang
          </span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-quicksand {
  font-family: "Quicksand", sans-serif;
}
</style>
