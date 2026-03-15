<script setup lang="ts">
import { ref } from 'vue'
import { profileState, activeProfile, createProfile } from '@/utils/profileStore'

const showAddModal = ref(false)
const newName = ref('')
const newAvatar = ref('🧒')
const avatars = ['🧒', '👧', '👶', '🦁', '🐯', '🐼', '🦖', '🦄']

const handleAddProfile = () => {
    if (newName.value.trim()) {
        createProfile(newName.value.trim(), newAvatar.value)
        newName.value = ''
        showAddModal.value = false
    }
}

const handleSwitch = (id: string) => {
    profileState.activeProfileId = id
}
</script>

<template>
  <div v-if="activeProfile" class="flex flex-col gap-4 w-full">
    <!-- Current Profile Header -->
    <div class="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-white shadow-sm">
        <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-2xl shadow-inner">
            {{ activeProfile.avatar }}
        </div>
        <div class="flex-1">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-tighter">Profil Aktif</p>
            <p class="font-black text-slate-700 font-quicksand">{{ activeProfile.name }}</p>
        </div>
        <button @click="showAddModal = true" class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-xl hover:bg-slate-200 transition-colors">
            ➕
        </button>
    </div>

    <!-- Profile Selection Grid (Shortened) -->
    <div class="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        <button v-for="profile in profileState.profiles" :key="profile.id"
            @click="handleSwitch(profile.id)"
            class="flex flex-col items-center gap-1 min-w-[70px] transition-all"
            :class="profile.id === activeProfile.id ? 'scale-110' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'"
        >
            <div class="w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-3xl transition-all"
                :class="profile.id === activeProfile.id ? 'bg-indigo-50 border-indigo-500 shadow-md' : 'bg-white border-slate-200'">
                {{ profile.avatar }}
            </div>
            <span class="text-[10px] font-black text-slate-600 truncate w-full text-center font-quicksand">
                {{ profile.name }}
            </span>
        </button>
    </div>

    <!-- Add Profile Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
        <div class="glass-card bg-white w-full max-w-sm p-8 flex flex-col gap-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 class="text-2xl font-black text-slate-800 font-quicksand">Tambah Profil Baru</h3>
            
            <div class="space-y-2">
                <label class="font-bold text-slate-500">Nama Anak:</label>
                <input v-model="newName" type="text" placeholder="Masukkan nama..."
                    class="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-400 focus:outline-none font-bold text-lg" />
            </div>

            <div class="space-y-2">
                <label class="font-bold text-slate-500">Pilih Avatar:</label>
                <div class="grid grid-cols-4 gap-2">
                    <button v-for="a in avatars" :key="a"
                        @click="newAvatar = a"
                        class="w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl transition-all"
                        :class="newAvatar === a ? 'bg-indigo-50 border-indigo-500 scale-110 shadow-sm' : 'bg-white border-slate-50 hover:border-slate-200'">
                        {{ a }}
                    </button>
                </div>
            </div>

            <div class="flex gap-4 mt-2">
                <button @click="showAddModal = false" class="ui-capsule-interactive bg-white border-slate-200 text-slate-600 flex-1">Batal</button>
                <button @click="handleAddProfile" class="ui-capsule-interactive bg-indigo-500 border-indigo-600 text-white flex-2">Simpan</button>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.font-quicksand {
    font-family: 'Quicksand', sans-serif;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
