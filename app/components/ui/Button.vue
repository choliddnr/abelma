<script setup lang="ts">
interface Props {
  label?: string
  icon?: string
  iconPosition?: 'left' | 'right'
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'success' | 'white' | 'ghost' | 'soft' | 'none'
  to?: string | object
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  class?: any
}

const props = withDefaults(defineProps<Props>(), {
  iconPosition: 'left',
  variant: 'primary',
  type: 'button',
  class: ''
})

const variantClasses = {
  primary: 'bg-primary border-amber-500/50 text-amber-900',
  secondary: 'bg-secondary border-emerald-600/50 text-white',
  accent: 'bg-accent border-blue-600/50 text-white',
  danger: 'bg-danger border-rose-600/50 text-white',
  success: 'bg-emerald-500 border-emerald-600/50 text-white',
  soft: 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100/50',
  white: 'bg-white border-slate-200 text-slate-600',
  ghost: 'bg-transparent border-transparent hover:bg-slate-100/50 text-slate-500 shadow-none',
  none: ''
}

const baseClass = props.variant === 'none' ? '' : 'ui-capsule-interactive'
const componentClass = computed(() => [
  baseClass,
  variantClasses[props.variant] || variantClasses.primary,
  props.disabled || props.loading ? 'opacity-50 pointer-events-none' : '',
  props.class
].filter(Boolean).join(' '))

const componentType = computed(() => props.to ? defineNuxtLink({}) : 'button')
</script>

<template>
  <component
    :is="componentType"
    :to="to"
    :type="!to ? type : undefined"
    :disabled="disabled || loading"
    :class="componentClass"
  >
    <div v-if="loading" class="animate-spin mr-2">
      <span class="text-xl">⌛</span>
    </div>
    
    <template v-else>
      <span v-if="icon && iconPosition === 'left'" class="text-2xl">{{ icon }}</span>
      
      <slot>
        <span v-if="label" class="font-black uppercase tracking-wide">{{ label }}</span>
      </slot>
      
      <span v-if="icon && iconPosition === 'right'" class="text-2xl">{{ icon }}</span>
    </template>
  </component>
</template>

<style scoped>
.font-black {
  font-weight: 900;
}
</style>
