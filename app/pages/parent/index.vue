<script setup lang="ts">
import { PROFILE_AVATARS } from "~/constants/profile";

const { activeProfileId, profiles } = storeToRefs(useProfileStore());

const showAddProfile = ref(false);
const newProfileName = ref("");
const selectedAvatar = ref("👦");

const handleAddProfile = async () => {
  // Logic from parent.vue (previously commented out in original)
  // if (newProfileName.value.trim()) {
  //   await createProfile(newProfileName.value.trim(), selectedAvatar.value);
  //   newProfileName.value = "";
  //   showAddProfile.value = false;
  // }
};
</script>

<template>
  <div
    class="flex-1 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300"
  >
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-black text-slate-700">Daftar Anak</h3>
      <button
        @click="showAddProfile = true"
        class="text-indigo-600 font-black flex items-center gap-1 hover:underline"
      >
        + Tambah Profil Baru
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div
        v-for="profile in profiles"
        :key="profile.id"
        class="p-6 rounded-3xl border-4 transition-all flex items-center gap-4 bg-white/70 backdrop-blur-md shadow-sm"
        :class="
          activeProfileId === profile.id
            ? 'border-indigo-400 ring-2 ring-indigo-50/50 shadow-lg scale-[1.01]'
            : 'border-white/50 hover:border-white opacity-90'
        "
      >
        <span class="text-4xl">{{ profile.avatar }}</span>
        <div class="flex-1">
          <p class="font-black text-lg text-slate-800">
            {{ profile.name }}
          </p>
          <button
            v-if="activeProfileId !== profile.id"
            @click="activeProfileId = profile.id"
            class="text-xs font-bold text-indigo-500 hover:underline"
          >
            Pilih Sekarang
          </button>
          <span
            v-else
            class="text-xs font-black text-emerald-500 uppercase tracking-widest"
            >Sedang Aktif ✅</span
          >
        </div>
      </div>
    </div>

    <!-- Add Profile Modal Overlay -->
    <div
      v-if="showAddProfile"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 rounded-4xl backdrop-blur-sm"
    >
      <div
        class="bg-white w-full max-w-sm p-8 rounded-3xl shadow-2xl space-y-6"
      >
        <h3 class="text-2xl font-black text-slate-800">Profil Baru</h3>
        <div class="space-y-2">
          <label class="font-bold text-slate-500">Nama Panggilan:</label>
          <input
            v-model="newProfileName"
            type="text"
            placeholder="Misal: Andi, Susi..."
            class="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-400 focus:outline-none font-bold"
          />
        </div>
        <div class="space-y-4">
          <label class="font-bold text-slate-500">Pilih Avatar:</label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="a in PROFILE_AVATARS"
              :key="a"
              @click="selectedAvatar = a"
              class="w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl transition-all"
              :class="
                selectedAvatar === a
                  ? 'bg-indigo-50 border-indigo-400 scale-110'
                  : 'bg-white border-slate-50'
              "
            >
              {{ a }}
            </button>
          </div>
        </div>
        <div class="flex gap-4 pt-4">
          <button
            @click="showAddProfile = false"
            class="ui-capsule-interactive bg-white border-slate-200 text-slate-600 flex-1"
          >
            Batal
          </button>
          <button
            @click="handleAddProfile"
            class="ui-capsule-interactive bg-indigo-500 border-indigo-600 text-white flex-2"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
