<script setup lang="ts">
const props = defineProps<{
  word: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}>();

const emit = defineEmits(["back", "success"]);

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const feedback = ref<{ message: string; type: "success" | "error" | null }>({
  message: "",
  type: null,
});
const resetTrigger = ref(0);

// Alternative: Let's manage the boxes locally in this view to have full control.
const boxes = ref(props.word.name.toUpperCase().split(""));
const currentGuess = ref<string[]>(Array.from({ length: props.word.name.length }, () => ""));

const updateBox = (index: number, letter: string) => {
  currentGuess.value[index] = letter;
  if (letter !== "") {
    checkCompletion();
  }
};

const checkCompletion = () => {
  if (currentGuess.value.every((l) => l !== "")) {
    validate();
  }
};

const validate = () => {
  const guess = currentGuess.value.join("");
  const target = props.word.name.toUpperCase();

  if (guess === target) {
    feedback.value = { message: "Hebat! Kamu Benar! 🎉", type: "success" };
    speak("Hebat! Kamu Benar!");
    setTimeout(() => {
      emit("success");
    }, 2000);
  } else {
    feedback.value = { message: "Belum tepat, coba lagi ya! 💪", type: "error" };
    speak("Belum tepat, coba lagi ya!");

    // Auto clear after wrong answer
    setTimeout(() => {
      if (feedback.value.type === "error") {
        reset();
      }
    }, 1500);
  }
};

const speak = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "id-ID";
  window.speechSynthesis.speak(utterance);
};

const reset = () => {
  currentGuess.value = Array.from({ length: props.word.name.length }, () => "");
  feedback.value = { message: "", type: null };
};
</script>

<template>
  <div class="flex flex-col items-center gap-8 w-full max-w-5xl mx-auto">
    <div class="text-center space-y-4">
      <div
        class="text-9xl md:text-[150px] w-48 h-48 md:w-56 md:h-56 flex items-center justify-center rounded-full border-8 border-white shadow-xl mx-auto"
        :class="word.color"
      >
        {{ word.icon }}
      </div>
      <h2 class="text-3xl font-black text-[#5C4D00]">Susun hurufnya yuk!</h2>
    </div>

    <!-- Drop Zones -->
    <div class="flex flex-wrap gap-4 justify-center py-8">
      <div v-for="(char, index) in boxes" :key="index" class="relative">
        <DroppableComp
          :target="char"
          :reset-trigger="resetTrigger"
          @update-letter="(l: string) => updateBox(index, l)"
        />
      </div>
    </div>

    <!-- Feedback -->
    <div class="h-12 text-center">
      <transition name="fade">
        <p
          v-if="feedback.message"
          class="text-2xl font-black animate-bounce"
          :class="feedback.type === 'success' ? 'text-green-500' : 'text-red-500'"
        >
          {{ feedback.message }}
        </p>
      </transition>
    </div>

    <!-- Letter Selection (Drag Source) -->
    <div class="glass-card p-6 w-full">
      <div
        class="flex flex-wrap gap-3 justify-center max-h-48 overflow-y-auto custom-scrollbar p-2"
      >
        <LetterComp v-for="l in letters" :key="l" :letter="l" />
      </div>
    </div>

    <div class="flex gap-4">
      <button @click="reset" class="btn-accent px-8 py-3 text-xl">Ulangi</button>
      <button @click="$emit('back')" class="btn-secondary px-8 py-3 text-xl">Ganti Kata</button>
    </div>
  </div>
</template>

<style scoped></style>
