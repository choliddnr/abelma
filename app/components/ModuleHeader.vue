<script setup lang="ts">
interface Props {
  title: string;
  subtitle: string;
  icon?: string;
  iconType?: 'emoji' | 'icon';
  colorClass?: string;
  subtitleColorClass?: string;
  variant?: 'home' | 'module';
  animate?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  iconType: 'emoji',
  variant: 'module',
  animate: true,
  colorClass: 'text-indigo-600',
  subtitleColorClass: 'text-slate-500',
});

const isEmoji = computed(() => props.iconType === 'emoji');
</script>

<template>
  <div 
    class="text-center space-y-4 md:space-y-6 overflow-visible w-full max-w-4xl mx-auto"
    :class="[
      animate ? (variant === 'home' ? 'animate-float' : 'animate-entrance') : '',
      variant === 'home' ? 'mb-8 md:mb-20' : 'mb-8 md:mb-12',
      props.class
    ]"
  >
    <!-- Title Section for Module variant (Bubble Style) -->
    <div v-if="variant === 'module'" class="flex justify-center mb-6">
      <div class="relative group">
        <!-- Outer Glow/Halo -->
        <div class="absolute -inset-1 bg-gradient-to-r from-white/30 to-white/10 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div class="relative flex flex-col items-center gap-4 bg-white/50 px-10 py-2 md:px-16 md:py-4 rounded-[3rem] border-4 border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_60px_rgba(255,255,255,0.2)] transition-all duration-700 hover:-translate-y-2">
          <!-- Icon Bubble -->
           <div class="inline-flex items-center gap-6">
             <div v-if="icon" class="flex items-center justify-center bg-white/50 size-12 md:size-16 rounded-full shadow-inner border-2 border-white/80">
               <span v-if="isEmoji" class="text-xl md:text-4xl">
                 {{ icon }}
               </span>
               <Icon 
                 v-else 
                 :name="icon" 
                 class="text-xl md:text-4xl text-current"
                 :class="colorClass"
               />
             </div>
             
             <h1 
               class="text-2xl md:text-3xl lg:text-6xl font-black drop-shadow-[0_4px_4px_rgba(0,0,0,0.1)] font-quicksand tracking-tight text-current"
               :class="colorClass"
             >
               {{ title }}
             </h1>

           </div>
               <p 
          class="text-lg md:text-xl lg:text-2xl font-black leading-relaxed drop-shadow-sm tracking-wide text-slate-800"
          :class="subtitleColorClass"
        >
          <slot name="subtitle">
            {{ subtitle }}
          </slot>
        </p>

         
        </div>
    
      </div>
    </div> 

    <!-- Title Section for Home variant (Giant Vibrant Style) -->
    <div v-else class="relative mb-12">
      <div class="absolute inset-0 bg-blue-400/10 blur-[100px] rounded-full scale-150"></div>
      <h1 
        class="relative text-7xl md:text-[10rem] lg:text-[12rem] font-black text-white drop-shadow-[0_5px_0_rgba(79,70,229,1)] font-quicksand title-gradient tracking-tight leading-none animate-float-slow"
      >
        {{ title }}
      </h1>
    </div>

    <!-- Subtitle Section -->
    <div class="flex justify-center px-4 relative z-10">
      <div 
        v-if="variant === 'home'"
        class="text-2xl md:text-4xl font-black text-white drop-shadow-xl font-quicksand tracking-wide bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-xl inline-block px-12 py-6 md:px-20 md:py-8 rounded-[4rem] border-4 border-white shadow-[0_20px_60px_rgba(79,70,229,0.5)] hover:scale-110 transition-all duration-700 cursor-default animate-pulse-subtle"
      >
        {{ subtitle }}
      </div>
     
    </div>
  </div>
</template>

<style scoped>
.title-gradient {
  background: linear-gradient(to bottom, #ffffff 30%, #a5b4fc 70%, #6366f1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-slow {
  animation: float 8s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-20px) rotate(2deg); }
  66% { transform: translateY(10px) rotate(-1deg); }
}

.animate-entrance {
  opacity: 0;
  transform: scale(0.9) translateY(40px);
  animation: entrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes entrance {
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.animate-pulse-subtle {
  animation: pulseSubtle 4s ease-in-out infinite;
}

@keyframes pulseSubtle {
  0%, 100% { box-shadow: 0 20px 60px rgba(79, 70, 229, 0.5); }
  50% { box-shadow: 0 20px 80px rgba(79, 70, 229, 0.8); }
}
</style>