<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { activeProfile, profiles, createProfile, deleteProfile, selectProfile } from '@/utils/profileStore'
import { getProfileRewards, addCustomReward, deleteReward, fulfillReward } from '@/utils/rewardStore'
import { getProfileAnalytics } from '@/utils/analyticsStore'
import { wordCategories } from '@/data/words'

const router = useRouter()
const goBack = () => router.push('/')

// Parent Gate State
const isGatePassed = ref(false)
const num1 = ref(Math.floor(Math.random() * 5) + 2)
const num2 = ref(Math.floor(Math.random() * 5) + 2)
const userAnswer = ref('')
const gateError = ref(false)

const checkGate = () => {
    if (parseInt(userAnswer.value) === num1.value + num2.value) {
        isGatePassed.value = true
        gateError.value = false
    } else {
        gateError.value = true
        userAnswer.value = ''
        num1.value = Math.floor(Math.random() * 5) + 2
        num2.value = Math.floor(Math.random() * 5) + 2
    }
}

// Tabs
const activeTab = ref<'profiles' | 'rewards' | 'analytics'>('profiles')

// Profile Management logic
const showAddProfile = ref(false)
const newProfileName = ref('')
const selectedAvatar = ref('👦')
const avatars = ['👦', '👧', '🧒', '👶', '🐱', '🐶', '🦄', '🦁']

const handleAddProfile = () => {
    if (newProfileName.value.trim()) {
        createProfile(newProfileName.value.trim(), selectedAvatar.value)
        newProfileName.value = ''
        showAddProfile.value = false
    }
}

// Reward Management logic
const rewards = computed(() => getProfileRewards())
const showAddReward = ref(false)
const newRewardTitle = ref('')
const newRewardCost = ref(50)
const newRewardEmoji = ref('🎁')
const rewardEmojis = ['🍦', '🎮', '🧸', '🍭', '🍕', '🎡', '🎞️', '🛹', '👟', '👕', '💰']

const handleAddReward = () => {
    if (newRewardTitle.value.trim() && newRewardCost.value > 0) {
        addCustomReward(newRewardTitle.value.trim(), newRewardCost.value, newRewardEmoji.value)
        newRewardTitle.value = ''
        newRewardCost.value = 50
        showAddReward.value = false
    }
}

// Analytics logic (Combined)
const strugglingWords = computed(() => {
    const analytics = getProfileAnalytics()
    const allWords = wordCategories.flatMap(c => c.words)
    
    return Object.entries(analytics)
        .map(([id, data]) => {
            const word = allWords.find(w => w.id === id)
            return {
                word: word?.word || id,
                emoji: word?.emoji || '❓',
                mistakes: data.mistakes
            }
        })
        .filter(item => item.mistakes > 0)
        .sort((a, b) => b.mistakes - a.mistakes)
        .slice(0, 5)
})

