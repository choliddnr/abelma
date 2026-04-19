<script setup lang="ts">
const { confirm } = useConfirm();

const showAddChallenge = ref(false);
const newChallengeTitle = ref("");
const newChallengeDesc = ref("");
const newChallengeReward = ref(10);

const { activeProfileId } = storeToRefs(useProfileStore());
const { changeCoins } = useProfileStore();

const challengeStore = useChallengeStore();
const { challenges } = storeToRefs(challengeStore);
const { success, error: notifyError } = useNotification();

callOnce(async () => await useAsyncData("challenges-parent", () => challengeStore.fetch()));

const isEditing = ref(false);
const editingChallengeId = ref<number | null>(null);

const openAddModal = () => {
  isEditing.value = false;
  editingChallengeId.value = null;
  newChallengeTitle.value = "";
  newChallengeDesc.value = "";
  newChallengeReward.value = 10;
  showAddChallenge.value = true;
};

const openEditModal = (challenge: any) => {
  isEditing.value = true;
  editingChallengeId.value = challenge.id;
  newChallengeTitle.value = challenge.title;
  newChallengeDesc.value = challenge.description;
  newChallengeReward.value = challenge.coinReward;
  showAddChallenge.value = true;
};

const handleSaveChallenge = async () => {
  if (
    newChallengeTitle.value.trim() &&
    newChallengeDesc.value.trim() &&
    newChallengeReward.value > 0
  ) {
    if (isEditing.value && editingChallengeId.value) {
      await $fetch(`/api/challenges/${editingChallengeId.value}`, {
        method: "PATCH",
        body: {
          title: newChallengeTitle.value,
          description: newChallengeDesc.value,
          coin_reward: newChallengeReward.value,
        },
        onResponse: ({ error }) => {
          if (!error) {
            challenges.value = challenges.value.map((c) =>
              c.id === editingChallengeId.value
                ? {
                    ...c,
                    title: newChallengeTitle.value,
                    description: newChallengeDesc.value,
                    coinReward: newChallengeReward.value,
                  }
                : c,
            );
            success("Misi berhasil diperbarui!");
          } else {
            notifyError("Gagal memperbarui misi.");
          }
        },
      });
    } else {
      await $fetch("/api/challenges", {
        method: "POST",
        body: {
          profile_id: activeProfileId.value,
          title: newChallengeTitle.value,
          description: newChallengeDesc.value,
          coin_reward: newChallengeReward.value,
        },
        onResponse: ({ response, error }) => {
          if (!error) {
            challenges.value.unshift(response._data);
            success("Misi baru berhasil ditambahkan!");
          } else {
            notifyError("Gagal menambahkan misi baru.");
          }
        },
      });
    }
    showAddChallenge.value = false;
  }
};

const handleDeleteChallenge = async (id: number) => {
  const confirmed = await confirm({
    title: "Hapus Misi?",
    message: "Apakah Anda yakin ingin menghapus misi ini?",
    confirmText: "Hapus",
    cancelText: "Batal",
    icon: "🗑️",
    variant: "danger",
  });

  if (confirmed) {
    await $fetch(`/api/challenges/${id}`, {
      method: "DELETE",
      onResponse: ({ error }) => {
        if (!error) {
          challenges.value = challenges.value.filter((c) => c.id !== id);
          success("Misi berhasil dihapus.");
        } else {
          notifyError("Gagal menghapus misi.");
        }
      },
    });
  }
};

const handleFulfillChallenge = async (id: number) => {
  await $fetch(`/api/challenges/${id}`, {
    method: "PATCH",
    body: {
      status: "completed",
    },
    onResponse: ({ response, error }) => {
      if (response.ok) {
        challenges.value = challenges.value.map((c) =>
          c.id === id
            ? {
                ...c,
                status: "completed",
                completedAt: new Date().toISOString(),
              }
            : c,
        );
        success("Misi selesai! Koin telah ditambahkan ke profil anak.");
        // useProfileStore().fetchProfile(activeProfileId.value!); // Refresh coins
      } else {
        notifyError("Gagal memvalidasi misi.");
      }
    },
  });
};

const handleResetChallenge = async (id: number) => {
  await $fetch(`/api/challenges/${id}`, {
    method: "PATCH",
    body: {
      status: "available",
    },
    onResponse: ({ response, error }) => {
      if (response.ok) {
        challenges.value = challenges.value.map((c) =>
          c.id === id ? { ...c, status: "available" } : c,
        );
        success("Misi diulang. Status kembali tersedia.");
      } else {
        notifyError("Gagal mengulang misi.");
      }
    },
  });
};
</script>

