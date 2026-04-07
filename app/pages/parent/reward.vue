<script setup lang="ts">
import { REWARD_EMOJIS } from "~/constants/reward";

const showAddReward = ref(false);
const newRewardTitle = ref("");
const newRewardCost = ref(50);
const newRewardEmoji = ref("🎁");

const { activeProfileId } = storeToRefs(useProfileStore());
const { rewards } = storeToRefs(useRewardStore());
const { fulfillReward, fetch } = useRewardStore();

await callOnce(async () => {
  await fetch();
});

const handleAddReward = async () => {
  if (newRewardTitle.value.trim() && newRewardCost.value > 0) {
    await $fetch<ResRewardPost>("/api/reward", {
      method: "POST",
      body: {
        profile_id: activeProfileId.value,
        title: newRewardTitle.value,
        cost: newRewardCost.value,
        emoji: newRewardEmoji.value,
      },
      onResponse: ({ response, error }) => {
        if (error) {
          console.error(error);
        } else {
          rewards.value.push(response._data);
        }
      },
    });
    newRewardTitle.value = "";
    newRewardCost.value = 50;
    showAddReward.value = false;
  }
};

const handleDeleteReward = async (id: number) => {
  if (confirm("Apakah Anda yakin ingin menghapus hadiah ini?")) {
    await $fetch(`/api/reward/${id}`, {
      method: "DELETE",
      onResponse: ({ error }) => {
        if (!error) {
          rewards.value = rewards.value.filter((r) => r.id !== id);
        } else {
          console.error(error);
        }
      },
    });
  }
};
</script>
<template>
  <!-- Tab Content: Rewards -->
  <div
    class="flex-1 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300"
  >
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-black text-slate-700">Daftar Hadiah Tugas</h3>
      <button
        @click="showAddReward = true"
        class="text-indigo-600 font-black flex items-center gap-1 hover:underline"
      >
        + Tambah Hadiah Baru
      </button>
    </div>

    <div
      v-if="activeProfileId"
      class="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      <div v-if="rewards.length === 0" class="col-span-full text-center py-8">
        <p class="text-slate-500 font-semibold">Belum ada hadiah</p>
      </div>
      <div
        v-else
        v-for="reward in rewards"
        :key="reward.id"
        class="bg-white/70 backdrop-blur-md p-5 rounded-3xl border-2 flex flex-col items-center justify-between transition-all hover:-translate-y-1 hover:shadow-lg aspect-square relative text-center"
        :class="
          reward.status === 'claimed'
            ? 'border-indigo-300 bg-indigo-50/50'
            : 'border-white/50'
        "
      >
        <button
          v-if="reward.status !== 'claimed'"
          @click="handleDeleteReward(reward.id)"
          class="absolute top-3 right-3 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors w-10 h-10 flex items-center justify-center text-lg"
        >
          🗑️
        </button>

        <div
          class="flex-1 flex flex-col justify-center items-center w-full mt-2"
        >
          <span class="text-7xl drop-shadow-md mb-4">{{ reward.emoji }}</span>
          <p
            class="font-black text-slate-800 line-clamp-2 text-lg leading-tight px-2"
          >
            {{ reward.title }}
          </p>
          <span
            class="text-sm font-bold text-amber-600 bg-amber-50/80 border border-amber-100/50 px-3 py-1.5 rounded-xl shadow-sm mt-3"
            >🪙 {{ reward.cost }}</span
          >
        </div>

        <div class="mt-4 w-full shrink-0">
          <button
            v-if="reward.status === 'claimed'"
            @click="fulfillReward(reward.id)"
            class="w-full py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-black shadow-sm transition-all hover:scale-105 active:scale-95 flex flex-col items-center justify-center leading-tight gap-1"
          >
            <span>Berikan! 🎁</span>
            <span class="text-[10px] font-bold opacity-90">{{
              formatDate(reward.claimedAt!)
            }}</span>
          </button>

          <div
            v-else-if="reward.status === 'fulfilled'"
            class="w-full py-2.5 bg-emerald-100/50 border border-emerald-200 block rounded-xl text-sm font-black shadow-sm text-emerald-600 uppercase tracking-wider"
          >
            SELESAI ✅
          </div>
        </div>
      </div>
    </div>

    <!-- Add Reward Modal Overlay -->
    <div
      v-if="showAddReward"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    >
      <div
        class="bg-white w-full max-w-sm p-8 rounded-3xl shadow-2xl space-y-6"
      >
        <h3 class="text-2xl font-black text-slate-800">Hadiah Baru</h3>
        <div class="space-y-2">
          <label class="font-bold text-slate-500">Nama Hadiah:</label>
          <input
            v-model="newRewardTitle"
            type="text"
            placeholder="Misal: Es Krim, Main PS..."
            class="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-400 focus:outline-none font-bold"
          />
        </div>
        <div class="space-y-4">
          <label class="font-bold text-slate-500">Ikon:</label>
          <div class="grid grid-cols-6 gap-2">
            <button
              v-for="e in REWARD_EMOJIS"
              :key="e"
              @click="newRewardEmoji = e"
              class="w-10 h-10 rounded-xl border-2 flex items-center justify-center text-xl transition-all"
              :class="
                newRewardEmoji === e
                  ? 'bg-indigo-50 border-indigo-400 scale-110'
                  : 'bg-white border-slate-50'
              "
            >
              {{ e }}
            </button>
          </div>
        </div>
        <div class="space-y-2">
          <label class="font-bold text-slate-500">Harga (Koin):</label>
          <input
            v-model="newRewardCost"
            type="number"
            class="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-400 focus:outline-none font-bold"
          />
        </div>
        <div class="flex gap-4 pt-4">
          <button
            @click="showAddReward = false"
            class="ui-capsule-interactive bg-white border-slate-200 text-slate-600 flex-1"
          >
            Batal
          </button>
          <button
            @click="handleAddReward"
            class="ui-capsule-interactive bg-indigo-500 border-indigo-600 text-white flex-2"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