const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    })
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
    <!-- Background patterns (keep subtle but non-opaque) -->
    <div class="absolute inset-x-0 top-0 h-128 bg-indigo-50/10 rounded-b-[4rem] md:rounded-b-[8rem] pointer-events-none"></div>

    
    <!-- Parent Gate Section (Enhanced Glassmorphism) -->
    <div v-if="!isGatePassed" class="glass-card w-full max-w-md p-10 flex flex-col items-center gap-8 animate-entrance relative z-20">
        <div class="w-20 h-20 bg-linear-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center text-4xl shadow-lg transform -rotate-6">
            🔒
        </div>
        <div class="text-center space-y-2">
            <h2 class="text-3xl font-black text-slate-800 font-quicksand">Area Orang Tua</h2>
            <p class="text-slate-500 font-semibold">Selesaikan teka-teki kecil ini:</p>
        </div>
        
        <div class="text-5xl font-black text-indigo-600 font-quicksand py-6 bg-slate-50 w-full text-center rounded-3xl border-2 border-slate-100 shadow-inner">
            {{ num1 }} + {{ num2 }}
        </div>
        
        <div class="w-full space-y-4">
            <input v-model="userAnswer" type="number" 
                class="w-full text-center text-4xl font-black p-5 rounded-3xl border-4 border-slate-100 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 focus:outline-none transition-all"
                placeholder="?"
                @keyup.enter="checkGate"
            />
            <p v-if="gateError" class="text-rose-500 font-black text-center animate-bounce">Ups, hitung lagi ya! 🧐</p>
        </div>
        
        <div class="flex gap-4 w-full">
            <button @click="goBack" class="ui-capsule-interactive bg-white border-slate-200 text-slate-500 flex-1 hover:bg-slate-50">Batal</button>
            <button @click="checkGate" class="ui-capsule-interactive bg-indigo-500 border-indigo-600 text-white flex-2 shadow-indigo-200">Masuk</button>
        </div>
    </div>

    <!-- Main Dashboard -->
    <div v-else class="glass-card w-full max-w-4xl p-8 flex flex-col gap-8 min-h-[80vh]">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 class="text-3xl font-black text-slate-800 font-quicksand flex items-center gap-3">
                <span class="text-4xl">👨‍👩‍👧</span> Area Orang Tua
            </h2>
            <button @click="goBack" class="ui-capsule-interactive bg-emerald-500 border-emerald-600 text-white w-auto px-6">Selesai</button>
        </div>

        <!-- Premium Tab Navigation -->
        <div class="grid grid-cols-3 p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-3xl gap-1.5">
            <button @click="activeTab = 'profiles'"
                class="flex flex-col md:flex-row items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs md:text-base transition-all duration-300"
                :class="activeTab === 'profiles' ? 'bg-white text-indigo-600 shadow-md scale-[1.02]' : 'text-slate-500 hover:bg-white/40'">
                <span class="text-xl md:text-2xl">👥</span>
                <span>Anak</span>
            </button>
            <button @click="activeTab = 'rewards'"
                class="flex flex-col md:flex-row items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs md:text-base transition-all duration-300"
                :class="activeTab === 'rewards' ? 'bg-white text-amber-600 shadow-md scale-[1.02]' : 'text-slate-500 hover:bg-white/40'">
                <span class="text-xl md:text-2xl">🎁</span>
                <span>Hadiah</span>
            </button>
            <button @click="activeTab = 'analytics'"
                class="flex flex-col md:flex-row items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs md:text-base transition-all duration-300"
                :class="activeTab === 'analytics' ? 'bg-white text-emerald-600 shadow-md scale-[1.02]' : 'text-slate-500 hover:bg-white/40'">
                <span class="text-xl md:text-2xl">📊</span>
                <span>Laporan</span>
            </button>
        </div>

        <!-- Tab Content: Profiles -->
        <div v-if="activeTab === 'profiles'" class="flex-1 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-black text-slate-700">Daftar Anak</h3>
                <button @click="showAddProfile = true" class="text-indigo-600 font-black flex items-center gap-1 hover:underline">
                    + Tambah Profil Baru
                </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div v-for="profile in profiles" :key="profile.id"
                    class="p-6 rounded-3xl border-2 transition-all flex items-center gap-4 bg-white"
                    :class="activeProfile?.id === profile.id ? 'border-indigo-400 ring-2 ring-indigo-50 shadow-md' : 'border-slate-100 opacity-80'">
                    <span class="text-4xl">{{ profile.avatar }}</span>
                    <div class="flex-1">
                        <p class="font-black text-lg text-slate-800">{{ profile.name }}</p>
                        <button v-if="activeProfile?.id !== profile.id" @click="selectProfile(profile.id)" class="text-xs font-bold text-indigo-500 hover:underline">Pilih Sekarang</button>
                        <span v-else class="text-xs font-black text-emerald-500 uppercase tracking-widest">Sedang Aktif ✅</span>
                    </div>
                    <button v-if="profiles.length > 1" @click="deleteProfile(profile.id)" class="text-rose-300 hover:text-rose-500 p-2">🗑️</button>
                </div>
            </div>

            <!-- Add Profile Modal Overlay -->
            <div v-if="showAddProfile" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <div class="bg-white w-full max-w-sm p-8 rounded-3xl shadow-2xl space-y-6">
                    <h3 class="text-2xl font-black text-slate-800">Profil Baru</h3>
                    <div class="space-y-2">
                        <label class="font-bold text-slate-500">Nama Panggilan:</label>
                        <input v-model="newProfileName" type="text" placeholder="Misal: Andi, Susi..."
                            class="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-400 focus:outline-none font-bold" />
                    </div>
                    <div class="space-y-4">
                        <label class="font-bold text-slate-500">Pilih Avatar:</label>
                        <div class="grid grid-cols-4 gap-2">
                            <button v-for="a in avatars" :key="a" @click="selectedAvatar = a"
                                class="w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl transition-all"
                                :class="selectedAvatar === a ? 'bg-indigo-50 border-indigo-400 scale-110' : 'bg-white border-slate-50'">
                                {{ a }}
                            </button>
                        </div>
                    </div>
                    <div class="flex gap-4 pt-4">
                        <button @click="showAddProfile = false" class="ui-capsule-interactive bg-white border-slate-200 text-slate-600 flex-1">Batal</button>
                        <button @click="handleAddProfile" class="ui-capsule-interactive bg-indigo-500 border-indigo-600 text-white flex-2">Simpan</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tab Content: Rewards -->
        <div v-if="activeTab === 'rewards'" class="flex-1 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-black text-slate-700">Daftar Hadiah Tugas</h3>
                <button @click="showAddReward = true" class="text-indigo-600 font-black flex items-center gap-1 hover:underline">
                    + Tambah Hadiah Baru
                </button>
            </div>

            <div v-if="activeProfile" class="space-y-3">
                <div v-for="reward in rewards" :key="reward.id"
                    class="bg-white p-4 rounded-2xl border flex items-center gap-4 transition-all"
                    :class="reward.status === 'claimed' ? 'border-indigo-300 bg-indigo-50/30' : 'border-slate-100'">
                    <span class="text-3xl">{{ reward.emoji }}</span>
                    <div class="flex-1">
                        <p class="font-black text-slate-800">{{ reward.title }}</p>
                        <div class="flex gap-3 items-center">
                             <span class="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">🪙 {{ reward.cost }}</span>
                             <span v-if="reward.status === 'claimed'" class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">DIKLAIM: {{ formatDate(reward.claimedAt) }}</span>
                             <span v-else-if="reward.status === 'fulfilled'" class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">SELESAI ✅</span>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button v-if="reward.status === 'claimed'" @click="fulfillReward(reward.id)"
                            class="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-black shadow-sm transition-all hover:scale-105 active:scale-95">
                            Berikan! 🎁
                        </button>
                        <button v-if="reward.status !== 'claimed'" @click="deleteReward(reward.id)" class="text-rose-300 hover:text-rose-500 p-2">🗑️</button>
                    </div>
                </div>
            </div>

            <!-- Add Reward Modal Overlay -->
            <div v-if="showAddReward" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <div class="bg-white w-full max-w-sm p-8 rounded-3xl shadow-2xl space-y-6">
                    <h3 class="text-2xl font-black text-slate-800">Hadiah Baru</h3>
                    <div class="space-y-2">
                        <label class="font-bold text-slate-500">Nama Hadiah:</label>
                        <input v-model="newRewardTitle" type="text" placeholder="Misal: Es Krim, Main PS..."
                            class="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-400 focus:outline-none font-bold" />
                    </div>
                    <div class="space-y-4">
                        <label class="font-bold text-slate-500">Ikon:</label>
                        <div class="grid grid-cols-6 gap-2">
                            <button v-for="e in rewardEmojis" :key="e" @click="newRewardEmoji = e"
                                class="w-10 h-10 rounded-xl border-2 flex items-center justify-center text-xl transition-all"
                                :class="newRewardEmoji === e ? 'bg-indigo-50 border-indigo-400 scale-110' : 'bg-white border-slate-50'">
                                {{ e }}
                            </button>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <label class="font-bold text-slate-500">Harga (Koin):</label>
                        <input v-model="newRewardCost" type="number"
                            class="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-400 focus:outline-none font-bold" />
                    </div>
                    <div class="flex gap-4 pt-4">
                        <button @click="showAddReward = false" class="ui-capsule-interactive bg-white border-slate-200 text-slate-600 flex-1">Batal</button>
                        <button @click="handleAddReward" class="ui-capsule-interactive bg-indigo-500 border-indigo-600 text-white flex-2">Simpan</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tab Content: Analytics -->
        <div v-if="activeTab === 'analytics'" class="flex-1 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
             <div v-if="activeProfile" class="space-y-6">
                <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 class="text-xl font-black text-slate-800">Laporan: {{ activeProfile.name }}</h3>
                </div>

                <div v-if="strugglingWords.length > 0" class="space-y-4">
                    <p class="text-slate-500 font-bold text-sm uppercase tracking-wider italic">Anak sering bingung pada kata-kata ini:</p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div v-for="item in strugglingWords" :key="item.word" 
                            class="flex items-center gap-4 bg-rose-50 p-4 rounded-2xl border-2 border-rose-100 shadow-xs group">
                            <span class="text-4xl group-hover:scale-125 transition-transform duration-300">{{ item.emoji }}</span>
                            <div class="flex-1">
                                <p class="font-black text-rose-700 uppercase font-quicksand text-lg">{{ item.word }}</p>
                                <p class="text-rose-500 text-xs font-bold">{{ item.mistakes }} kali keliru eja/tebak</p>
                            </div>
                            <div class="w-3 h-3 rounded-full bg-rose-400 animate-pulse"></div>
                        </div>
                    </div>
                </div>
                <div v-else class="bg-emerald-50 p-12 rounded-3xl border-2 border-emerald-100 flex flex-col items-center gap-4 text-center">
                    <span class="text-6xl animate-bounce">🌟</span>
                    <div>
                        <h4 class="font-black text-emerald-800 text-2xl mb-1">Wah, Sangat Bagus!</h4>
                        <p class="text-emerald-600 font-bold text-lg">Belum ada hambatan berarti. Terus dukung semangat belajarnya ya!</p>
                    </div>
                </div>

                <!-- Section for future Alphabet analytics -->
                <div class="mt-8 pt-8 border-t border-slate-100 opacity-50 grayscale pointer-events-none">
                     <h4 class="font-black text-slate-500 text-sm uppercase tracking-widest mb-4">Laporan Huruf (Segera Hadir)</h4>
                     <div class="h-24 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                         <span class="font-bold text-slate-400">Menunggu integrasi data huruf...</span>
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
</style>