<template>
  <div
    class="flex-1 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300"
  >
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-black text-slate-700">Daftar Misi Anak</h3>
      <UiButton
        @click="openAddModal"
        variant="ghost"
        class="text-sky-600 font-black flex items-center gap-1 hover:underline p-0 h-auto"
      >
        + Tambah Misi Baru
      </UiButton>
    </div>

    <div
      v-if="activeProfileId"
      class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    >
      <div
        v-if="challenges.length === 0"
        class="col-span-full text-center py-8"
      >
        <p class="text-slate-500 font-semibold">Belum ada misi</p>
      </div>
      <div
        v-else
        v-for="challenge in challenges"
        :key="challenge.id"
        class="bg-white/70 backdrop-blur-md p-5 rounded-3xl border-2 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-lg relative"
        :class="
          challenge.status === 'pending_validation'
            ? 'border-sky-300 bg-sky-50/50'
            : 'border-white/50'
        "
      >
        <div class="absolute top-3 right-3 flex gap-2">
          <UiButton
            v-if="challenge.status !== 'pending_validation'"
            @click="openEditModal(challenge)"
            variant="ghost"
            class="text-sky-500 hover:text-sky-700 hover:bg-sky-50 p-0 rounded-full transition-colors w-10 h-10 flex items-center justify-center text-lg"
            icon="✏️"
          />
          <UiButton
            v-if="challenge.status !== 'pending_validation'"
            @click="handleDeleteChallenge(challenge.id)"
            variant="ghost"
            class="text-red-500 hover:text-red-700 hover:bg-red-50 p-0 rounded-full transition-colors w-10 h-10 flex items-center justify-center text-lg"
            icon="🗑️"
          />
        </div>

        <div class="mt-2">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-3xl">⭐</span>
            <h4 class="font-black text-slate-800 text-xl">
              {{ challenge.title }}
            </h4>
          </div>
          <p class="text-slate-600 font-medium mb-4 line-clamp-3">
            {{ challenge.description }}
          </p>
          <span
            class="inline-block text-sm font-bold text-amber-600 bg-amber-50/80 border border-amber-100/50 px-3 py-1.5 rounded-xl shadow-sm mb-4"
          >
            🪙 Hadiah: {{ challenge.coinReward }} Koin
          </span>
        </div>

        <div class="w-full shrink-0">
          <div
            v-if="challenge.status === 'pending_validation'"
            class="flex flex-col gap-2"
          >
            <UiButton
              @click="handleFulfillChallenge(challenge.id)"
              variant="success"
              class="w-full py-2.5 shadow-sm leading-tight gap-1 h-auto"
            >
              Validasi Selesai ✅
            </UiButton>
            <UiButton
              @click="handleResetChallenge(challenge.id)"
              variant="accent"
              class="w-full py-2.5 h-auto text-amber-600 border-amber-200 hover:bg-amber-50 text-sm font-bold"
            >
              Tolak & Ulangi 🔄
            </UiButton>
          </div>

          <div
            v-else-if="challenge.status === 'completed'"
            class="w-full flex flex-col gap-2"
          >
            <div
              class="w-full py-2.5 bg-emerald-100/50 border border-emerald-200 block text-center rounded-xl text-sm font-black shadow-sm text-emerald-600 uppercase tracking-wider"
            >
              SELESAI ✅
            </div>
            <UiButton
              @click="handleResetChallenge(challenge.id)"
              variant="accent"
              class="w-full py-2.5 h-auto text-sky-600 border-sky-200 hover:bg-sky-50 text-sm font-bold"
            >
              Ulangi Misi 🔄
            </UiButton>
          </div>
          <div
            v-else
            class="w-full py-2.5 bg-slate-100/50 border border-slate-200 block text-center rounded-xl text-sm font-black text-slate-500 uppercase tracking-wider"
          >
            MENUNGGU...
          </div>
        </div>
      </div>
    </div>

    <!-- Add Challenge Modal Overlay -->
    <div
      v-if="showAddChallenge"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    >
      <div
        class="bg-white w-full max-w-sm p-8 rounded-3xl shadow-2xl space-y-6"
      >
        <h3 class="text-2xl font-black text-slate-800">
          {{ isEditing ? "Edit Misi" : "Misi Baru" }}
        </h3>
        <div class="space-y-2">
          <label class="font-bold text-slate-500">Judul Misi:</label>
          <input
            v-model="newChallengeTitle"
            type="text"
            placeholder="Misal: Bersihkan Kamar"
            class="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-sky-400 focus:outline-none font-bold"
          />
        </div>
        <div class="space-y-2">
          <label class="font-bold text-slate-500">Deskripsi:</label>
          <textarea
            v-model="newChallengeDesc"
            rows="3"
            placeholder="Misal: Rapikan kasur dan sapu lantai"
            class="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-sky-400 focus:outline-none font-bold resize-none"
          ></textarea>
        </div>
        <div class="space-y-2">
          <label class="font-bold text-slate-500">Hadiah Koin:</label>
          <input
            v-model="newChallengeReward"
            type="number"
            class="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-sky-400 focus:outline-none font-bold"
          />
        </div>
        <div class="flex gap-4 pt-4">
          <UiButton
            @click="showAddChallenge = false"
            variant="white"
            class="flex-1"
          >
            Batal
          </UiButton>
          <UiButton
            @click="handleSaveChallenge"
            variant="accent"
            class="flex-2 bg-sky-500 hover:bg-sky-600"
          >
            Simpan
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>
