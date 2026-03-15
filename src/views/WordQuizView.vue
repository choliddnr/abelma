<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { wordCategories, type Word } from '@/data/words'
import confetti from 'canvas-confetti'
import { wordSettings } from '@/utils/wordSettings'
import { checkAndEarnStickers, type Sticker } from '@/utils/stickerStore'
import { playWordAudio, playEffectAudio } from '@/utils/audio'
import { recordMistake } from '@/utils/analyticsStore'
import { addPoints } from '@/utils/rewardStore'

const router = useRouter()
const goBack = () => router.push('/words')

// Flatten all words from all categories into a single pool
const allWords = computed<Word[]>(() => {
  return wordCategories.flatMap(c => c.words)
})

const currentTarget = ref<Word | null>(null)
const currentOptions = ref<Word[]>([])
const wrongChoiceId = ref<string | null>(null)
const score = ref(0)
const maxScore = 150
const timeLeft = ref(30)
const timerMax = computed(() => wordSettings.timerDuration)
let timerInterval: number | null = null

// Activity Control
type QuizType = 'PICK_WORD' | 'SPELL_WORD'
const activityType = ref<QuizType>('PICK_WORD')

// Spelling Mode State
const placedLetters = ref<(string | null)[]>([])
const availableLetters = ref<{ id: string, letter: string, isDragging?: boolean }[]>([])
const wrongDropIndex = ref<number | null>(null)
const draggedItemIndex = ref<number | null>(null)
const hoveredSlotIndex = ref<number | null>(null)

// Sticker Reveal State
const newSticker = ref<Sticker | null>(null)
const showStickerModal = ref(false)

const currentLevel = computed(() => {
    if (score.value < 50) return 1
    if (score.value < 100) return 2
    return 3
})

const numOptions = computed(() => {
    if (currentLevel.value === 1) return 2
    if (currentLevel.value === 2) return 3
    return 4
})

const startTimer = () => {
    if (timerInterval) clearInterval(timerInterval)
    if (timerMax.value <= 0) return // Timer disabled in settings

    timeLeft.value = timerMax.value
    timerInterval = window.setInterval(() => {
        timeLeft.value -= 0.1
        if (timeLeft.value <= 0) {
            timeLeft.value = 0
            if (timerInterval) clearInterval(timerInterval)
            handleTimeUp()
        }
    }, 100)
}

const handleTimeUp = () => {
    if (currentTarget.value) {
        recordMistake(currentTarget.value.id)
    }
    playWordAudio("Waktu habis! Ayo coba yang ini.")
    setTimeout(initQuestion, 1500)
}

const initQuestion = () => {
    const neededOptions = numOptions.value
    if (allWords.value.length < neededOptions) return
    
    // Stop previous timer
    if (timerInterval) clearInterval(timerInterval)

    // Reset UI states
    wrongChoiceId.value = null
    wrongDropIndex.value = null
    draggedItemIndex.value = null
    hoveredSlotIndex.value = null

    // Pick a random target
    const targetIndex = Math.floor(Math.random() * allWords.value.length)
    const target = allWords.value[targetIndex]!
    currentTarget.value = target

    // Randomize Activity Type
    // Level 1: Mostly PICK_WORD
    // Level 2-3: 50/50 mix
    if (currentLevel.value === 1) {
        activityType.value = Math.random() > 0.3 ? 'PICK_WORD' : 'SPELL_WORD'
    } else {
        activityType.value = Math.random() > 0.5 ? 'PICK_WORD' : 'SPELL_WORD'
    }

    if (activityType.value === 'PICK_WORD') {
        // Pick distractors
        const optionsSet = new Set<Word>()
        optionsSet.add(target)
        
        if (currentLevel.value === 3) {
            // Level 3 logic: Try to find words starting with the same letter
            const firstLetter = target.word.charAt(0).toUpperCase()
            const similarWords = allWords.value.filter(w => 
                w.id !== target.id && 
                w.word.charAt(0).toUpperCase() === firstLetter
            )
            
            // Shuffle similar words
            const shuffledSimilar = [...similarWords].sort(() => Math.random() - 0.5)
            shuffledSimilar.slice(0, neededOptions - 1).forEach(w => optionsSet.add(w))
        }
        
        // Fill remaining slots if any
        while (optionsSet.size < neededOptions) {
            const randomIndex = Math.floor(Math.random() * allWords.value.length)
            optionsSet.add(allWords.value[randomIndex]!)
        }
        
        // Convert set to array and shuffle
        const optionsArray = Array.from(optionsSet)
        for (let i = optionsArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [optionsArray[i], optionsArray[j]] = [optionsArray[j]!, optionsArray[i]!]
        }
        currentOptions.value = optionsArray
    } else {
        // SPELL_WORD Logic
        placedLetters.value = Array.from({ length: target.word.length }, () => null)
        
        const letters = target.word.split('').map((l, i) => ({ id: `target-${i}-${l}`, letter: l }))
        const noiseCount = currentLevel.value >= 3 ? 3 : 1
        const noiseLetters = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'.replace(new RegExp(`[${target.word}]`, 'g'), '').split('').slice(0, noiseCount)
        const noise = noiseLetters.map((l, i) => ({ id: `noise-${i}-${l}`, letter: l }))
        
        const allLetters = [...letters, ...noise]
        for (let i = allLetters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allLetters[i], allLetters[j]] = [allLetters[j]!, allLetters[i]!]
        }
        availableLetters.value = allLetters
    }
    
    setTimeout(() => {
        playTargetAudio()
        startTimer()
    }, 300)
}

