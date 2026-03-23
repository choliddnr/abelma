<script setup lang="ts">
import { ref } from 'vue'
import alphabetData from '../../../AlphabetData.json'

const currentIndex = ref(0)
const currentLetter = ref(alphabetData[0])

const next = () => {
  if (currentIndex.value < 25) {
    currentIndex.value++
    currentLetter.value = alphabetData[currentIndex.value]
  }
}

const prev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    currentLetter.value = alphabetData[currentIndex.value]
  }
}

const playPhonics = () => {
  const msg = new SpeechSynthesisUtterance()
  msg.text = `${currentLetter.value!.letter.upper}. ${currentLetter.value!.title}`
  msg.lang = 'id-ID'
  window.speechSynthesis.speak(msg)
}

const checkAnswer = (choice: string) => {
  if (choice === currentLetter.value!.challenge.target) {
    alert("Hebat! Kamu Benar! 🎉")
  } else {
    alert("Ups! Coba lagi ya! ✌️")
  }
}
</script>

<style>
/* Font Anak-anak (Optional) */
@import url('https://fonts.googleapis.com/css2?family=Public+Sans:wght@600;900&display=swap');

body {
  font-family: 'Public Sans', sans-serif;
}
</style>

<template>
  <div
    :class="['min-h-screen transition-colors duration-500 p-4 md:p-8 flex flex-col items-center', currentLetter!.themeColor]">

    <div
      class="w-full max-w-4xl flex justify-between items-center mb-6 bg-white/20 backdrop-blur-md p-4 rounded-3xl border-4 border-white/30 shadow-xl">
      <button class="bg-white p-3 rounded-2xl shadow-lg hover:scale-110 transition-transform">
        🏠 <span class="hidden md:inline font-bold text-gray-700">Menu</span>
      </button>
      <h1 class="text-2xl md:text-4xl font-black text-white drop-shadow-md uppercase tracking-wide">
        {{ currentLetter!.title }}
      </h1>
      <div class="bg-white px-4 py-2 rounded-2xl font-black text-gray-700 shadow-md">
        {{ currentIndex + 1 }} / 26
      </div>
    </div>

    <main
      class="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border-8 border-white">

      <section
        class="flex-1 p-8 flex flex-col items-center justify-center bg-gray-50 border-b-8 md:border-b-0 md:border-r-8 border-dashed border-gray-200">
        <div class="flex gap-4 mb-6">
          <div class="text-8xl md:text-9xl font-black text-gray-800 animate-bounce">
            {{ currentLetter!.letter.upper }}
          </div>
          <div class="text-7xl md:text-8xl font-black text-gray-500 self-end">
            {{ currentLetter!.letter.lower }}
          </div>
        </div>

        <button @click="playPhonics"
          class="group relative bg-yellow-400 hover:bg-yellow-300 p-6 rounded-full shadow-xl transition-all active:scale-90">
          <span class="text-4xl">🔊</span>
          <div
            class="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse font-bold">
            KETUK AKU!
          </div>
        </button>
      </section>

      <section class="flex-1 p-8 md:p-12 flex flex-col justify-between space-y-8">
        <div class="space-y-4">
          <h2 class="text-2xl font-bold text-gray-400 uppercase tracking-widest italic">Ayo Baca!</h2>
          <p class="text-2xl md:text-3xl font-medium leading-relaxed text-gray-700 text-balance">
            {{ currentLetter!.story }}
          </p>
        </div>

        <div class="bg-blue-50 p-6 rounded-[2rem] border-4 border-blue-200">
          <p class="text-lg font-bold text-blue-600 mb-4 uppercase">🎯 {{ currentLetter!.challenge.instruction }}</p>
          <div class="grid grid-cols-4 gap-3">
            <button v-for="opt in currentLetter!.challenge.options" :key="opt" @click="checkAnswer(opt)"
              class="h-16 md:h-20 bg-white border-4 border-blue-200 rounded-2xl text-3xl font-black text-gray-700 hover:bg-blue-400 hover:text-white hover:border-blue-500 transition-all active:scale-95 shadow-sm">
              {{ opt }}
            </button>
          </div>
        </div>
      </section>
    </main>

    <footer class="w-full max-w-4xl mt-8 flex justify-between gap-4">
      <button @click="prev"
        class="flex-1 bg-white/30 hover:bg-white text-white hover:text-gray-700 py-4 rounded-3xl font-black text-xl transition-all shadow-lg border-b-8 border-black/10 active:border-b-0">
        ⬅️ SEBELUMNYA
      </button>
      <button @click="next"
        class="flex-1 bg-green-400 hover:bg-green-300 text-white py-4 rounded-3xl font-black text-xl transition-all shadow-lg border-b-8 border-green-600 active:border-b-0">
        SELANJUTNYA ➡️
      </button>
    </footer>
  </div>
</template>
