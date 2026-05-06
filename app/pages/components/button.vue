<script setup lang="ts">
const variants = [
  'primary',
  'secondary',
  'accent',
  'danger',
  'success',
  'soft',
  'white',
  'ghost',
  'glass'
] as const;

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

const iconPositions = ['left', 'right'] as const;
</script>

<template>
  <div class="p-8 max-w-7xl mx-auto space-y-12  min-h-screen">
    <header class="space-y-2">
      <h1 class="text-4xl font-black text-slate-900 tracking-tight">Button Component Showcase</h1>
      <p class="text-lg text-slate-600 font-medium">Standardized UI buttons with multiple variants and sizes.</p>
    </header>

    <!-- Variants Section -->
    <section class="space-y-6">
      <h2 class="text-2xl font-bold text-slate-800 border-b pb-2">Variants</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="variant in variants" :key="variant" class="p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center gap-4">
          <span class="text-sm font-bold text-slate-400 uppercase tracking-widest">{{ variant }}</span>
          <UiButton :variant="variant" :label="variant.charAt(0).toUpperCase() + variant.slice(1)" />
        </div>
      </div>
    </section>

    <!-- Sizes Section -->
    <section class="space-y-6">
      <h2 class="text-2xl font-bold text-slate-800 border-b pb-2">Sizes</h2>
      <div class="p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-wrap items-end gap-6 justify-center">
        <div v-for="size in sizes" :key="size" class="flex flex-col items-center gap-4">
          <span class="text-sm font-bold text-slate-400 uppercase tracking-widest">{{ size }}</span>
          <UiButton :size="size" label="Button" variant="primary" />
        </div>
      </div>
    </section>

    <!-- With Icons Section -->
    <section class="space-y-6">
      <h2 class="text-2xl font-bold text-slate-800 border-b pb-2">Icons & Positions</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-6">
          <h3 class="text-lg font-bold text-slate-700">Left Icon (Default)</h3>
          <div class="flex flex-wrap gap-4">
            <UiButton icon="lucide:plus" label="Add Item" variant="primary" />
            <UiButton icon="lucide:trash" label="Delete" variant="danger" />
            <UiButton icon="lucide:check" label="Success" variant="success" />
          </div>
        </div>
        <div class="p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-6">
          <h3 class="text-lg font-bold text-slate-700">Right Icon</h3>
          <div class="flex flex-wrap gap-4">
            <UiButton icon="lucide:arrow-right" icon-position="right" label="Next Step" variant="secondary" />
            <UiButton icon="lucide:download" icon-position="right" label="Download" variant="accent" />
          </div>
        </div>
      </div>
    </section>

    <!-- States Section -->
    <section class="space-y-6">
      <h2 class="text-2xl font-bold text-slate-800 border-b pb-2">States</h2>
      <div class="p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-wrap gap-8 justify-center">
        <div class="flex flex-col items-center gap-4">
          <span class="text-sm font-bold text-slate-400 uppercase tracking-widest">Normal</span>
          <UiButton label="Normal" variant="primary" />
        </div>
        <div class="flex flex-col items-center gap-4">
          <span class="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading</span>
          <UiButton loading label="Processing" variant="primary" />
        </div>
        <div class="flex flex-col items-center gap-4">
          <span class="text-sm font-bold text-slate-400 uppercase tracking-widest">Disabled</span>
          <UiButton disabled label="Not Allowed" variant="primary" />
        </div>
      </div>
    </section>

    <!-- Contextual Examples -->
    <section class="space-y-6">
      <h2 class="text-2xl font-bold text-slate-800 border-b pb-2">Contextual Examples</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Profile Card Mockup -->
        <div class="p-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-xl text-white space-y-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16/20 rounded-2xl backdrop-blur-md flex items-center justify-center text-3xl font-bold">A</div>
            <div>
              <h3 class="text-xl font-bold">Abelma User</h3>
              <p class="text-white/70">Level 12 • 4,500 Coins</p>
            </div>
          </div>
          <div class="flex gap-3">
            <UiButton variant="glass" size="sm" label="Settings" icon="lucide:settings" class="flex-1" />
            <UiButton variant="accent" size="sm" label="Play Now" icon="lucide:play" class="flex-1" />
          </div>
        </div>

        <!-- Alert Mockup -->
        <div class="p-8 rounded-3xl shadow-lg border border-slate-100 space-y-6">
          <div class="flex gap-4">
            <div class="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center">
              <Icon name="lucide:alert-triangle" size="24" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-slate-800">Delete Progress?</h3>
              <p class="text-slate-500">This action cannot be undone. All your stars will be lost.</p>
            </div>
          </div>
          <div class="flex gap-3 justify-end">
            <UiButton variant="ghost" size="sm" label="Cancel" />
            <UiButton variant="danger" size="sm" label="Yes, Delete" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Optional: specific demo styles if needed */
</style>