// Drag Handlers for SPELL_WORD
const onDragStart = (e: DragEvent, index: number) => {
    draggedItemIndex.value = index
    if (availableLetters.value[index]) {
        availableLetters.value[index].isDragging = true
    }
    e.dataTransfer?.setData('text/plain', index.toString())
}

const onDragEnd = (index: number) => {
    draggedItemIndex.value = null
    hoveredSlotIndex.value = null
    if (availableLetters.value[index]) {
        availableLetters.value[index].isDragging = false
    }
}

const onDrop = (slotIndex: number) => {
    hoveredSlotIndex.value = null
    if (draggedItemIndex.value === null || !currentTarget.value) return
    
    const sourceIndex = draggedItemIndex.value
    const letterObj = availableLetters.value[sourceIndex]!
    const correctLetter = currentTarget.value.word.charAt(slotIndex)
    
    if (letterObj.letter === correctLetter) {
        placedLetters.value[slotIndex] = letterObj.letter
        availableLetters.value.splice(sourceIndex, 1)
        draggedItemIndex.value = null
        
        // Check if full word spelled
        if (placedLetters.value.join('') === currentTarget.value.word) {
            handleCorrect()
        }
    } else {
        recordMistake(currentTarget.value.id)
        wrongDropIndex.value = slotIndex
        playErrorAudio()
        setTimeout(() => {
            wrongDropIndex.value = null
        }, 500)
    }
}

const putBackLetter = (slotIndex: number) => {
    const letter = placedLetters.value[slotIndex]
    if (letter) {
        availableLetters.value.push({ id: `returned-${Date.now()}`, letter })
        placedLetters.value[slotIndex] = null
    }
}

const handleCorrect = () => {
    if (timerInterval) clearInterval(timerInterval)
    popConfetti()
    score.value += 10
    addPoints(10) // Banking points
    
    playEffectAudio('correct')

    // Check for stickers
    const earned = checkAndEarnStickers(score.value)
    if (earned) {
        newSticker.value = earned
        showStickerModal.value = true
        popStickerCelebration()
    }
    
    if (score.value >= maxScore) {
        setTimeout(triggerWinScreen, 1000)
    } else {
        setTimeout(initQuestion, 1500)
    }
}

const playTargetAudio = () => {
    if (!currentTarget.value) return
    
    let textToSpeak = "Cari tulisan " + currentTarget.value.word.toLowerCase()
    if (currentLevel.value >= 2) {
        textToSpeak = "Mana tulisan yang cocok?"
    }
    
    playWordAudio(textToSpeak, `/audio/words/${currentTarget.value.id}.mp3`)
}

const playErrorAudio = () => {
    playEffectAudio('wrong')
}

const isCorrecting = ref(false) // Added this line

const handleChoice = (word: Word) => {
    if (!currentTarget.value || isCorrecting.value) return
    
    if (word.id === currentTarget.value.id) {
        handleCorrect()
    } else {
        recordMistake(currentTarget.value.id)
        playErrorAudio()
        isCorrecting.value = true
        setTimeout(() => {
            isCorrecting.value = false
        }, 800)
    }
}

const popConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#FFD93D', '#6BCB77', '#4D96FF', '#ff9a9a', '#A084E8'],
      zIndex: 100
    })
}

const popStickerCelebration = () => {
    // Extra fancy confetti for sticker!
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF4500'],
      zIndex: 200
    })
    
    playEffectAudio('sticker')
}

const isWin = ref(false)

const triggerWinScreen = () => {
    isWin.value = true
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

onMounted(() => {
    initQuestion()
})

onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval)
    window.speechSynthesis.cancel()
})

</script>

