<script setup lang="ts">
const profileStore = useProfileStore()
const syncStore = useSyncStore()
const showDropdown = ref(false)

// Parent Gate State
const showGate = ref(false)
const pendingProfileId = ref<string | null>(null)
const num1 = ref(0)
const num2 = ref(0)
const userAnswer = ref<string>('')
const gateError = ref(false)
const answerInput = ref<HTMLInputElement | null>(null)

const toggleDropdown = (e: Event) => {
  e.stopPropagation()
  showDropdown.value = !showDropdown.value
}

const startSwitch = (id: string) => {
  if (profileStore.activeProfile && id === profileStore.activeProfile.id) {
    showDropdown.value = false
    return
  }

  showDropdown.value = false
  pendingProfileId.value = id
  num1.value = Math.floor(Math.random() * 5) + 2
  num2.value = Math.floor(Math.random() * 5) + 2
  userAnswer.value = ''
  gateError.value = false
  showGate.value = true

  // Auto focus input
  nextTick(() => {
    answerInput.value?.focus()
  })
}

const confirmSwitch = () => {
  const total = num1.value + num2.value
  const answer = parseInt(userAnswer.value)

  if (answer === total) {
    if (pendingProfileId.value) {
      profileStore.selectProfile(pendingProfileId.value)
      syncStore.triggerSync().catch(console.error)
    }
    showGate.value = false
    pendingProfileId.value = null
    userAnswer.value = ''
  } else {
    gateError.value = true
    userAnswer.value = ''
    num1.value = Math.floor(Math.random() * 5) + 2
    num2.value = Math.floor(Math.random() * 5) + 2
    nextTick(() => {
      answerInput.value?.focus()
    })
  }
}

const cancelGate = () => {
  showGate.value = false
  pendingProfileId.value = null
  userAnswer.value = ''
}

// Click outside logic
const dropdownRef = ref<HTMLElement | null>(null)
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showDropdown.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div v-if="profileStore.activeProfile" class="relative" ref="dropdownRef">
    <!-- Active Profile Trigger -->
    <button @click.stop="toggleDropdown"
      class="ui-capsule-interactive bg-white border-slate-200 text-slate-700 w-auto px-2 md:px-3 h-10 md:h-12 shadow-sm hover:border-indigo-300 transition-all flex items-center gap-1.5 md:gap-2">
      <span class="text-xl md:text-2xl filter drop-shadow-sm">{{ profileStore.activeProfile.avatar }}</span>
      <span class="font-black text-xs md:text-sm hidden md:inline truncate max-w-[80px]">{{
        profileStore.activeProfile.name
      }}</span>
      <span class="text-[8px] md:text-[10px] opacity-40 transition-transform duration-300"
        :class="showDropdown ? 'rotate-180' : ''">▼</span>
    </button>

    <!-- Dropdown Menu -->
    <div v-if="showDropdown"
      class="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-indigo-50 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
      <div class="px-3 py-2 border-b border-slate-50 mb-1 text-center">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ganti Profil</p>
      </div>
      <div class="flex flex-col gap-1 max-h-64 overflow-y-auto custom-scrollbar">
        <button v-for="profile in profileStore.allProfiles" :key="profile.id" @click.stop="startSwitch(profile.id)"
          class="flex items-center gap-3 p-2 rounded-2xl transition-all w-full text-left"
          :class="profile.id === profileStore.activeProfile.id ? 'bg-indigo-50/50' : 'hover:bg-slate-50'">
          <div
            class="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-xs border border-slate-100 text-2xl">
            {{ profile.avatar }}
          </div>
          <div class="flex-1 overflow-hidden">
            <p class="font-black text-slate-700 text-xs truncate">{{ profile.name }}</p>
            <p v-if="profile.id === profileStore.activeProfile.id"
              class="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Aktif ✅</p>
          </div>
        </button>
      </div>
    </div>

    <!-- Parent Gate Modal (consistent with Dashboard) -->
    <Teleport to="body">
      <div v-if="showGate"
        class="fixed inset-0 z-110 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
        <div
          class="glass-card bg-white w-full max-w-sm p-10 flex flex-col items-center gap-8 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
          <div
            class="w-20 h-20 bg-linear-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center text-4xl shadow-lg transform -rotate-6">
            🔒
          </div>

          <div class="text-center space-y-2">
            <h3 class="text-2xl font-black text-slate-800 font-quicksand">Konfirmasi Orang Tua</h3>
            <p class="text-slate-500 font-bold text-sm">Selesaikan tantangan untuk ganti profil:</p>
          </div>

          <div
            class="text-5xl font-black text-indigo-600 font-quicksand py-6 bg-slate-50 w-full text-center rounded-3xl border-2 border-slate-100 shadow-inner">
            {{ num1 }} + {{ num2 }}
          </div>

          <div class="w-full space-y-3">
            <input v-model="userAnswer" type="number" ref="answerInput"
              class="w-full text-center text-4xl font-black p-5 rounded-3xl border-4 border-slate-100 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 focus:outline-none transition-all placeholder:text-slate-200"
              placeholder="?" @keyup.enter="confirmSwitch" />
            <p v-if="gateError" class="text-rose-500 font-black text-center animate-bounce text-sm">Coba hitung lagi ya!
              🧐</p>
          </div>

          <div class="flex gap-4 w-full">
            <button @click.stop="cancelGate"
              class="ui-capsule-interactive bg-white border-slate-200 text-slate-500 flex-1 hover:bg-slate-50">Batal</button>
            <button @click.stop="confirmSwitch"
              class="ui-capsule-interactive bg-indigo-500 border-indigo-600 text-white flex-2 shadow-indigo-200">Oke</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.font-quicksand {
  font-family: 'Quicksand', sans-serif;
}

.glass-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 3rem;
}
</style>

