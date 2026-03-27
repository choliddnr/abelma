<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { wordCategories, type Word } from '@/data/words'
import confetti from 'canvas-confetti'
import { useSettingsStore, useAnalyticsStore, useRewardStore, useProfileStore } from '@/stores'
import { playWordAudio, playEffectAudio } from '@/utils/audio'
import BubbleCard from '@/components/BubbleCard.vue'

const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()
const analyticsStore = useAnalyticsStore()
const rewardStore = useRewardStore()
const profileStore = useProfileStore()

const categoryId = route.params.category as string
const wordId = route.params.word as string

const wordData = computed<Word | null>(() => {
  const category = wordCategories.find(c => c.id === categoryId)
  if (!category) return null
  return category.words.find(w => w.id === wordId) || null
})

const goBack = () => router.push(`/words/${categoryId}/${wordId}`)

const targetWord = computed(() => wordData.value?.word || '')
const expectedLetters = computed(() => targetWord.value.split(''))

// State
const isComplete = ref(false)
const placedLetters = ref<(string | null)[]>([])
const availableLetters = ref<{ id: string, letter: string, isDragging?: boolean }[]>([])
const wrongDropIndex = ref<number | null>(null)
const autoPlayTimeout = ref<number | null>(null)

const initializeGame = () => {
  if (!targetWord.value) return
  isComplete.value = false
  placedLetters.value = Array.from({ length: targetWord.value.length }, () => null)
  
  // Generate available letters (target + some noise)
  const letters = targetWord.value.split('').map((l, i) => ({ id: `target-${i}-${l}`, letter: l }))
  const noiseLetters = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'.replace(new RegExp(`[${targetWord.value}]`, 'g'), '').split('').slice(0, 3)
  const noise = noiseLetters.map((l, i) => ({ id: `noise-${i}-${l}`, letter: l }))
  
  const allLetters = [...letters, ...noise]
  // Shuffle all letters
  for (let i = allLetters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allLetters[i], allLetters[j]] = [allLetters[j]!, allLetters[i]!]
  }
  
  availableLetters.value = allLetters
}

const playTargetWord = () => {
    if (!targetWord.value || !wordData.value) return
    playWordAudio(targetWord.value, `/audio/words/${wordData.value.id}.mp3`)
}

onMounted(() => {
  if (!wordData.value) {
    router.replace('/words') // handle invalid route
  } else {
    initializeGame()
    setTimeout(playTargetWord, 500)
  }
})

onUnmounted(() => {
  window.speechSynthesis.cancel()
  if (autoPlayTimeout.value) clearTimeout(autoPlayTimeout.value)
})

const checkCompletion = () => {
  const currentWord = placedLetters.value.join('')
  if (currentWord === targetWord.value) {
    rewardStore.addPoints(5) // Bank points for completion
    isComplete.value = true
    playTargetWord()
    popConfetti()
  }
}

