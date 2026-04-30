<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all">
      <div class="text-center">
        <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="lucide:shield" class="w-8 h-8" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Ask Your Parents!</h2>
        <p class="text-gray-600 mb-6 text-lg">Please solve this math problem to continue.</p>

        <div class="text-3xl font-black text-gray-800 mb-6 tracking-wider">
          {{ num1 }} x {{ num2 }} = ?
        </div>

        <div class="grid grid-cols-3 gap-3 mb-6">
          <button
            v-for="option in options"
            :key="option"
            @click="checkAnswer(option)"
            class="py-3 rounded-xl font-bold text-xl transition-all"
            :class="[
              selected === option
                ? option === correctAnswer
                  ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                  : 'bg-red-500 text-white shadow-lg shadow-red-200'
                : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-transparent hover:border-blue-200'
            ]"
          >
            {{ option }}
          </button>
        </div>

        <button
          @click="close"
          class="text-gray-400 hover:text-gray-600 font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'close'): void;
}>();

const num1 = ref(0);
const num2 = ref(0);
const correctAnswer = computed(() => num1.value * num2.value);
const options = ref<number[]>([]);
const selected = ref<number | null>(null);

const generateProblem = () => {
  num1.value = Math.floor(Math.random() * 6) + 4; // 4 to 9
  num2.value = Math.floor(Math.random() * 6) + 4; // 4 to 9
  
  const correct = correctAnswer.value;
  const wrong1 = correct + Math.floor(Math.random() * 5) + 1;
  const wrong2 = correct - Math.floor(Math.random() * 5) - 1;
  
  const opts = [correct, wrong1, wrong2];
  // Shuffle options
  options.value = opts.sort(() => Math.random() - 0.5);
  selected.value = null;
};

const checkAnswer = (answer: number) => {
  if (selected.value !== null) return; // Prevent multiple clicks
  selected.value = answer;
  
  if (answer === correctAnswer.value) {
    setTimeout(() => {
      emit('success');
      generateProblem(); // Reset for next time
    }, 500);
  } else {
    setTimeout(() => {
      selected.value = null;
      generateProblem(); // Give a new problem
    }, 1000);
  }
};

const close = () => {
  emit('close');
  generateProblem();
};

onMounted(() => {
  if (props.isOpen) {
    generateProblem();
  }
});

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    generateProblem();
  }
});
</script>
