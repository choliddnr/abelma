
<script setup lang="ts">
import { ref } from 'vue';
import { useSubscription } from '~/composables/useSubscription';

// definePageMeta({
//   middleware: ["auth"]
// });

const { isPremium } = useSubscription();
const isLoading = ref(false);
const selectedPlan = ref('');

// Redirect if already premium
onMounted(() => {
  if (isPremium.value) {
    navigateTo('/parent');
  }
});

const checkout = async (plan: string) => {
  if (isLoading.value) return;
  isLoading.value = true;
  selectedPlan.value = plan;

  try {
    const response = await $fetch('/api/midtrans/checkout', {
      method: 'POST',
      body: { plan }
    });

    if (response.redirect_url) {
      window.location.href = response.redirect_url;
    }
  } catch (error) {
    console.error("Checkout failed", error);
    alert("Failed to initiate checkout. Please try again.");
  } finally {
    isLoading.value = false;
  }
};
</script>
<template>
  <!-- <div class="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-20"> -->
    <!-- <header class="p-6 flex items-center justify-between">
      <NuxtLink to="/parent" class="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
        <Icon name="lucide:arrow-left" class="w-6 h-6" />
        <span class="font-medium">Back to Dashboard</span>
      </NuxtLink>
    </header> -->

    <main class="glass-card max-w-4xl mx-auto px-6 pt-10 text-center">
      <div class="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-bold text-sm mb-6">
        <Icon name="lucide:star" class="w-5 h-5 fill-current" />
        ABELMA PREMIUM
      </div>

      <h1 class="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
        Buka <span class="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-500">Potensi Penuh</span> Anak Anda
      </h1>
      
      <p class="text-xl text-gray-600 max-w-2xl mx-auto mb-16">
        Dapatkan akses tak terbatas ke seluruh alfabet, tantangan lanjutan, semua buku cerita, dan laporan belajar yang detail.
      </p>

      <div class="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16 text-left">
        <div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden transition-transform hover:-translate-y-1">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Paket 1 Bulan</h3>
          <p class="text-gray-500 mb-6">Cocok untuk mencoba.</p>
          <div class="text-4xl font-black text-gray-900 mb-8">
            Rp 49.000
          </div>
          <ul class="space-y-4 mb-8">
            <li class="flex items-center gap-3 text-gray-700 font-medium">
              <Icon name="lucide:check-circle-2" class="w-6 h-6 text-green-500 shrink-0" />
              Huruf Alfabet Lengkap (A-Z)
            </li>
            <li class="flex items-center gap-3 text-gray-700 font-medium">
              <Icon name="lucide:check-circle-2" class="w-6 h-6 text-green-500 shrink-0" />
              Semua Buku Cerita & Permainan
            </li>
            <li class="flex items-center gap-3 text-gray-700 font-medium">
              <Icon name="lucide:check-circle-2" class="w-6 h-6 text-green-500 shrink-0" />
              Dashboard Laporan Orang Tua
            </li>
          </ul>
          <button 
            @click="checkout('monthly')"
            :disabled="isLoading"
            class="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50"
          >
            {{ isLoading && selectedPlan === 'monthly' ? 'Memproses...' : 'Beli Paket 1 Bulan' }}
          </button>
        </div>

        <div class="bg-gradient-to-b from-purple-600 to-blue-600 rounded-3xl p-8 shadow-2xl relative overflow-hidden transform md:-translate-y-4 transition-transform hover:-translate-y-5">
          <div class="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-black px-4 py-1 rounded-bl-xl uppercase tracking-wider">
            Paling Populer
          </div>
          <h3 class="text-2xl font-bold text-white mb-2">Paket 1 Tahun</h3>
          <p class="text-purple-200 mb-6">Nilai terbaik untuk belajar jangka panjang.</p>
          <div class="text-4xl font-black text-white mb-2">
            Rp 399.000
          </div>
          <div class="text-purple-200 text-sm font-medium mb-8">Hemat ~32% dibanding paket bulanan</div>
          <ul class="space-y-4 mb-8">
            <li class="flex items-center gap-3 text-white font-medium">
              <Icon name="lucide:check-circle-2" class="w-6 h-6 text-green-400 shrink-0" />
              Semua fitur di Paket 1 Bulan
            </li>
            <li class="flex items-center gap-3 text-white font-medium">
              <Icon name="lucide:check-circle-2" class="w-6 h-6 text-green-400 shrink-0" />
              Profil Anak Tak Terbatas
            </li>
            <li class="flex items-center gap-3 text-white font-medium">
              <Icon name="lucide:check-circle-2" class="w-6 h-6 text-green-400 shrink-0" />
              Dukungan Prioritas
            </li>
          </ul>
          <button 
            @click="checkout('yearly')"
            :disabled="isLoading"
            class="w-full bg-white hover:bg-gray-50 text-purple-700 font-black py-4 rounded-2xl shadow-lg transition-all disabled:opacity-50"
          >
            {{ isLoading && selectedPlan === 'yearly' ? 'Memproses...' : 'Beli Paket 1 Tahun' }}
          </button>
        </div>
      </div>
      
      <div class="text-gray-500 text-sm max-w-md mx-auto mb-5">
        Pembayaran diproses dengan aman melalui Midtrans. Kami menerima QRIS, GoPay, ShopeePay, Virtual Account, dan Kartu Kredit.
      </div>
    </main>
  <!-- </div> -->
</template>

