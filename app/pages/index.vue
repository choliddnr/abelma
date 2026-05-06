<script setup lang="ts">
import MenuCard from "~/components/MenuCard.vue";

const { profile } = storeToRefs(useProfileStore());

onMounted(() => {
  useAudio().play("home_greeting");
});

const menuItems = [
  {
    title: "Belajar Huruf",
    subtitle: "Mengenal A-Z",
    icon: "lucide:case-sensitive",
    colorClass: "bg-[#FFD93D] text-[#634E00]",
    to: "/alphabet",
  },
  {
    title: "Belajar Kata",
    subtitle: "Mengeja Benda",
    icon: "lucide:apple",
    colorClass: "bg-[#6BCB77] text-white",
    to: "/words",
  },
  {
    title: "Menulis Huruf",
    subtitle: "Mahir Menulis",
    icon: "lucide:pen",
    colorClass: "bg-[#e67e22] text-white",
    to: "/lettertrace",
  },
  {
    title: "Lab Kata",
    subtitle: "Gabungkan Bunyi",
    icon: "lucide:flask-conical",
    colorClass: "bg-[#A084E8] text-white",
    to: "/cvc",
  },
  {
    title: "Vokal Rangkap",
    subtitle: "Diftong & Vokal Ganda",
    icon: "lucide:audio-lines",
    colorClass: "bg-[#14B8A6] text-white",
    to: "/ddv",
  },
  {
    title: "Bunyi Sengau",
    subtitle: "Bunyi NG & NY",
    icon: "lucide:wind",
    colorClass: "bg-[#F97316] text-white",
    to: "/nasal",
  },
  {
    title: "Misi",
    subtitle: "Dapatkan Koin",
    icon: "lucide:star",
    colorClass: "bg-[#4D96FF] text-white",
    to: "/challenge",
  },
  {
    title: "Hadiah",
    subtitle: "Tukar Koinmu",
    icon: "lucide:gift",
    colorClass: "bg-[#FF8B8B] text-white",
    to: "/rewards",
  },
];
</script>

<template>
  <div class="relative min-h-screen w-full overflow-hidden pb-32">
    <!-- Underwater Background -->
    <div 
      class="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
      style="background-image: url('/bg_underwater.png')"
    >
      <div class="absolute inset-0 bg-blue-400/20 mix-blend-overlay"></div>
    </div>
    

    <!-- Main Content Container -->
    <div class="relative z-10 pt-10 md:pt-24">
      <ModuleHeader 
        variant="home" 
        :title="`Halo ${profile?.name}!`" 
        subtitle="Ayo kita belajar sambil bermain!" 
      />

      <!-- Menu Section with Pipe Background -->
       <div class="flex flex-wrap max-w-7xl mx-auto flex-row items-center justify-center gap-0 md:gap-7 lg:gap-10 relative">
         <MenuCard
            v-for="(item, index) in menuItems"
            :key="item.title"
            v-bind="item"
            :index="index"
            class="animate-entrance w-44"
            :style="{ animationDelay: `${index * 0.08}s` }"
          />
        </div>
       </div>
      <!-- <div class="relative pb-32">
        <div class="relative overflow-hidden rounded-[32px] border border-white/15 bg-cover bg-center bg-no-repeat p-4 md:p-6"
             style="background-image: url('/menu_pipes_bg.png');"> -->
          <!-- <div class="absolute inset-0 bg-slate-950/20"></div> -->
          <!-- <div class="relative"> -->
            <!-- <div class="mb-6 text-center">
              <p class="text-sm uppercase tracking-[0.3em] text-white/80 font-semibold md:text-base">
                Pilih Petualanganmu
              </p>
              <h2 class="mt-3 text-2xl md:text-4xl font-bold text-white drop-shadow-lg">
                Menu Belajar
              </h2>
            </div> -->

            <!-- <div class="menu-scroll overflow-x-auto pb-4 md:overflow-visible md:pb-0">
              <div class="flex gap-4 min-w-max md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:min-w-0">
                <MenuCard
                  v-for="(item, index) in menuItems"
                  :key="item.title"
                  v-bind="item"
                  class="animate-entrance w-[260px] min-w-[260px] md:w-auto md:min-w-0"
                  :style="{ animationDelay: `${index * 0.08}s` }"
                />
              </div>
            </div> -->
          <!-- </div> -->
        <!-- </div> -->
      <!-- </div>
    </div> -->
  </div>
</template>

<style scoped>
.title-gradient {
  background: linear-gradient(to bottom, #ffffff 40%, #e0e7ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.path-glow {
  filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.8));
  stroke-dasharray: 3000;
  stroke-dashoffset: 3000;
  animation: drawPath 4s ease-out forwards;
  opacity: 0.7;
}

@keyframes drawPath {
  to { stroke-dashoffset: 0; }
}

.animate-entrance {
  opacity: 0;
  transform: scale(0.5) translateY(50px);
  animation: entrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes entrance {
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-slow {
  animation: float 8s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(-20px) translateX(10px); }
}

.animate-bounce-subtle {
  animation: bounceSubtle 4s ease-in-out infinite;
}

@keyframes bounceSubtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>
