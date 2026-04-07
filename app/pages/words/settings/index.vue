<script setup lang="ts">
defineOptions({ name: 'SettingsIndex' })
const router = useRouter()
const settingsStore = useSettingsStore()
const goBack = () => router.push('/words')
</script>

<template>
  <div class="min-h-screen flex flex-col items-center p-4 pt-12">
    <!-- Actual Settings Section (Animated) -->
    <div class="glass-card w-full max-w-2xl p-8 flex flex-col gap-8 animate-entrance">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 class="text-3xl font-black text-slate-800 font-quicksand flex items-center gap-3">
                <span class="text-4xl">⚙️</span> Pengaturan Belajar
            </h2>
            <button @click="goBack" class="ui-capsule-interactive bg-emerald-500 border-emerald-600 text-white w-auto px-6 shadow-lg shadow-emerald-100">Selesai</button>
        </div>

        <!-- Setting: Letter Case -->
        <div class="flex flex-col gap-4">
            <h3 class="font-black text-xl text-slate-700 flex items-center gap-2">
                <span class="opacity-70 text-2xl">🔡</span> Gaya Tulisan
            </h3>
            <div class="flex gap-4">
                <button 
                    @click="settingsStore.settings.letterCase = 'uppercase'"
                    class="flex-1 p-6 rounded-3xl border-4 transition-all flex flex-col items-center gap-2"
                    :class="settingsStore.settings.letterCase === 'uppercase' ? 'bg-indigo-50 border-indigo-500 shadow-md' : 'bg-white border-slate-100 opacity-60 hover:opacity-100'"
                >
                    <span class="text-4xl font-black font-quicksand text-indigo-600">ABC</span>
                    <span class="font-bold text-slate-600">Huruf Kapital</span>
                </button>
                <button 
                    @click="settingsStore.settings.letterCase = 'lowercase'"
                    class="flex-1 p-6 rounded-3xl border-4 transition-all flex flex-col items-center gap-2"
                    :class="settingsStore.settings.letterCase === 'lowercase' ? 'bg-indigo-50 border-indigo-500 shadow-md' : 'bg-white border-slate-100 opacity-60 hover:opacity-100'"
                >
                    <span class="text-4xl font-black font-quicksand text-indigo-600">abc</span>
                    <span class="font-bold text-slate-600">Huruf Kecil</span>
                </button>
            </div>
        </div>

        <!-- Setting: Timer Speed -->
        <div class="flex flex-col gap-4">
            <h3 class="font-black text-xl text-slate-700 flex items-center gap-2">
                <span class="opacity-70 text-2xl">⏳</span> Waktu Menjawab (Kuis)
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                    @click="settingsStore.settings.timerDuration = 60"
                    class="p-4 rounded-2xl border-4 transition-all font-bold"
                    :class="settingsStore.settings.timerDuration === 60 ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-md' : 'bg-white border-slate-100 opacity-60 hover:opacity-100'"
                >
                    Lambat (60s)
                </button>
                <button 
                    @click="settingsStore.settings.timerDuration = 30"
                    class="p-4 rounded-2xl border-4 transition-all font-bold"
                    :class="settingsStore.settings.timerDuration === 30 ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md' : 'bg-white border-slate-100 opacity-60 hover:opacity-100'"
                >
                    Normal (30s)
                </button>
                <button 
                    @click="settingsStore.settings.timerDuration = 0"
                    class="p-4 rounded-2xl border-4 transition-all font-bold"
                    :class="settingsStore.settings.timerDuration === 0 ? 'bg-slate-50 border-slate-500 text-slate-700 shadow-md' : 'bg-white border-slate-100 opacity-60 hover:opacity-100'"
                >
                    Tanpa Waktu
                </button>
            </div>
        </div>

        <div class="mt-4 p-4 bg-amber-50 rounded-2xl border-2 border-amber-100 text-amber-800 text-sm leading-relaxed">
            <strong>💡 Tips:</strong> Gunakan Huruf Kecil jika anak sudah mulai belajar membaca buku cerita, dan gunakan Huruf Kapital untuk pengenalan awal yang lebih mudah bagi mata anak.
        </div>
    </div>

  </div>
</template>

<style scoped>
.font-quicksand {
    font-family: 'Quicksand', sans-serif;
}
</style>

