import { onMounted, onUnmounted, watch } from 'vue'
import { useMentorStore } from '@/stores/mentorStore'

export const useMentorHint = (message: string, delay = 5000) => {
  const mentorStore = useMentorStore()
  let timer: NodeJS.Timeout | null = null

  const startTimer = () => {
    stopTimer()
    timer = setTimeout(() => {
      mentorStore.wiggle()
      mentorStore.showMessage(message)
    }, delay)
  }

  const stopTimer = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  const resetTimer = () => {
    // Only reset if we're not currently showing a message
    // or if we want to dismiss the message when user starts acting
    if (mentorStore.isVisible) {
      mentorStore.hideMessage()
    }
    startTimer()
  }

  onMounted(() => {
    startTimer()
  })

  onUnmounted(() => {
    stopTimer()
    mentorStore.hideMessage()
  })

  return {
    resetTimer,
    stopTimer,
    startTimer
  }
}
