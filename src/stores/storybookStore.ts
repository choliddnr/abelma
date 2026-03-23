import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStorybookStore = defineStore('storybook', () => {
  const currentIndex = ref(0)
  const isSpeaking = ref(false)
  const challengeDone = ref<Set<number>>(new Set())
  const showFinish = ref(false)
  const showChallenge = ref(false)
  const viewMode = ref<'list' | 'story'>('list')

  function reset() {
    currentIndex.value = 0
    isSpeaking.value = false
    challengeDone.value.clear()
    showFinish.value = false
    showChallenge.value = false
    viewMode.value = 'list'
  }

  return {
    currentIndex,
    isSpeaking,
    challengeDone,
    showFinish,
    showChallenge,
    viewMode,
    reset,
  }
})
