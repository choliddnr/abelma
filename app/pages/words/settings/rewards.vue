<script setup lang="ts">
const rewardStore = useRewardStore();
const profileStore = useProfileStore();
const rewards = computed(() => rewardStore.rewards);

const showAddModal = ref(false);
const newTitle = ref("");
const newCost = ref(50);
const newEmoji = ref("🎁");
const emojis = ["🍦", "🎮", "🧸", "🍭", "🍕", "🎡", "🎞️", "🛹", "👟", "👕", "💰"];

const handleAdd = async () => {
  if (newTitle.value.trim() && newCost.value > 0) {
    await rewardStore.addCustomReward(newTitle.value.trim(), newCost.value, newEmoji.value);
    newTitle.value = "";
    newCost.value = 50;
    showAddModal.value = false;
  }
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col p-4 md:p-8">
    <div v-if="profileStore.activeProfileId" class="w-full max-w-4xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-6">
        <h2 class="text-3xl font-black text-slate-800 font-quicksand flex items-center gap-3">
          <span class="text-4xl">🎁</span> Hadiah
          {{ profileStore.allProfiles.find((p) => p.id === profileStore.activeProfileId)?.name }}
        </h2>
        <UiButton @click="showAddModal = true" variant="accent" class="w-auto px-6" icon="+">
          Tambah Hadiah
        </UiButton>
      </div>

      <!-- Reward List -->
      <div class="grid grid-cols-1 gap-4">
        <div
          v-for="reward in rewards"
          :key="reward.id"
          class="bg-white p-6 rounded-3xl border-2 flex items-center gap-6 shadow-sm transition-all"
          :class="[
            reward.status === 'claimed' ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-100',
            reward.status === 'fulfilled' ? 'opacity-50' : '',
          ]"
        >
          <div
            class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-sm border border-slate-50"
          >
            {{ reward.emoji }}
          </div>

          <div class="flex-1">
            <h3 class="text-xl font-black text-slate-800 font-quicksand">{{ reward.title }}</h3>
            <div class="flex gap-4 items-center mt-1">
              <span class="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg font-bold text-sm"
                >🪙 {{ reward.cost }}</span
              >
              <span
                v-if="reward.status === 'claimed'"
                class="text-indigo-600 text-xs font-black uppercase tracking-wider"
              >
                🚀 Diklaim pada {{ formatDate(reward.claimedAt) }}
              </span>
              <span
                v-else-if="reward.status === 'fulfilled'"
                class="text-emerald-600 text-xs font-black uppercase"
              >
                ✅ Sudah Diterima
              </span>
              <span v-else class="text-slate-400 text-xs font-bold uppercase">
                Tersedia di Toko
              </span>
            </div>
          </div>

          <div class="flex gap-2">
            <UiButton
              v-if="reward.status === 'claimed'"
              @click="rewardStore.fulfillReward(reward.id)"
              variant="success"
              size="sm"
              icon="🎁"
            >
              Berikan Hadiah!
            </UiButton>
            <UiButton
              v-if="reward.status !== 'claimed'"
              @click="rewardStore.deleteReward(reward.id)"
              variant="ghost"
              class="text-rose-400 hover:text-rose-600 p-2"
              icon="🗑️"
            />
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="rewards.length === 0" class="py-12 flex flex-col items-center opacity-40">
          <span class="text-6xl mb-4">🏜️</span>
          <p class="font-bold text-slate-500">Belum ada daftar hadiah.</p>
        </div>
      </div>

      <!-- Add Reward Modal -->
      <div
        v-if="showAddModal"
        class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
      >
        <div class="glass-card bg-white w-full max-w-sm p-8 flex flex-col gap-6 shadow-2xl">
          <h3 class="text-2xl font-black text-slate-800 font-quicksand">Buat Hadiah Baru</h3>

          <div class="space-y-2">
            <label class="font-bold text-slate-500">Nama Hadiah:</label>
            <input
              v-model="newTitle"
              type="text"
              placeholder="Misal: Es Krim, Main PS..."
              class="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-400 focus:outline-none font-bold"
            />
          </div>

          <div class="space-y-2">
            <label class="font-bold text-slate-500">Harga (Koin):</label>
            <input
              v-model="newCost"
              type="number"
              class="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-400 focus:outline-none font-bold"
            />
          </div>

          <div class="space-y-2">
            <label class="font-bold text-slate-500">Ikon:</label>
            <div class="grid grid-cols-6 gap-2">
              <UiButton
                v-for="e in emojis"
                :key="e"
                @click="newEmoji = e"
                variant="none"
                class="w-10 h-10 rounded-xl border-2 flex items-center justify-center text-xl transition-all"
                :class="
                  newEmoji === e
                    ? 'bg-indigo-50 border-indigo-500 scale-110'
                    : 'bg-white border-slate-50'
                "
              >
                {{ e }}
              </UiButton>
            </div>
          </div>

          <div class="flex gap-4 mt-2">
            <UiButton @click="showAddModal = false" variant="white" class="flex-1">Batal</UiButton>
            <UiButton @click="handleAdd" variant="accent" class="flex-2">Simpan</UiButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-quicksand {
  font-family: "Quicksand", sans-serif;
}
</style>
