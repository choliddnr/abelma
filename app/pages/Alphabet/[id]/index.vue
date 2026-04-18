<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const letter = (route.params.id as string).toUpperCase();

const { speak } = useAlphabetAudio();

const words = {
  A: { word: "Apel", icon: "🍎" },
  B: { word: "Bola", icon: "⚽" },
  C: { word: "Cicak", icon: "🦎" },
  D: { word: "Domba", icon: "🐑" },
  E: { word: "Elang", icon: "🦅" },
  F: { word: "Foto", icon: "📷" },
  G: { word: "Gajah", icon: "🐘" },
  H: { word: "Harimau", icon: "🐅" },
  I: { word: "Ikan", icon: "🐟" },
  J: { word: "Jerapah", icon: "🦒" },
  K: { word: "Kucing", icon: "🐱" },
  L: { word: "Lampu", icon: "💡" },
  M: { word: "Mobil", icon: "🚗" },
  N: { word: "Nanas", icon: "🍍" },
  O: { word: "Obat", icon: "💊" },
  P: { word: "Pisang", icon: "🍌" },
  Q: { word: "Quran", icon: "📖" },
  R: { word: "Roti", icon: "🍞" },
  S: { word: "Susu", icon: "🥛" },
  T: { word: "Topi", icon: "🎩" },
  U: { word: "Ular", icon: "🐍" },
  V: { word: "Vas", icon: "🏺" },
  W: { word: "Wortel", icon: "🥕" },
  X: { word: "Xylophone", icon: "🎹" },
  Y: { word: "Yoyo", icon: "🪀" },
  Z: { word: "Zebra", icon: "🦓" },
};

const item = words[letter as keyof typeof words] || { word: "???", icon: "❓" };

const highlightedWord = computed(() => {
  return item.word
    .split("")
    .map((char) => {
      if (char.toLowerCase() === letter.toLowerCase()) {
        return `<span class="text-accent">${char}</span>`;
      }
      return `<span class="text-danger">${char}</span>`;
    })
    .join("");
});
</script>

<template>
  <div class="flex flex-col items-center gap-12 mx-4 lg:mx-0 mb-7">
    <div
      class="glass-card flex-wrap p-12 w-full max-w-4xl flex flex-col md:flex-row items-center justify-around gap-12 mt-5"
    >
      <div class="flex gap-4">
        <div
          class="text-[200px] md:text-[300px] font-black leading-none text-accent cursor-pointer hover:scale-110 transition-transform active:scale-95 text-outline-fix"
          :data-text="letter.toUpperCase()"
          @click="speak(`Ini huruf ${letter.toUpperCase()} besar`)"
        >
          {{ letter.toUpperCase() }}
        </div>
        <div
          class="text-[200px] md:text-[300px] font-black leading-none text-accent cursor-pointer hover:scale-110 transition-transform active:scale-95 text-outline-fix"
          :data-text="letter.toLowerCase()"
          @click="speak(`Ini huruf ${letter.toLowerCase()} kecil`)"
        >
          {{ letter.toLowerCase() }}
        </div>
      </div>
      <div class="flex flex-col items-center gap-6">
        <div
          class="text-[120px] md:text-[200px] bg-white rounded-full w-48 h-48 md:w-64 md:h-64 flex items-center justify-center shadow-lg border-8 border-primary cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          @click="speak(item.word)"
        >
          {{ item.icon }}
        </div>
        <div class="text-center space-y-2">
          <p class="text-3xl font-bold text-gray-500">untuk...</p>
          <h2
            class="text-6xl md:text-8xl font-black tracking-wide"
            v-html="highlightedWord"
          ></h2>
        </div>
      </div>
    </div>

    <div class="flex gap-6">
      <UiButton
        label="Daftar Huruf"
        icon="📚"
        variant="secondary"
        @click="router.push(`/alphabet`)"
        ><span class="hidden sm:block font-bold text-lg"
          >Daftar Huruf</span
        ></UiButton
      >
      <UiButton
        label="Buka Cerita"
        icon="📖"
        @click="router.push(`/alphabet/${letter}/story`)"
        ><span class="hidden sm:block font-bold text-lg"
          >Buka Cerita</span
        ></UiButton
      >
      <UiButton
        label="Latihan Menulis"
        icon="✍️"
        variant="accent"
        @click="router.push(`/alphabet/${letter}/trace`)"
        ><span class="hidden sm:block font-bold text-lg"
          >Latihan Menulis</span
        ></UiButton
      >
    </div>
  </div>
</template>

<style scoped>
.text-outline-fix {
  position: relative;
  z-index: 1;
}
.text-outline-fix::before {
  content: attr(data-text);
  position: absolute;
  left: 0;
  top: 0;
  z-index: -1;
  -webkit-text-stroke: 24px white;
  color: white;
}
</style>
