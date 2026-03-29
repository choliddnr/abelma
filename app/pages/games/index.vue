<script setup lang="ts">
const router = useRouter()
const goBack = () => router.push('/')
</script>

<template>
  <div class="flex flex-col items-center gap-12">
    <div class="w-full flex justify-start">
      <button @click="goBack" class="btn-accent px-6 py-3 text-xl">
        ← Kembali
      </button>
    </div>

    <div class="glass-card p-20 text-center space-y-8">
      <div class="text-9xl animate-bounce">🎮</div>
      <h1 class="text-6xl font-black text-[#634E00]">Segera Hadir!</h1>
      <p class="text-2xl font-bold text-gray-500">
        Halaman Permainan sedang dalam tahap pengembangan.
      </p>
      <button @click="goBack" class="btn-primary">
        Kembali ke Beranda
      </button>
    </div>
  </div>
</template>