<template>
  <div class="flex flex-col min-h-screen relative overflow-hidden">
      
    <!-- Win Celebration Overlay (Premium Redesign) -->
    <div v-if="isWin" class="absolute inset-0 z-100 flex flex-col gap-10 items-center justify-center bg-white/60 backdrop-blur-xl animate-in fade-in duration-1000">
        <div class="relative animate-bounce">
            <h1 class="text-7xl md:text-9xl font-black text-amber-500 drop-shadow-[0_12px_0_rgba(245,158,11,0.2)] font-quicksand">
                LUAR BIASA!
            </h1>
            <div class="absolute -top-10 -right-10 text-6xl animate-float">🌟</div>
            <div class="absolute -bottom-10 -left-10 text-6xl animate-float" style="animation-delay: 1s;">✨</div>
        </div>
        
        <div class="bg-linear-to-r from-amber-400 to-orange-500 text-white px-10 py-5 rounded-[2.5rem] font-black text-4xl shadow-2xl border-4 border-white animate-pop">
            +{{ score }} KOIN! 🪙
        </div>
        
        <div class="flex gap-6 animate-entrance" style="animation-delay: 0.5s;">
            <button @click="goBack" class="ui-capsule-interactive bg-white border-slate-200 text-slate-700 w-auto shadow-xl">
                <span class="text-2xl md:text-3xl">🏠</span>
                <span class="font-black text-lg md:text-xl">Menu</span>
            </button>
            <button @click="() => { isWin = false; score = 0; initQuestion() }" class="ui-capsule-interactive bg-emerald-500 border-emerald-600 text-white w-auto shadow-xl shadow-emerald-200">
                <span class="text-2xl md:text-3xl">🔄</span>
                <span class="font-black text-lg md:text-xl">Main Lagi</span>
            </button>
        </div>
    </div>

    <!-- New Sticker Reveal Modal -->
    <div v-if="showStickerModal && newSticker" 
         class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500">
        
        <div class="glass-card bg-white w-full max-w-sm p-8 flex flex-col items-center gap-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-t-8 border-amber-400 animate-in zoom-in-95 duration-500">
            <div class="absolute -top-12 -left-4 text-6xl animate-bounce">🎈</div>
            <div class="absolute -top-12 -right-4 text-6xl animate-bounce [animation-delay:0.2s]">🎈</div>
            
            <h2 class="text-3xl font-black text-slate-800 text-center font-quicksand">Stiker Baru!</h2>
            
            <div class="w-48 h-48 bg-amber-50 rounded-full flex items-center justify-center border-4 border-amber-100 shadow-inner relative group">
                <div class="absolute inset-0 bg-amber-400/20 rounded-full animate-ping opacity-20"></div>
                <span class="text-[8rem] drop-shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-6">
                    {{ newSticker.emoji }}
                </span>
            </div>
            
            <div class="text-center">
                <h3 class="text-2xl font-bold text-indigo-600 font-quicksand">{{ newSticker.name }}</h3>
                <p class="text-slate-500 font-bold">Keren! Koleksi stikermu bertambah!</p>
            </div>
            
            <button @click="showStickerModal = false" 
                class="ui-capsule-interactive bg-amber-400 border-amber-500 text-slate-900 w-full text-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                Lanjut Main! 🚀
            </button>
        </div>
    </div>

    <!-- Header & Score (Animated) -->
    <div class="flex items-center justify-between shrink-0 px-4 pt-4 pb-2 z-10 w-full max-w-5xl mx-auto animate-entrance">
      <button @click="goBack"
        class="ui-capsule-interactive bg-white border-slate-200 text-slate-700 w-auto shadow-sm">
        <span class="text-xl md:text-2xl">🔙</span>
        <span class="font-black text-sm md:text-base hidden sm:inline">Menyerah</span>
      </button>

      <div class="flex gap-2 md:gap-4">
        <div class="ui-capsule bg-white border-slate-100 text-slate-700 w-auto px-4 shadow-sm">
            🚀 Level {{ currentLevel }}
        </div>
        <div class="ui-capsule bg-indigo-500 border-indigo-600 text-white w-auto px-6 shadow-lg shadow-indigo-100 animate-float">
            ⭐ {{ score }} / {{ maxScore }}
        </div>
      </div>
    </div>

    <!-- Main Game Area -->
    <div class="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full gap-8 md:gap-12 py-8 px-4 z-10">
        
        <!-- Timer Bar -->
        <div v-if="timerMax > 0" class="w-full max-w-md bg-white/50 h-4 rounded-full overflow-hidden border-2 border-white shadow-inner -mt-4">
            <div class="h-full bg-linear-to-r from-emerald-400 to-sky-400 transition-all duration-100 ease-linear"
                 :style="{ width: `${(timeLeft / timerMax) * 100}%` }"></div>
        </div>
        
        <div v-if="currentTarget" class="flex flex-col items-center gap-8 md:gap-12 w-full">
            
            <!-- Target Visual -->
            <button @click="playTargetAudio" class="relative group">
                <div class="w-48 h-48 md:w-64 md:h-64 rounded-full bg-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] border-8 border-white flex items-center justify-center transition-transform active:scale-95 hover:scale-105">
                    <span class="text-[8rem] md:text-[10rem] drop-shadow-md select-none group-hover:-rotate-6 transition-transform">
                        {{ currentTarget.emoji }}
                    </span>
                </div>
                <!-- Replay Audio Hint -->
                <div class="absolute -bottom-2 -right-2 w-16 h-16 bg-blue-100 rounded-full shadow-lg border-4 border-white flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                    <span class="text-3xl">🔊</span>
                </div>
            </button>

            <!-- OPTION TYPE: PICK_WORD -->
            <div v-if="activityType === 'PICK_WORD'" class="flex flex-col md:flex-row gap-4 md:gap-6 w-full justify-center">
                <button v-for="(option) in currentOptions" :key="option.id"
                    @click="handleChoice(option)"
                    class="relative glass-card flex-1 min-h-20 md:min-h-28 rounded-3xl md:rounded-4xl flex flex-col items-center justify-center transition-all duration-200 active:scale-95 border-4 overflow-hidden shadow-[0_8px_20px_-5px_rgba(0,0,0,0.2)] hover:-translate-y-2 hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)]"
                    :class="[
                        wrongChoiceId === option.id ? 'shake-animation bg-rose-400 border-rose-500' : 'bg-white border-white'
                    ]">
                    
                    <!-- Glossy Top Highlight -->
                    <div class="absolute top-0 inset-x-0 h-1/3 bg-linear-to-b from-white/60 to-transparent opacity-80 rounded-t-[inherit] pointer-events-none"></div>

                    <span class="text-3xl md:text-5xl font-black drop-shadow-sm tracking-widest z-10" 
                          :class="wrongChoiceId === option.id ? 'text-white' : 'text-slate-700'"
                          style="font-family: 'Quicksand', sans-serif;">
                        {{ wordSettings.letterCase === 'uppercase' ? option.word : option.word.toLowerCase() }}
                    </span>
                </button>
            </div>

            <!-- OPTION TYPE: SPELL_WORD -->
            <div v-else-if="activityType === 'SPELL_WORD'" class="w-full flex flex-col gap-12">
                <!-- Drop Zones -->
                <div class="flex flex-wrap justify-center gap-2 md:gap-4 w-full">
                    <div v-for="(slot, idx) in placedLetters" :key="`slot-${idx}`"
                        @click="placedLetters[idx] !== null ? putBackLetter(idx) : undefined"
                        @dragover.prevent
                        @dragenter.prevent="hoveredSlotIndex = idx"
                        @dragleave.prevent="hoveredSlotIndex === idx ? hoveredSlotIndex = null : null"
                        @drop.prevent="onDrop(idx)"
                        class="relative w-14 h-18 md:w-20 md:h-28 rounded-xl md:rounded-2xl border-2 md:border-4 flex items-center justify-center transition-all duration-300"
                        :class="[
                            placedLetters[idx] !== null 
                                ? 'bg-emerald-400 border-white shadow-md cursor-pointer' 
                                : 'bg-slate-100 border-dashed border-slate-300',
                            wrongDropIndex === idx ? 'shake-animation bg-rose-400 border-rose-500' : '',
                            hoveredSlotIndex === idx && placedLetters[idx] === null ? 'ring-4 ring-indigo-300 bg-indigo-50 border-indigo-300' : ''
                        ]">
                        <span v-if="placedLetters[idx] !== null" 
                            class="text-3xl md:text-5xl font-black text-white" 
                            style="font-family: 'Quicksand', sans-serif;">
                            {{ wordSettings.letterCase === 'uppercase' ? placedLetters[idx]?.toUpperCase() : placedLetters[idx]?.toLowerCase() }}
                        </span>
                    </div>
                </div>

                <!-- Letter Pool -->
                <div class="flex flex-wrap justify-center gap-2 md:gap-4 w-full p-6 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white shadow-xs">
                    <div v-for="(item, idx) in availableLetters" :key="item.id"
                        draggable="true"
                        @dragstart="onDragStart($event, idx)"
                        @dragend="onDragEnd(idx)"
                        class="relative w-12 h-16 md:w-16 md:h-24 rounded-xl md:rounded-2xl flex items-center justify-center transition-all bg-sky-400 border-2 border-white shadow-md cursor-grab active:cursor-grabbing hover:-translate-y-1"
                        :class="item.isDragging ? 'opacity-20 scale-90' : 'opacity-100'">
                        <span class="text-2xl md:text-4xl font-black text-white select-none pointer-events-none" style="font-family: 'Quicksand', sans-serif;">
                            {{ wordSettings.letterCase === 'uppercase' ? item.letter.toUpperCase() : item.letter.toLowerCase() }}
                        </span>
                    </div>
                </div>
            </div>
            
        </div>
        
    </div>

  </div>
</template>

<style scoped>
.font-quicksand {
    font-family: 'Quicksand', sans-serif;
}

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
</style>
