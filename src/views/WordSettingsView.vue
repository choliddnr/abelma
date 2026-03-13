<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { wordSettings } from '@/utils/wordSettings'

const router = useRouter()
const goBack = () => router.push('/words')

// Parent Gate State
const isGatePassed = ref(false)
const num1 = ref(Math.floor(Math.random() * 5) + 2)
const num2 = ref(Math.floor(Math.random() * 5) + 2)
const userAnswer = ref('')
const gateError = ref(false)

const checkGate = () => {
    if (parseInt(userAnswer.value) === num1.value + num2.value) {
        isGatePassed.value = true
        gateError.value = false
    } else {
        gateError.value = true
        userAnswer.value = ''
        // Generate new question
        num1.value = Math.floor(Math.random() * 5) + 2
        num2.value = Math.floor(Math.random() * 5) + 2
    }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
    
    <!-- Parent Gate Section -->
    <div v-if="!isGatePassed" class="glass-card w-full max-w-md p-8 flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
        <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-3xl mb-2">🔒</div>
        <h2 class="text-2xl font-black text-slate-800 text-center font-quicksand">Area Orang Tua</h2>
        <p class="text-slate-600 text-center">Selesaikan soal ini untuk masuk ke pengaturan:</p>
        
        <div class="text-4xl font-black text-indigo-600 font-quicksand py-4">
            {{ num1 }} + {{ num2 }} = ?
        </div>
        
        <input v-model="userAnswer" type="number" 
            class="w-full text-center text-3xl font-black p-4 rounded-2xl border-4 border-slate-200 focus:border-indigo-400 focus:outline-none transition-all"
            placeholder="..."
            @keyup.enter="checkGate"
        />
        
        <p v-if="gateError" class="text-rose-500 font-bold animate-bounce">Ups, coba lagi ya!</p>
        
        <div class="flex gap-4 w-full mt-4">
            <button @click="goBack" class="ui-capsule-interactive bg-white border-slate-200 text-slate-600 flex-1">Batal</button>
            <button @click="checkGate" class="ui-capsule-interactive bg-indigo-500 border-indigo-600 text-white flex-2">Masuk</button>
        </div>
    </div>

    <!-- Actual Settings Section -->
    <div v-else class="glass-card w-full max-w-2xl p-8 flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-500">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 class="text-3xl font-black text-slate-800 font-quicksand flex items-center gap-3">
                <span class="text-4xl">⚙️</span> Pengaturan Belajar
            </h2>
            <button @click="goBack" class="ui-capsule-interactive bg-emerald-500 border-emerald-600 text-white w-auto px-6">Selesai</button>
        </div>

        <!-- Setting: Letter Case -->
        <div class="flex flex-col gap-4">
            <h3 class="font-black text-xl text-slate-700 flex items-center gap-2">
                <span class="opacity-70 text-2xl">🔡</span> Gaya Tulisan
            </h3>
            <div class="flex gap-4">
                <button 
                    @click="wordSettings.letterCase = 'uppercase'"
                    class="flex-1 p-6 rounded-3xl border-4 transition-all flex flex-col items-center gap-2"
                    :class="wordSettings.letterCase === 'uppercase' ? 'bg-indigo-50 border-indigo-500 shadow-md' : 'bg-white border-slate-100 opacity-60 hover:opacity-100'"
                >
                    <span class="text-4xl font-black font-quicksand text-indigo-600">ABC</span>
                    <span class="font-bold text-slate-600">Huruf Kapital</span>
                </button>
                <button 
                    @click="wordSettings.letterCase = 'lowercase'"
                    class="flex-1 p-6 rounded-3xl border-4 transition-all flex flex-col items-center gap-2"
                    :class="wordSettings.letterCase === 'lowercase' ? 'bg-indigo-50 border-indigo-500 shadow-md' : 'bg-white border-slate-100 opacity-60 hover:opacity-100'"
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
                    @click="wordSettings.timerDuration = 60"
                    class="p-4 rounded-2xl border-4 transition-all font-bold"
                    :class="wordSettings.timerDuration === 60 ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-md' : 'bg-white border-slate-100 opacity-60 hover:opacity-100'"
                >
                    Lambat (60s)
                </button>
                <button 
                    @click="wordSettings.timerDuration = 30"
                    class="p-4 rounded-2xl border-4 transition-all font-bold"
                    :class="wordSettings.timerDuration === 30 ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md' : 'bg-white border-slate-100 opacity-60 hover:opacity-100'"
                >
                    Normal (30s)
                </button>
                <button 
                    @click="wordSettings.timerDuration = 0"
                    class="p-4 rounded-2xl border-4 transition-all font-bold"
                    :class="wordSettings.timerDuration === 0 ? 'bg-slate-50 border-slate-500 text-slate-700 shadow-md' : 'bg-white border-slate-100 opacity-60 hover:opacity-100'"
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
