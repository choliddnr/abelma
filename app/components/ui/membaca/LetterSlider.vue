
<script setup lang="ts">
import { ref, onMounted, nextTick, watch, type PropType } from 'vue';

const props = defineProps({
  letters: {
    type: Array as PropType<string[]>,
    required: true
  },
  selectedLetter: {
    type: String,
    required: true
  },
  traceProgress: {
    type: Object,
    required: true
  },
  stars: {
    type: Object as PropType<{
      [key: string]: number;
    }>,
    required: false
  }
});

const emit = defineEmits(['select']);

const carouselRef = ref<HTMLElement | null>(null);

const scrollToLetter = async (letter:string) => {
  await nextTick();
  const el = document.getElementById(`letter-${letter}`);
  if (el && carouselRef.value) {
    const containerWidth = (carouselRef.value as HTMLElement).offsetWidth;
    const elWidth = el.offsetWidth;
    const scrollPosition = el.offsetLeft - (containerWidth / 2) + (elWidth / 2);
    
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
};

watch(() => props.selectedLetter, (newVal) => {
  if (newVal) {
    scrollToLetter(newVal);
  }
}, { immediate: true });
</script>
<template>   
 <!-- Bottom Letter Carousel -->
    <div class="w-full mt-12 bg-white/30 backdrop-blur-md py-6 border-t-2 border-white/50">
      <div 
        ref="carouselRef"
        class="flex gap-4 overflow-x-auto px-8 scrollbar-hide snap-x"
      >
        <button 
          v-for="letter in letters" 
          :key="letter"
          :id="`letter-${letter}`"
          @click="emit('select', letter)"
          class="flex-shrink-0 text-white w-24 h-24 rounded-3xl flex flex-col items-center justify-center transition-all snap-center"
          :class="[
            selectedLetter === letter 
              ? 'bg-[#008080] shadow-lg' 
              : 'bg-[#ff6600] border-4 border-[#ff6600] hover:bg-orange-400 hover:border-orange-400'
          ]"
        >
          <!-- Stars -->
          <div v-if="props.stars" class="flex gap-0 mb-1 h-3">
             <Icon 
               v-for="i in  props.stars[letter]" 
               :key="i" 
               name="material-symbols:star-rounded" 
               class="text-[18px]"
               :class="i <= ( props.stars[letter] || 0) ? 'fill-current' : 'opacity-30'"
             />
          </div>
          <span v-if="props.stars" class="font-black" :class=" !( props.stars[letter]) || ( props.stars[letter] ===  0) ? 'text-5xl mb-5' : 'text-4xl'" >{{letter}}</span>
        </button>
      </div>
    </div>
</template>
<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
