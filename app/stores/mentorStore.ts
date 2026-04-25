
export const useMentorStore = defineStore('mentor', () => {
  const isVisible = ref(false)
  const message = ref('')
  const isWiggling = ref(false)
  const isSpeaking = ref(false)
  const lastInteractionTime = ref(Date.now())
  const inactivityThreshold = 5000 // 5 seconds

  let inactivityTimer: any = null

  const showMessage = (text: string, duration = 5000) => {
    // If the same message is already showing, don't restart (prevents stutter)
    if (message.value === text && isVisible.value) return

    message.value = text
    isVisible.value = true
    isSpeaking.value = true
  }

  const hideMessage = () => {
    isVisible.value = false
    message.value = ''
    isSpeaking.value = false
  }

  const wiggle = () => {
    isWiggling.value = true
    setTimeout(() => {
      isWiggling.value = false
    }, 1000)
  }

  const updateInteraction = () => {
    lastInteractionTime.value = Date.now()
  }

  return {
    isVisible,
    message,
    isWiggling,
    isSpeaking,
    showMessage,
    hideMessage,
    wiggle,
    updateInteraction
  }
})