const popConfetti = () => {
  const duration = 3000
  const end = Date.now() + duration

  const frame = () => {
    confetti({
      particleCount: 7,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#FFD93D', '#6BCB77', '#4D96FF', '#ff9a9a', '#A084E8'],
      zIndex: 100
    })
    confetti({
      particleCount: 7,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#FFD93D', '#6BCB77', '#4D96FF', '#ff9a9a', '#A084E8'],
      zIndex: 100
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }
  frame()
}

// Drag and Drop Logic
const draggedItemIndex = ref<number | null>(null)
const hoveredSlotIndex = ref<number | null>(null)

const onDragStart = (e: DragEvent, index: number) => {
    if (isComplete.value) return
    draggedItemIndex.value = index
    const letterObj = availableLetters.value[index]
    if (letterObj) {
        letterObj.isDragging = true
    }
    
    // Set data payload (required by Firefox)
    e.dataTransfer?.setData('text/plain', index.toString())
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move'
    }
}

const onDragEnd = (index: number) => {
    draggedItemIndex.value = null
    hoveredSlotIndex.value = null
    if (availableLetters.value[index]) {
        availableLetters.value[index].isDragging = false
    }
}

const onDragEnter = (index: number) => {
    if (isComplete.value || placedLetters.value[index] !== null) return
    hoveredSlotIndex.value = index
}

const onDragLeave = (index: number) => {
    if (hoveredSlotIndex.value === index) {
        hoveredSlotIndex.value = null
    }
}

const onDrop = (e: DragEvent, slotIndex: number) => {
    hoveredSlotIndex.value = null
    if (isComplete.value) return
    
    // If a letter is already in this slot, remove it back to available
    if (placedLetters.value[slotIndex] !== null) {
        putBackLetter(slotIndex)
    }
    
    // If dropped item is from available list
    if (draggedItemIndex.value !== null) {
        const sourceIndex = draggedItemIndex.value
        const letterObj = availableLetters.value[sourceIndex]!
        const correctLetter = expectedLetters.value[slotIndex]
        
        if (letterObj.letter === correctLetter) {
            // Correct placement
            placedLetters.value[slotIndex] = letterObj.letter
            // Remove from available
            availableLetters.value.splice(sourceIndex, 1)
            draggedItemIndex.value = null
            checkCompletion()
        } else {
            // Wrong placement
            if (wordData.value && profileStore.activeProfileId) {
                analyticsStore.recordMistake(profileStore.activeProfileId, 'word', wordData.value.id)
            }
            wrongDropIndex.value = slotIndex
            setTimeout(() => {
                wrongDropIndex.value = null
            }, 500)
            
            playEffectAudio('wrong')
            draggedItemIndex.value = null
        }
    }
}

// Function to handle moving placed letter back to pool
const putBackLetter = (slotIndex: number) => {
    if (isComplete.value) return
    const letter = placedLetters.value[slotIndex]
    if (letter) {
        availableLetters.value.push({ id: `returned-${Date.now()}`, letter })
        placedLetters.value[slotIndex] = null
    }
}

</script>

<template>
  <div v-if="wordData" class="flex flex-col min-h-screen bg-slate-50 overflow-hidden relative">
    
    <!-- Celebration Overlay -->
    <div v-if="isComplete" class="absolute inset-0 z-50 flex flex-col gap-8 items-center justify-center bg-white/40 backdrop-blur-sm transition-all duration-1000">
        <h1 class="text-7xl md:text-9xl font-black text-emerald-500 drop-shadow-[0_10px_0_rgba(16,185,129,0.3)] animate-bounce font-quicksand">
            HEBAT!
        </h1>
        <button @click="router.push('/words')" class="ui-capsule-interactive bg-emerald-500 border-emerald-600 text-white w-auto shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all">
            <span class="text-2xl md:text-3xl text-white">🏠</span>
            <span class="font-black text-lg md:text-xl text-white">Selesai</span>
        </button>
    </div>

    <!-- Header -->
    <div class="flex items-center justify-between shrink-0 px-4 pt-4 pb-2 z-10">
      <button @click="goBack"
        class="ui-capsule-interactive bg-white border-slate-200 text-slate-700 w-auto hover:bg-slate-50 focus:ring-slate-200">
        <span class="text-xl md:text-2xl">🔙</span>
        <span class="font-black text-sm md:text-base hidden sm:inline">Kembali</span>
      </button>

      <!-- Target Display -->
      <div class="flex items-center gap-4 bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100">
          <span class="text-4xl md:text-5xl drop-shadow-sm">{{ wordData.emoji }}</span>
          <button @click="playTargetWord" class="ui-capsule-interactive bg-indigo-50 border-indigo-200 text-indigo-700 w-12 h-12 p-0! rounded-full flex items-center justify-center hover:bg-indigo-100">
              <span class="text-2xl">🔊</span>
          </button>
      </div>
      
      <div class="w-[88px] md:w-[115px]"></div> <!-- Spacer -->
    </div>

    <!-- Main Game Area -->
    <div class="flex-1 flex flex-col items-center justify-center gap-4 md:gap-6 max-w-6xl mx-auto w-full p-2 overflow-hidden pt-2">
      <!-- Target Slots -->
      <div class="flex flex-wrap justify-center gap-3 md:gap-6 w-full">
          <div v-for="(slot, index) in placedLetters" :key="`slot-${index}`"
               @click="placedLetters[index] !== null ? putBackLetter(index) : undefined"
               @dragover.prevent
               @dragenter.prevent="onDragEnter(index)"
               @dragleave.prevent="onDragLeave(index)"
               @drop.prevent="onDrop($event, index)"
               class="relative w-20 h-24 md:w-32 md:h-40 rounded-2xl md:rounded-3xl border-4 md:border-8 flex items-center justify-center transition-all duration-300"
               :class="[
                   placedLetters[index] !== null 
                     ? 'bg-emerald-400 border-white shadow-[0_10px_20px_rgba(52,211,153,0.4)] scale-105 cursor-pointer' 
                     : 'bg-slate-100 border-dashed border-slate-300 shadow-inner',
                   wrongDropIndex === index ? 'shake-animation bg-rose-400 border-rose-500' : '',
                   hoveredSlotIndex === index && placedLetters[index] === null ? 'ring-8 ring-indigo-400 bg-indigo-50 border-indigo-400 scale-110 shadow-[inset_0_0_20px_rgba(99,102,241,0.6)]' : ''
               ]">
               
              <span v-if="placedLetters[index] !== null" 
                    class="text-5xl md:text-[5rem] font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.15)] leading-none font-quicksand" 
                    :class="{ 'pop-animation': true }">
                  {{ settingsStore.settings.letterCase === 'uppercase' ? placedLetters[index]?.toUpperCase() : placedLetters[index]?.toLowerCase() }}
              </span>
          </div>
      </div>

      <!-- Draggable Items (Available Letters) -->
      <div class="w-full">
          <!-- Instruction -->
          <p class="text-center text-slate-500 font-bold mb-4 text-lg md:text-xl uppercase tracking-widest font-quicksand">
              {{ isComplete ? 'Luar biasa!' : 'Tarik huruf ke dalam kotak kosong' }}
          </p>

          <div class="flex flex-wrap justify-center gap-3 md:gap-4 w-full p-4 md:p-8 bg-white/50 backdrop-blur-md rounded-[3rem] border-t-4 border-white shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.1)] min-h-[160px]">
              <BubbleCard v-for="(item, index) in availableLetters" :key="item.id"
                      draggable="true"
                      @dragstart="onDragStart($event, index)"
                      @dragend="onDragEnd(index)"
                      class="w-16 h-20 md:w-24 md:h-32 rounded-2xl md:rounded-3xl active:scale-95 shadow-[0_8px_20px_-5px_rgba(0,0,0,0.2)] border-2 border-indigo-200/50 bg-sky-400 cursor-grab active:cursor-grabbing hover:-translate-y-2 hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)] transition-all duration-300"
                      :class="[
                          item.isDragging ? 'opacity-20 scale-95 rotate-6' : 'opacity-100',
                          isComplete ? 'opacity-0 scale-50 pointer-events-none' : ''
                      ]">
                  
                  <span class="text-4xl md:text-[4rem] font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.15)] tracking-wider pointer-events-none font-quicksand">
                      {{ settingsStore.settings.letterCase === 'uppercase' ? item.letter.toUpperCase() : item.letter.toLowerCase() }}
                  </span>
                  
              </BubbleCard>
          </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.shake-animation {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000px;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-2px, 0, 0); }
  20%, 80% { transform: translate3d(4px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-8px, 0, 0); }
  40%, 60% { transform: translate3d(8px, 0, 0); }
}

.pop-animation {
    animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes pop {
    0% { transform: scale(1); }
    50% { transform: scale(1.15); }
    100% { transform: scale(1.1); }
}
</style>
